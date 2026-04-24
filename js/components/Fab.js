/**
 * Fab.js
 * Floating Action Button component
 */

import { ROUTES } from '../utils/constants.js';

export class Fab {
  constructor(router, onClickCallback) {
    this.router = router;
    this.onClickCallback = onClickCallback;
    this.fabEl = null;
    this.currentRoute = null;
  }
  
  update(route) {
    this.currentRoute = route;
    const config = this.getConfig();
    if (!config) {
      this.hide();
      return;
    }
    this.show(config);
  }
  
  getConfig() {
    const route = this.currentRoute;
    if (!route) return null;
    
    if (route === ROUTES.DASHBOARD) return null;
    if (route === ROUTES.SETTINGS) return null;
    if (route === ROUTES.CALENDAR || route.startsWith('#/calendar')) return null;
    
    if (route === ROUTES.APPLICATIONS || route.startsWith('#/applications')) {
      return { icon: '+', title: 'Add Application', action: () => this.handleAction('application') };
    }
    
    if (route.startsWith('#/detail/')) {
      return { icon: 'Edit', title: 'Edit', action: () => this.handleAction('detail') };
    }
    
    return null;
  }
  
  handleAction(type) {
    if (this.onClickCallback) {
      this.onClickCallback(type);
    } else {
      const eventName = type.endsWith('s') ? `fab:add-${type.slice(0, -1)}` : `fab:add-${type}`;
      window.dispatchEvent(new CustomEvent(eventName));
    }
  }
  
  show(config) {
    if (this.fabEl && this.fabEl.parentElement) {
      this.fabEl.remove();
    }
    
    this.fabEl = document.createElement('button');
    this.fabEl.className = 'fab';
    this.fabEl.id = 'main-fab';
    this.fabEl.type = 'button';
    this.fabEl.title = config.title;
    this.fabEl.textContent = config.icon;
    this.fabEl.addEventListener('click', () => {
      if (config.action) config.action();
    });
    
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
    this.router = null;
    this.onClickCallback = null;
  }
}