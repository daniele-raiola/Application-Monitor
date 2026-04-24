/**
 * BottomNav.js
 * Bottom navigation bar component
 * Renders 4 tabs: Dashboard, Applications, Calendar, Settings
 */

import { ROUTES } from '../utils/constants.js';

export class BottomNav {
  constructor(router) {
    this.router = router;
    this.container = document.getElementById('bottom-nav');
    this.tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: '⬡', route: ROUTES.DASHBOARD },
      { id: 'applications', label: 'Applications', icon: '📋', route: ROUTES.APPLICATIONS },
      { id: 'calendar', label: 'Calendar', icon: '📅', route: ROUTES.CALENDAR },
      { id: 'settings', label: 'Settings', icon: '⚙️', route: ROUTES.SETTINGS }
    ];
    this.render();
    this.setupListeners();
  }

  /**
   * Render the bottom nav
   */
  render() {
    this.container.innerHTML = '';

    this.tabs.forEach((tab, index) => {
      const button = document.createElement('button');
      button.className = `bottom-nav__tab ${this.router.isRoute(tab.route) ? 'bottom-nav__tab--active' : ''}`;
      button.setAttribute('data-route', tab.route);
      button.setAttribute('aria-label', tab.label);
      button.innerHTML = `
        <div class="bottom-nav__tab-icon">${tab.icon}</div>
        <div class="bottom-nav__tab-label">${tab.label}</div>
      `;

      button.addEventListener('click', () => {
        this.router.navigate(tab.route);
        this.updateActive();
      });

      this.container.appendChild(button);
    });

    // Add indicator pill at the end
    const indicator = document.createElement('div');
    indicator.className = 'bottom-nav__indicator';
    this.container.appendChild(indicator);
  }

  /**
   * Setup listeners for route changes
   */
  setupListeners() {
    this.router.onNavigate = () => {
      this.updateActive();
    };
  }

  /**
   * Update active tab styling
   */
  updateActive() {
    const buttons = this.container.querySelectorAll('.bottom-nav__tab');
    buttons.forEach((btn) => {
      const route = btn.getAttribute('data-route');
      if (this.router.isRoute(route)) {
        btn.classList.add('bottom-nav__tab--active');
      } else {
        btn.classList.remove('bottom-nav__tab--active');
      }
    });
  }
}
