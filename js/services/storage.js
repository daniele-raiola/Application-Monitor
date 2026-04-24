/**
 * storage.js
 * localStorage abstraction with migration support
 * Single source of truth for app data persistence
 */

import { SCHEMA_VERSION, STORAGE_KEY } from '../utils/constants.js';
import { getNowISO, getTodayISO } from '../utils/date-utils.js';

/**
 * AppStore Schema (persisted to localStorage)
 * {
 *   schemaVersion: number
 *   lastUpdated: ISO datetime string
 *   settings: { theme, defaultView, notificationsEnabled, streakLastCheckin }
 *   stats: { streakDays, totalAdded, totalSubmitted, totalAccepted }
 *   applications: Application[]
 * }
 */

class StorageService {
  constructor() {
    this.data = null;
    this.init();
  }

  /**
   * Initialize storage: load from localStorage or create defaults
   */
  init() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        this.data = JSON.parse(stored);
        this.migrate();
      } catch (e) {
        console.error('Storage parse error, resetting:', e);
        this.reset();
      }
    } else {
      this.reset();
    }
  }

  /**
   * Create default app store
   */
  createDefaultStore() {
    return {
      schemaVersion: SCHEMA_VERSION,
      lastUpdated: getNowISO(),
      settings: {
        theme: 'system',
        defaultView: 'dashboard',
        notificationsEnabled: false,
        streakLastCheckin: getTodayISO()
      },
      stats: {
        streakDays: 0,
        totalAdded: 0,
        totalSubmitted: 0,
        totalAccepted: 0
      },
      applications: []
    };
  }

  /**
   * Handle schema migrations
   */
  migrate() {
    const currentVersion = this.data?.schemaVersion || 0;

    if (currentVersion < SCHEMA_VERSION) {
      console.info(`Migrating storage from v${currentVersion} to v${SCHEMA_VERSION}`);
      // Add migrations here as schema evolves
      this.data.schemaVersion = SCHEMA_VERSION;
      this.save();
    }
  }

  /**
   * Load entire app store
   */
  getStore() {
    return this.data;
  }

  /**
   * Save entire app store to localStorage
   */
  save() {
    try {
      this.data.lastUpdated = getNowISO();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Storage save error:', e);
      // Handle quota exceeded
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded');
      }
    }
  }

  /**
   * Reset to default store
   */
  reset() {
    this.data = this.createDefaultStore();
    this.save();
  }

  /**
   * Export store as JSON blob
   */
  exportJSON() {
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    return blob;
  }

  /**
   * Import store from JSON string
   * @param {string} jsonString
   * @throws {Error} if JSON is invalid
   */
  importJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);

      // Validate schema
      if (!imported.applications || !Array.isArray(imported.applications)) {
        throw new Error('Invalid schema: missing applications array');
      }

      // Merge with existing data (preserves settings)
      this.data = {
        ...this.data,
        ...imported,
        schemaVersion: SCHEMA_VERSION,
        lastUpdated: getNowISO()
      };

      this.save();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      throw e;
    }
  }

  /**
   * Get applications array
   */
  getApplications() {
    return this.data.applications || [];
  }

  /**
   * Add application to store
   */
  addApplication(app) {
    this.data.applications.push(app);
    this.save();
  }

  /**
   * Update application by id
   */
  updateApplication(id, updates) {
    const index = this.data.applications.findIndex(a => a.id === id);
    if (index >= 0) {
      this.data.applications[index] = {
        ...this.data.applications[index],
        ...updates,
        updatedAt: getNowISO()
      };
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Delete application by id
   */
  deleteApplication(id) {
    const index = this.data.applications.findIndex(a => a.id === id);
    if (index >= 0) {
      this.data.applications.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Get application by id
   */
  getApplication(id) {
    return this.data.applications.find(a => a.id === id);
  }

  /**
   * Get settings
   */
  getSettings() {
    return this.data.settings;
  }

  /**
   * Update settings
   */
  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
  }

  /**
   * Get stats
   */
  getStats() {
    return this.data.stats;
  }

  /**
   * Update stats
   */
  updateStats(updates) {
    this.data.stats = { ...this.data.stats, ...updates };
    this.save();
  }
}

// Export singleton instance
export const storage = new StorageService();
