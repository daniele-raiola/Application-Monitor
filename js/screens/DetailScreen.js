/**
 * DetailScreen.js
 * Detailed view for a single application
 */

import { ROUTES, STATUS_COLORS, STATUS_PIPELINE } from '../utils/constants.js';
import { formatDate, getCountdownLabel, isUrgent, isCritical, daysUntil } from '../utils/date-utils.js';
import { advanceStatus, regressStatus, getApplicationById } from '../services/app-service.js';
import { DocumentChecklist } from '../components/DocumentChecklist.js';
import { ApplicationForm } from '../components/ApplicationForm.js';
import { Fab } from '../components/Fab.js';
import { toast } from '../components/Toast.js';
import { storage } from '../services/storage.js';
import { renderMarkdown } from '../utils/markdown.js';
import { confetti } from '../components/ConfettiEffect.js';

export class DetailScreen {
  constructor(router, appService) {
    this.router = router;
    this.appService = appService;
    this.fab = null;
    this.app = null;
    this.container = null;
  }

  /**
   * Get application ID from URL
   */
  getAppId() {
    const hash = window.location.hash;
    const match = hash.match(/#\/detail\/(.+)/);
    return match ? match[1] : null;
  }

  /**
   * Render the detail screen
   */
  render(container) {
    this.container = container;
    
    container.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
    });

    const screenEl = document.getElementById('detail-screen');
    screenEl.classList.add('screen--active');

    const appId = this.getAppId();
    
    if (!appId) {
      screenEl.innerHTML = `
        <div class="detail-empty">
          <p>No application selected</p>
          <button class="btn btn--primary" onclick="window.location.hash='#/applications'">Back to Applications</button>
        </div>
      `;
      return;
    }

    this.app = this.appService.getApplicationById(appId);
    
    if (!this.app) {
      screenEl.innerHTML = `
        <div class="detail-empty">
          <p>Application not found</p>
          <button class="btn btn--primary" onclick="window.location.hash='#/applications'">Back to Applications</button>
        </div>
      `;
      return;
    }

    this.renderContent();
    this.setupFab();
  }

  /**
   * Render the application content
   */
  renderContent() {
    const app = this.app;
    const screenEl = document.getElementById('detail-screen');
    
    const deadline = app.submissionDeadline;
    const hasDeadline = deadline && deadline.length > 0;
    const countdown = hasDeadline ? getCountdownLabel(deadline) : null;
    const urgent = hasDeadline && isUrgent(deadline);
    const critical = hasDeadline && isCritical(deadline);
    const previousStatus = app.statusHistory?.length > 1 ? app.statusHistory[app.statusHistory.length - 2]?.status : null;

    screenEl.innerHTML = `
      <div class="detail-header">
        <button class="detail-back-btn" id="detail-back">←</button>
        <div class="detail-header__content">
          <div class="detail-header__university">${app.universityName || 'Unknown University'}</div>
          <div class="detail-header__program">${app.programName || 'PhD Program'}</div>
          <span class="detail-header__status" 
                style="background-color: ${STATUS_COLORS[app.status]}">${app.status}</span>
        </div>
        <button class="detail-edit-btn" id="detail-edit" title="Edit Application">✎</button>
      </div>

      <!-- Deadline Section -->
      ${hasDeadline ? `
      <div class="detail-section">
        <div class="detail-section__title">Deadline</div>
        <div class="detail-section__content">
          <div class="detail-countdown ${critical ? 'detail-countdown--critical' : urgent ? 'detail-countdown--warning' : ''}">
            ${countdown}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Details Section -->
      <div class="detail-section">
        <div class="detail-section__title">Details</div>
        <div class="detail-section__content">
          ${app.department ? `
          <div class="detail-field">
            <span class="detail-field__label">Department</span>
            <span class="detail-field__value">${app.department}</span>
          </div>
          ` : ''}
          ${app.country ? `
          <div class="detail-field">
            <span class="detail-field__label">Country</span>
            <span class="detail-field__value">${app.country}</span>
          </div>
          ` : ''}
          ${app.submissionDeadline ? `
          <div class="detail-field">
            <span class="detail-field__label">Submission Deadline</span>
            <span class="detail-field__value">${formatDate(app.submissionDeadline, 'long')}</span>
          </div>
          ` : ''}
          ${app.resultsPublicationDate ? `
          <div class="detail-field">
            <span class="detail-field__label">Results</span>
            <span class="detail-field__value">${formatDate(app.resultsPublicationDate, 'long')}</span>
          </div>
          ` : ''}
          ${app.interviewDate ? `
          <div class="detail-field">
            <span class="detail-field__label">Interview</span>
            <span class="detail-field__value">${formatDate(app.interviewDate, 'long')}</span>
          </div>
          ` : ''}
          ${app.oralExamDate ? `
          <div class="detail-field">
            <span class="detail-field__label">Oral Exam</span>
            <span class="detail-field__value">${formatDate(app.oralExamDate, 'long')}</span>
          </div>
          ` : ''}
          ${app.applicationPortalURL ? `
          <div class="detail-field">
            <span class="detail-field__label">Portal</span>
            <span class="detail-field__value">
              <a href="${app.applicationPortalURL}" target="_blank" rel="noopener">Open Portal ↗</a>
            </span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Tags Section -->
      ${app.tags && app.tags.length > 0 ? `
      <div class="detail-section">
        <div class="detail-section__title">Tags</div>
        <div class="detail-section__content">
          <div class="detail-tags">
            ${app.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Document Checklist Section -->
      <div class="detail-section">
        <div class="detail-section__title">Documents</div>
        <div class="detail-section__content">
          <div id="document-checklist"></div>
        </div>
      </div>

      <!-- Notes Section -->
      ${app.notes && app.notes.length > 0 ? `
      <div class="detail-section">
        <div class="detail-section__title">Notes</div>
        <div class="detail-section__content">
          <div class="detail-notes">${this.renderNotes(app.notes)}</div>
        </div>
      </div>
      ` : ''}

      <!-- Status History Section -->
      <div class="detail-section">
        <div class="detail-section__title">Status History</div>
        <div class="detail-section__content">
          <div class="detail-timeline" id="status-timeline"></div>
        </div>
      </div>

      <!-- Status Stepper -->
      <div class="detail-section">
        <div class="detail-section__title">Change Status</div>
        <div class="detail-section__content">
          <div class="detail-stepper" id="detail-stepper"></div>
        </div>
      </div>
    `;

    // Render checklist
    this.renderChecklist();

    // Render timeline
    this.renderTimeline();

    // Render status stepper
    this.renderStatusStepper();

    // Setup back button
    document.getElementById('detail-back')?.addEventListener('click', () => {
      window.location.hash = '#/applications';
    });

    // Setup edit button
    document.getElementById('detail-edit')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('fab:edit-application', { detail: { appId: this.app.id } }));
    });
  }

  /**
   * Render notes with markdown
   */
  renderNotes(notes) {
    return renderMarkdown(notes);
  }

  /**
   * Render document checklist
   */
  renderChecklist() {
    const container = document.getElementById('document-checklist');
    if (!container) return;

    const checklist = new DocumentChecklist(this.app.id, this.app.requiredDocuments || [], {
      onChange: () => {
        this.app = this.appService.getApplicationById(this.app.id);
        this.renderContent();
        this.updateStats();
      }
    });

    container.appendChild(checklist.render());
  }

  /**
   * Render status timeline
   */
  renderTimeline() {
    const container = document.getElementById('status-timeline');
    if (!container) return;

    const history = this.app.statusHistory || [];
    
    if (history.length === 0) {
      container.innerHTML = '<p class="detail-empty">No history yet</p>';
      return;
    }

    const sortedHistory = [...history].reverse();
    const currentIndex = STATUS_PIPELINE.indexOf(this.app.status);

    container.innerHTML = sortedHistory.map((event, index) => {
      const isActive = index === 0;
      return `
        <div class="detail-timeline__item">
          <div class="detail-timeline__dot ${isActive ? 'detail-timeline__dot--active' : ''}"></div>
          <div class="detail-timeline__content">
            <div class="detail-timeline__status">${event.status}</div>
            <div class="detail-timeline__date">${formatDate(event.timestamp, 'medium')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render status stepper
   */
  renderStatusStepper() {
    const container = document.getElementById('detail-stepper');
    if (!container) return;

    const statusIndex = STATUS_PIPELINE.indexOf(this.app.status);
    const canAdvance = statusIndex < STATUS_PIPELINE.length - 1;
    const canRegress = statusIndex > 0;

    container.innerHTML = `
      <div class="status-stepper">
        <button class="btn btn--secondary" id="stepper-regress" ${!canRegress ? 'disabled' : ''}>
          ← Previous
        </button>
        <span class="status-stepper__current">${this.app.status}</span>
        <button class="btn btn--primary" id="stepper-advance" ${!canAdvance ? 'disabled' : ''}>
          Next →
        </button>
      </div>
    `;

    document.getElementById('stepper-regress')?.addEventListener('click', () => {
      this.handleRegress();
    });

    document.getElementById('stepper-advance')?.addEventListener('click', () => {
      this.handleAdvance();
    });
  }

  /**
   * Handle status advance
   */
  handleAdvance() {
    const wasAccepted = this.app.status === 'Accepted';
    const success = advanceStatus(this.app.id);
    
    if (success) {
      this.app = this.appService.getApplicationById(this.app.id);
      
      if (this.app.status === 'Accepted' && !wasAccepted) {
        toast.success('Congratulations! Accepted!');
        confetti.fireworks();
      } else {
        toast.success('Status updated!');
      }
      
      this.renderContent();
      this.updateStats();
    }
  }

  /**
   * Handle status regress
   */
  handleRegress() {
    const success = regressStatus(this.app.id);
    
    if (success) {
      toast.info('Status reverted');
      this.app = this.appService.getApplicationById(this.app.id);
      this.renderContent();
      this.updateStats();
    }
  }

  /**
   * Update stats
   */
  updateStats() {
    const apps = this.appService.getAllApplications();
    const stats = storage.getStats();
    
    stats.totalAdded = apps.length;
    stats.totalSubmitted = apps.filter(a => a.status === 'Submitted').length;
    stats.totalAccepted = apps.filter(a => a.status === 'Accepted').length;
    
    storage.updateStats(stats);
  }

  /**
   * Setup FAB - disabled for now
   */
  setupFab() {
    // FAB disabled
  }
}