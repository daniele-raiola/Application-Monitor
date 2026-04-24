/**
 * DashboardScreen.js
 * Dashboard screen controller
 * Shows stats, progress, streak, and upcoming deadlines
 */

import { ROUTES, STATUS_PIPELINE, STATUS_COLORS } from '../utils/constants.js';
import { computeStats, checkStreak } from '../services/stats-service.js';
import { getUpcomingEvents } from '../services/calendar-service.js';
import { getTodayISO, formatDate, getCountdownLabel, daysUntil } from '../utils/date-utils.js';
import { storage } from '../services/storage.js';

export class DashboardScreen {
  constructor(router, appService, statsService, calendarService) {
    this.router = router;
    this.appService = appService;
    this.statsService = statsService;
    this.calendarService = calendarService;
  }

  render(container) {
    container.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
    });

    const screenEl = document.getElementById('dashboard-screen');
    screenEl.classList.add('screen--active');

    this.renderContent();
  }

  renderContent() {
    const screenEl = document.getElementById('dashboard-screen');
    const apps = this.appService.getAllApplications();
    const settings = storage.getSettings();
    const checked = checkStreak(settings);
    const stats = computeStats(apps, settings);
    const events = getUpcomingEvents(apps, 5);

    const streakDays = checked.streakDays || 0;
    const streakBadge = streakDays > 0 
      ? `<span class="streak-badge">🔥 ${streakDays === 1 ? '1 day streak' : streakDays + ' day streak'}</span>`
      : `<span class="streak-badge streak-badge--inactive">Start your streak!</span>`;

    let statsHTML = '';
    if (apps.length === 0) {
      statsHTML = `
        <div class="dashboard__empty">
          <p>No applications yet</p>
          <button class="btn btn--primary" onclick="window.location.hash='#/applications'">
            Add Your First Application
          </button>
        </div>
      `;
    } else {
      statsHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__value">${stats.total}</div>
            <div class="stat-card__label">Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value stat-card__value--success">${stats.totalSubmitted}</div>
            <div class="stat-card__label">Submitted</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value stat-card__value--warning">${stats.byStatus['Under Review'] || 0}</div>
            <div class="stat-card__label">In Review</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value stat-card__value--gold">${stats.totalAccepted}</div>
            <div class="stat-card__label">Accepted</div>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-label">
            <span>Submission Progress</span>
            <span>${stats.submissionRate}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.submissionRate}%"></div>
          </div>
        </div>
      `;
    }

    let breakdownHTML = '';
    if (apps.length > 0) {
      const statusCounts = {};
      STATUS_PIPELINE.forEach(status => {
        statusCounts[status] = apps.filter(app => app.status === status).length;
      });

      breakdownHTML = `
        <div class="status-bars">
          ${STATUS_PIPELINE.map(status => {
            const count = statusCounts[status];
            const percent = apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
            return `
              <div class="status-bar">
                <div class="status-bar__label">
                  <span>${status}</span>
                  <span>${count}</span>
                </div>
                <div class="status-bar__track">
                  <div class="status-bar__fill" style="width: ${percent}%; background-color: ${STATUS_COLORS[status]}"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    let upcomingHTML = '';
    if (events.length === 0) {
      upcomingHTML = `
        <div class="dashboard__empty">
          <p>No upcoming deadlines</p>
        </div>
      `;
    } else {
      upcomingHTML = `
        <div class="deadline-list">
          ${events.map(event => {
            const days = daysUntil(event.date);
            const urgent = days >= 0 && days <= 7;
            const critical = days >= 0 && days <= 3;
            return `
              <button class="deadline-card" onclick="window.location.hash='#/detail/${event.applicationId}'">
                <div class="deadline-card__date ${critical ? 'deadline-card__date--critical' : urgent ? 'deadline-card__date--warning' : ''}">
                  ${formatDate(event.date, 'short')}
                </div>
                <div class="deadline-card__content">
                  <div class="deadline-card__uni">${event.universityName}</div>
                  <div class="deadline-card__countdown ${critical ? 'deadline-card__countdown--critical' : urgent ? 'deadline-card__countdown--warning' : ''}">
                    ${getCountdownLabel(event.date)}
                  </div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    screenEl.innerHTML = `
      <div class="screen--dashboard">
        <div class="dashboard__header">
          <div class="dashboard__greeting">
            <span class="dashboard__hello">Welcome back!</span>
            ${streakBadge}
          </div>
        </div>

        <section class="dashboard__section">
          <h2 class="dashboard__section-title">Your Progress</h2>
          <div class="dashboard__stats" id="dashboard-stats">${statsHTML}</div>
        </section>

        <section class="dashboard__section">
          <h2 class="dashboard__section-title">Status Breakdown</h2>
          <div class="dashboard__breakdown" id="dashboard-breakdown">${breakdownHTML}</div>
        </section>

        <section class="dashboard__section">
          <h2 class="dashboard__section-title">Upcoming Deadlines</h2>
          <div class="dashboard__upcoming" id="dashboard-upcoming">${upcomingHTML}</div>
        </section>
      </div>
    `;
  }
}