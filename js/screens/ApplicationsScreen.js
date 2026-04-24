/**
 * ApplicationsScreen.js
 * Applications list screen controller
 */

import { ROUTES, STATUS_PIPELINE } from '../utils/constants.js';
import { advanceStatus, regressStatus, deleteApplication, getAllApplications } from '../services/app-service.js';
import { AppCard } from '../components/AppCard.js';
import { Fab } from '../components/Fab.js';
import { toast } from '../components/Toast.js';
import { ApplicationForm } from '../components/ApplicationForm.js';
import { storage } from '../services/storage.js';

export class ApplicationsScreen {
  constructor(router, appService) {
    this.router = router;
    this.appService = appService;
    this.fab = null;
    this.filterStatus = 'all';
    this.sortBy = 'deadline-asc';
    this.container = null;
    this.listContainer = null;
  }

  /**
   * Render the Applications screen
   */
  render(container) {
    this.container = container;
    
    // Clear screens
    container.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
    });

    const screenEl = document.getElementById('applications-screen');
    screenEl.classList.add('screen--active');

    screenEl.innerHTML = `
      <div class="screen-header">
        <h1 class="screen-title">Applications</h1>
        <span class="screen-count" id="app-count">0</span>
      </div>
      <div id="filter-bar" class="filter-bar"></div>
      <div id="applications-list" class="applications-list"></div>
      <div id="empty-state" class="empty-state" style="display: none;">
        <div class="empty-state__illustration">📋</div>
        <h2 class="empty-state__title">No applications yet</h2>
        <p class="empty-state__text">Tap the + button to add your first PhD application.</p>
      </div>
    `;

    this.listContainer = document.getElementById('applications-list');
    this.renderFilterBar();
    this.renderApplicationsList();
    this.setupFab();
    this.setupEventListeners();
  }

  /**
   * Render the filter/sort bar
   */
  renderFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

    // Status filter chips
    const statusFilters = ['all', ...STATUS_PIPELINE];
    
    let chipsHTML = statusFilters.map(status => {
      const isActive = this.filterStatus === status;
      const label = status === 'all' ? 'All' : status;
      return `
        <button class="filter-chip ${isActive ? 'filter-chip--active' : ''}" 
                data-status="${status}"
                style="min-height: 44px;">
          ${label}
        </button>
      `;
    }).join('');

    filterBar.innerHTML = `
      <div class="filter-chips">${chipsHTML}</div>
      <select id="sort-select" class="sort-select">
        <option value="deadline-asc" ${this.sortBy === 'deadline-asc' ? 'selected' : ''}>Deadline ↑</option>
        <option value="deadline-desc" ${this.sortBy === 'deadline-desc' ? 'selected' : ''}>Deadline ↓</option>
        <option value="name-asc" ${this.sortBy === 'name-asc' ? 'selected' : ''}>Name A-Z</option>
        <option value="name-desc" ${this.sortBy === 'name-desc' ? 'selected' : ''}>Name Z-A</option>
        <option value="status" ${this.sortBy === 'status' ? 'selected' : ''}>Status</option>
      </select>
    `;

    // Add event listeners
    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.filterStatus = chip.dataset.status;
        this.renderFilterBar();
        this.renderApplicationsList();
      });
    });

    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderApplicationsList();
    });
  }

  /**
   * Render the applications list
   */
  renderApplicationsList() {
    const apps = this.appService.getAllApplications();
    
    // Filter
    let filteredApps = apps;
    if (this.filterStatus !== 'all') {
      filteredApps = apps.filter(app => app.status === this.filterStatus);
    }

    // Sort
    filteredApps = this.sortApplications(filteredApps);

    // Update count
    const countEl = document.getElementById('app-count');
    if (countEl) {
      countEl.textContent = filteredApps.length;
    }

    // Show/hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = filteredApps.length === 0 ? 'flex' : 'none';
    }

    // Clear list
    if (this.listContainer) {
      this.listContainer.innerHTML = '';
      
      // Render cards with staggered animation
      filteredApps.forEach((app, index) => {
        const card = new AppCard(app, {
          onAdvance: (id) => this.handleAdvance(id),
          onRegress: (id) => this.handleRegress(id),
          onDelete: (id) => this.handleDelete(id),
          onTap: (id) => this.handleTap(id)
        });
        
        const cardEl = card.render();
        cardEl.style.animationDelay = `${index * 50}ms`;
        this.listContainer.appendChild(cardEl);
      });
    }
  }

  /**
   * Sort applications
   */
  sortApplications(apps) {
    const sorted = [...apps];
    
    switch (this.sortBy) {
      case 'deadline-asc':
        sorted.sort((a, b) => (a.submissionDeadline || '').localeCompare(b.submissionDeadline || ''));
        break;
      case 'deadline-desc':
        sorted.sort((a, b) => (b.submissionDeadline || '').localeCompare(a.submissionDeadline || ''));
        break;
      case 'name-asc':
        sorted.sort((a, b) => (a.universityName || '').localeCompare(b.universityName || ''));
        break;
      case 'name-desc':
        sorted.sort((a, b) => (b.universityName || '').localeCompare(a.universityName || ''));
        break;
      case 'status':
        sorted.sort((a, b) => STATUS_PIPELINE.indexOf(a.status) - STATUS_PIPELINE.indexOf(b.status));
        break;
    }
    
    return sorted;
  }

  /**
   * Setup FAB
   */
  setupFab() {
    // FAB disabled for now - will re-enable after app is working
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    window.addEventListener('fab:add-application', () => {
      this.openAddForm();
    });

    window.addEventListener('fab:edit-application', (e) => {
      const appId = e.detail.appId;
      const app = this.appService.getApplicationById(appId);
      if (app) {
        this.openEditForm(app);
      }
    });
  }

  /**
   * Handle status advance
   */
  handleAdvance(id) {
    const success = this.appService.advanceStatus(id);
    if (success) {
      toast.success('Status updated!');
      this.renderApplicationsList();
      this.updateStats();
    }
  }

  /**
   * Handle status regress
   */
  handleRegress(id) {
    const success = this.appService.regressStatus(id);
    if (success) {
      toast.info('Status reverted');
      this.renderApplicationsList();
      this.updateStats();
    }
  }

  /**
   * Handle delete
   */
  handleDelete(id) {
    if (confirm('Delete this application?')) {
      const success = this.appService.deleteApplication(id);
      if (success) {
        toast.info('Application deleted');
        this.renderApplicationsList();
        this.updateStats();
      }
    }
  }

  /**
   * Handle card tap - navigate to detail
   */
  handleTap(id) {
    this.router.navigate(`#/detail/${id}`);
  }

  /**
   * Open add form
   */
  openAddForm() {
    new ApplicationForm(null, () => {
      this.renderApplicationsList();
      this.updateStats();
    }).open();
  }

  /**
   * Open edit form
   */
  openEditForm(app) {
    new ApplicationForm(app, () => {
      this.renderApplicationsList();
      this.updateStats();
    }).open();
  }

  /**
   * Update stats
   */
  updateStats() {
    const stats = storage.getStats();
    const apps = this.appService.getAllApplications();
    
    stats.totalAdded = apps.length;
    stats.totalSubmitted = apps.filter(a => a.status === 'Submitted').length;
    stats.totalAccepted = apps.filter(a => a.status === 'Accepted').length;
    
    storage.updateStats(stats);
  }
}