/**
 * AppCard.js
 * Renders a single application card with status, countdown, and actions
 */

import { STATUS_COLORS, STATUS_PIPELINE } from '../utils/constants.js';
import { getCountdownLabel, isUrgent, isCritical } from '../utils/date-utils.js';

export class AppCard {
  constructor(application, options = {}) {
    this.app = application;
    this.onAdvance = options.onAdvance || (() => {});
    this.onRegress = options.onRegress || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onTap = options.onTap || (() => {});
  }

  /**
   * Render the application card
   */
  render() {
    const app = this.app;
    const statusIndex = STATUS_PIPELINE.indexOf(app.status);
    const canAdvance = statusIndex < STATUS_PIPELINE.length - 1;
    const canRegress = statusIndex > 0;
    const deadline = app.submissionDeadline;
    const hasDeadline = deadline && deadline.length > 0;
    const countdown = hasDeadline ? getCountdownLabel(deadline) : null;
    const urgent = hasDeadline && isUrgent(deadline);
    const critical = hasDeadline && isCritical(deadline);
    const isTerminal = app.status === 'Accepted' || app.status === 'Rejected';
    const isAccepted = app.status === 'Accepted';

    // Calculate document completion
    const docs = app.requiredDocuments || [];
    const completedDocs = docs.filter(d => d.completed).length;
    const progressPercent = docs.length > 0 ? (completedDocs / docs.length) * 100 : 0;

    const card = document.createElement('div');
    card.className = 'app-card';
    if (isAccepted) card.classList.add('app-card--accepted');
    if (app.status === 'Rejected') card.classList.add('app-card--rejected');
    card.dataset.id = app.id;

    // Header with university and status chip
    const header = document.createElement('div');
    header.className = 'app-card__header';
    
    const titleArea = document.createElement('div');
    titleArea.className = 'app-card__title';
    
    const university = document.createElement('div');
    university.className = 'app-card__university';
    university.textContent = app.universityName || 'Unknown University';
    
    const program = document.createElement('div');
    program.className = 'app-card__program';
    program.textContent = app.programName || 'PhD Program';
    
    titleArea.appendChild(university);
    titleArea.appendChild(program);
    
    const statusChip = document.createElement('span');
    statusChip.className = 'app-card__status-chip';
    statusChip.dataset.status = app.status.toLowerCase().replace(' ', '-');
    statusChip.textContent = app.status;
    statusChip.style.backgroundColor = STATUS_COLORS[app.status];
    
    header.appendChild(titleArea);
    header.appendChild(statusChip);
    card.appendChild(header);

    // Meta info
    const meta = document.createElement('div');
    meta.className = 'app-card__meta';
    
    if (app.country) {
      const country = document.createElement('span');
      country.className = 'app-card__meta-item';
      country.textContent = app.country;
      meta.appendChild(country);
    }
    
    if (app.department) {
      const dept = document.createElement('span');
      dept.className = 'app-card__meta-item';
      dept.textContent = app.department;
      meta.appendChild(dept);
    }
    
    if (docs.length > 0) {
      const docsInfo = document.createElement('span');
      docsInfo.className = 'app-card__meta-item';
      docsInfo.textContent = `${completedDocs}/${docs.length} docs`;
      meta.appendChild(docsInfo);
    }
    
    if (meta.children.length > 0) {
      card.appendChild(meta);
    }

    // Countdown badge (if deadline exists)
    if (hasDeadline && countdown) {
      const countdownBadge = document.createElement('div');
      countdownBadge.className = 'app-card__countdown';
      if (critical) {
        countdownBadge.classList.add('app-card__countdown--critical');
      } else if (urgent) {
        countdownBadge.classList.add('app-card__countdown--warning');
      }
      countdownBadge.textContent = countdown;
      card.appendChild(countdownBadge);
    }

    // Document progress bar
    if (docs.length > 0) {
      const progressBar = document.createElement('div');
      progressBar.className = 'app-card__progress-bar';
      const progressFill = document.createElement('div');
      progressFill.className = 'app-card__progress-fill';
      progressFill.style.width = `${progressPercent}%`;
      progressBar.appendChild(progressFill);
      card.appendChild(progressBar);
    }

    // Actions area
    const actions = document.createElement('div');
    actions.className = 'app-card__actions';
    
    const stepper = document.createElement('div');
    stepper.className = 'app-card__stepper';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'app-card__stepper-btn';
    prevBtn.textContent = '←';
    prevBtn.title = 'Previous status';
    prevBtn.disabled = !canRegress;
    if (canRegress) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onRegress(app.id);
      });
    }
    stepper.appendChild(prevBtn);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'app-card__stepper-btn';
    nextBtn.textContent = '→';
    nextBtn.title = 'Next status';
    nextBtn.disabled = !canAdvance;
    if (canAdvance) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onAdvance(app.id);
      });
    }
    stepper.appendChild(nextBtn);
    
    actions.appendChild(stepper);
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'app-card__detail-link';
    viewBtn.textContent = 'View Details';
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onTap(app.id);
    });
    actions.appendChild(viewBtn);
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'app-card__delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete application';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onDelete(app.id);
    });
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);

    // Event listeners for tap
    card.addEventListener('click', () => this.onTap(app.id));

    // Touch swipe handling
    this.setupSwipeHandlers(card);

    return card;
  }

  /**
   * Setup touch swipe handlers
   */
  setupSwipeHandlers(card) {
    let startX = 0;
    let currentX = 0;
    let isSwipe = false;
    const threshold = 50;

    card.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwipe = false;
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      const diff = Math.abs(currentX - startX);
      if (diff > 10) {
        isSwipe = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      if (!isSwipe) return;
      
      const diff = currentX - startX;
      if (diff > threshold) {
        // Swipe right - advance status
        const statusIndex = STATUS_PIPELINE.indexOf(this.app.status);
        if (statusIndex < STATUS_PIPELINE.length - 1) {
          this.onAdvance(this.app.id);
        }
      } else if (diff < -threshold) {
        // Swipe left - delete
        this.onDelete(this.app.id);
      }
    }, { passive: true });
  }
}