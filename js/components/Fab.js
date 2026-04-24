/**
 * Fab.js
 * Floating Action Button - Simple and working
 */

import { ROUTES } from '../utils/constants.js';

export class Fab {
  constructor(router, onClickCallback) {
    this.router = router;
    this.onClickCallback = onClickCallback;
    this.fabEl = null;
  }
  
  update(route) {
    if (route === ROUTES.DASHBOARD || route === ROUTES.SETTINGS) {
      this.hide();
      return;
    }
    this.show(route);
  }

  show(route) {
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
    }
    
    let title = 'Add';
    let action = null;
    
    if (route === ROUTES.APPLICATIONS || route.startsWith('#/applications')) {
      title = 'Add Application';
      action = () => this.onClickCallback && this.onClickCallback('applications');
    } else if (route === ROUTES.CALENDAR || route.startsWith('#/calendar')) {
      title = 'Add Deadline';
      action = () => this.onClickCallback && this.onClickCallback('calendar');
    } else if (route.startsWith('#/detail/')) {
      title = 'Edit';
      action = () => this.onClickCallback && this.onClickCallback('detail');
    }
    
    if (!action) return;
    
    this.fabEl = document.createElement('button');
    this.fabEl.className = 'fab';
    this.fabEl.type = 'button';
    this.fabEl.title = title;
    this.fabEl.textContent = '+';
    this.fabEl.onclick = action;
    document.body.appendChild(this.fabEl);
  }

  hide() {
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
      this.fabEl = null;
    }
  }
  
  destroy() {
    this.hide();
  }
}

  /**
   * Get FAB configuration based on current route
   */
  getConfig() {
    const route = this.currentRoute;
    
    // Dashboard: no FAB
    if (route === ROUTES.DASHBOARD) {
      return null;
    }
    
    // Applications: Add new
    if (route === ROUTES.APPLICATIONS || route.startsWith('#/applications')) {
      return {
        icon: '+',
        title: 'Add Application',
        action: () => this.onClickCallback ? this.onClickCallback('applications') : null
      };
    }
    
    // Calendar: Add deadline
    if (route === ROUTES.CALENDAR || route.startsWith('#/calendar')) {
      return {
        icon: '+',
        title: 'Add Deadline',
        action: () => this.onClickCallback ? this.onClickCallback('calendar') : null
      };
    }
    
    // Detail: Edit
    if (route.startsWith('#/detail/')) {
      return {
        icon: '✏️',
        title: 'Edit Application',
        action: () => this.onClickCallback ? this.onClickCallback('detail') : null
      };
    }
    
    // Settings: no FAB
    if (route === ROUTES.SETTINGS) {
      return null;
    }
    
    return null;
  }

  /**
   * Get application ID from detail route
   */
  getDetailId() {
    const match = this.currentRoute.match(/#\/detail\/(.+)/);
    return match ? match[1] : null;
  }

  /**
   * Update FAB visibility based on current route
   */
  updateVisibility() {
    const config = this.getConfig();
    
    if (!config) {
      this.hide();
      return;
    }
    
    this.show(config);
  }

  /**
   * Show the FAB
   */
  show(config) {
    // Always remove old FAB
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
    }
    
    // Create new FAB
    this.fabEl = document.createElement('button');
    this.fabEl.className = 'fab';
    this.fabEl.id = 'main-fab';
    this.fabEl.type = 'button';
    this.fabEl.title = config.title;
    this.fabEl.textContent = config.icon;
    
    // Handle click
    this.fabEl.onclick = (e) => {
      if (config.action) {
        config.action();
      }
    };
    
    document.body.appendChild(this.fabEl);
  }

  /**
   * Hide the FAB
   */
  hide() {
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
      this.fabEl = null;
    }
  }

  /**
   * Remove FAB from DOM
   */
  destroy() {
    window.removeEventListener('hashchange', this.hashListener);
    this.hide();
    this.fabEl = null;
  }
}

  /**
   * Get FAB configuration based on current route
   */
  getConfig() {
    const route = this.currentRoute;
    
    // Dashboard: no FAB
    if (route === ROUTES.DASHBOARD) {
      return null;
    }
    
    // Applications: Add new
    if (route === ROUTES.APPLICATIONS || route.startsWith('#/applications')) {
      return {
        icon: '+',
        title: 'Add Application',
        action: () => {
          // Use callback if provided
          if (this.onClickCallback) {
            this.onClickCallback('applications');
          } else {
            window.dispatchEvent(new CustomEvent('fab:add-application'));
          }
        }
      };
    }
    
    // Calendar: Add deadline
    if (route === ROUTES.CALENDAR || route.startsWith('#/calendar')) {
      return {
        icon: '+',
        title: 'Add Deadline',
        action: () => {
          if (this.onClickCallback) {
            this.onClickCallback('calendar');
          } else {
            window.dispatchEvent(new CustomEvent('fab:add-deadline'));
          }
        }
      };
    }
    
    // Detail: Edit
    if (route.startsWith('#/detail/')) {
      return {
        icon: '✏️',
        title: 'Edit Application',
        action: () => {
          if (this.onClickCallback) {
            this.onClickCallback('detail');
          } else {
            const appId = this.getDetailId();
            if (appId) {
              window.dispatchEvent(new CustomEvent('fab:edit-application', { detail: { appId } }));
            }
          }
        }
      };
    }
    
    // Settings: no FAB
    if (route === ROUTES.SETTINGS) {
      return null;
    }
    
    return null;
  }

  /**
   * Get application ID from detail route
   */
  getDetailId() {
    const match = this.currentRoute.match(/#\/detail\/(.+)/);
    return match ? match[1] : null;
  }

  /**
   * Update FAB visibility based on current route
   */
  updateVisibility() {
    const config = this.getConfig();
    
    if (!config) {
      this.hide();
      return;
    }
    
    this.show(config);
  }

  /**
   * Show the FAB
   */
  show(config) {
    console.log('Fab.show called with config:', config);
    
    // Always remove old FAB if exists
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
      this.fabEl = null;
    }
    
    // Create new FAB
    this.fabEl = document.createElement('button');
    this.fabEl.className = 'fab';
    this.fabEl.id = 'main-fab';
    this.fabEl.type = 'button';
    this.fabEl.title = config.title;
    this.fabEl.innerHTML = config.icon;
    
    // Handle click directly
    this.fabEl.addEventListener('click', (e) => {
      console.log('FAB clicked, action:', config.action);
      if (config.action) {
        config.action();
      }
    });
    
    document.body.appendChild(this.fabEl);
    
    console.log('FAB element:', this.fabEl);
    console.log('FAB onclick:', this.fabEl.onclick);
    
    // Entry animation
    this.fabEl.classList.add('fab--entering');
    setTimeout(() => {
      this.fabEl.classList.remove('fab--entering');
    }, 300);
  }

  /**
   * Hide the FAB
   */
  hide() {
    if (this.fabEl) {
      this.fabEl.classList.add('fab--hidden');
    }
  }

  /**
   * Remove FAB from DOM
   */
  destroy() {
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
      this.fabEl = null;
    }
  }
}