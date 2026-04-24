/**
 * router.js
 * Client-side hash-based router
 * Manages screen transitions and navigation
 */

export class Router {
  constructor() {
    this.currentRoute = '#/dashboard';
    this.screens = {};
    this.onNavigate = [];

    this.setupListeners();
  }

  /**
   * Register a screen controller for a route
   * @param {string} route - e.g., '#/dashboard'
   * @param {Object} screenController - Has render(container) method
   */
  registerScreen(route, screenController) {
    this.screens[route] = screenController;
  }

  /**
   * Add a navigation callback
   * @param {Function} callback - Called with (route) on navigation
   */
  addOnNavigate(callback) {
    this.onNavigate.push(callback);
  }

  /**
   * Setup hash change listener
   */
  setupListeners() {
    window.addEventListener('hashchange', () => {
      let hash = window.location.hash;
      if (!hash || hash.length === 0) {
        hash = '#/dashboard';
      }
      if (!hash.startsWith('#')) {
        hash = '#' + hash;
      }
      // Only navigate if different from current route
      if (this.currentRoute !== hash) {
        this.navigate(hash);
      }
    });
  }

  /**
   * Navigate to a route
   * @param {string} route - e.g., '#/dashboard'
   */
  navigate(route, force = true) {
    if (!route || route.length === 0) {
      route = '#/dashboard';
    }

    // Ensure hash prefix
    if (!route.startsWith('#')) {
      route = '#' + route;
    }

    // Don't navigate if already on this route (unless forced)
    if (!force && this.currentRoute === route) {
      return;
    }

    this.currentRoute = route;

    // Call all navigation callbacks
    this.onNavigate.forEach(cb => cb(route));

    // Use replaceState to avoid hashchange triggering another navigation
    try {
      window.history.replaceState(null, '', route);
    } catch (e) {
      // Fallback for some browsers
      window.location.hash = route;
    }

    // Render the appropriate screen
    this.renderScreen();
  }

  /**
   * Render the current screen
   */
  renderScreen() {
    let screenController = this.screens[this.currentRoute];
    
    // Handle dynamic routes like #/detail/uuid
    if (!screenController) {
      // Try to find a matching route prefix
      const routeKeys = Object.keys(this.screens);
      for (const route of routeKeys) {
        if (this.currentRoute.startsWith(route + '/') || this.currentRoute === route) {
          screenController = this.screens[route];
          break;
        }
      }
    }
    
    if (!screenController) {
      console.warn(`No controller for route: ${this.currentRoute}`);
      return;
    }

    const container = document.getElementById('screen-container');
    
    if (container) {
      screenController.render(container);
    }
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if on a specific route
   */
  isRoute(route) {
    return this.currentRoute === route;
  }

  /**
   * Get the ID parameter from a route like '#/detail/uuid'
   */
  getParam(name) {
    const hashParts = this.currentRoute.split('/');
    const index = hashParts.indexOf(name);
    if (index >= 0 && index < hashParts.length - 1) {
      return hashParts[index + 1];
    }
    return null;
  }

  /**
   * Initialize router — call on app startup AFTER screens are registered
   * Just sets initial route, doesn't render yet
   */
  init() {
    // Use current hash or default to dashboard
    let hash = window.location.hash;
    if (!hash || hash.length === 0) {
      hash = '#/dashboard';
    }
    if (!hash.startsWith('#')) {
      hash = '#' + hash;
    }
    this.currentRoute = hash;
  }
}

// Export singleton instance
export const router = new Router();
