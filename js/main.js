/**
 * main.js
 * Application entry point
 * Initializes services, components, router, and screens
 */

console.log('>>> MAIN.JS STARTING <<<');

// Import services
import { storage } from './services/storage.js';
import * as appService from './services/app-service.js';
import * as calendarService from './services/calendar-service.js';
import * as statsService from './services/stats-service.js';

// Import router and components
import { router } from './router.js';
import { BottomNav } from './components/BottomNav.js';
import { toast } from './components/Toast.js';
import { Fab } from './components/Fab.js';

// Import screens
import { DashboardScreen } from './screens/DashboardScreen.js';
import { ApplicationsScreen } from './screens/ApplicationsScreen.js';
import { CalendarScreen } from './screens/CalendarScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { DetailScreen } from './screens/DetailScreen.js';

// Import utilities
import { ROUTES } from './utils/constants.js';
import { updateStreak } from './services/stats-service.js';

/**
 * Apply saved theme
 */
function applyTheme() {
  const settings = storage.getSettings();
  const theme = settings?.theme || 'system';
  
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/**
 * Initialize the application
 */
function initApp() {
  console.log('Initializing PhD Application Tracker...');

  // Initialize storage
  storage.init();
  console.log('Storage initialized');

  // Apply saved theme
  applyTheme();
  console.log('Theme applied');

  // Initialize router (set initial route only, don't render yet)
  router.init();
  console.log('Router initialized');

  // Initialize global FAB
  const fab = new Fab(router, (screen, appId) => {
    if (screen === 'detail' && appId) {
      window.dispatchEvent(new CustomEvent('fab:edit-application', { detail: { appId } }));
    } else {
      window.dispatchEvent(new CustomEvent(`fab:add-${screen}`));
    }
  });
  router.addOnNavigate((route) => fab.update(route));
  console.log('Global FAB initialized');

  // Initialize bottom navigation
  const bottomNav = new BottomNav(router);
  console.log('Bottom navigation initialized');

  // Create screen instances
  const dashboardScreen = new DashboardScreen(router, appService, statsService, calendarService);
  const applicationsScreen = new ApplicationsScreen(router, appService);
  applicationsScreen.init();
  const calendarScreen = new CalendarScreen(router, appService, calendarService);
  const settingsScreen = new SettingsScreen(router, storage);
  const detailScreen = new DetailScreen(router, appService);

  // Register screens with router
  router.registerScreen(ROUTES.DASHBOARD, dashboardScreen);
  router.registerScreen(ROUTES.APPLICATIONS, applicationsScreen);
  router.registerScreen(ROUTES.CALENDAR, calendarScreen);
  router.registerScreen(ROUTES.SETTINGS, settingsScreen);
  router.registerScreen(ROUTES.DETAIL, detailScreen);

  console.log('Screens registered');

  // Update streak on app open
  const settings = storage.getSettings();
  const updatedSettings = updateStreak(settings);
  storage.updateSettings(updatedSettings);

  // Show welcome toast if first time
  const stats = storage.getStats();
  if (stats.totalAdded === 0) {
    toast.info('Welcome! Tap the + button to add your first application.');
  }

  // Navigate to initial route (will render the screen)
  router.navigate(ROUTES.DASHBOARD);

  console.log('App initialization complete');
}

/**
 * Register service worker for PWA support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch(err => console.log('Service Worker registration failed:', err));
  }
}

/**
 * Start the app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  registerServiceWorker();
});

// Handle visibility changes to update streak
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const settings = storage.getSettings();
    const updatedSettings = updateStreak(settings);
    storage.updateSettings(updatedSettings);
  }
});

// Handle theme changes from system preference
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const settings = storage.getSettings();
    if (settings.theme === 'system') {
      applyTheme();
    }
  });
}