/**
 * SettingsScreen.js
 * Settings screen with theme toggle, export/import, and data management
 */

import { storage } from '../services/storage.js';
import { toast } from '../components/Toast.js';
import { Fab } from '../components/Fab.js';

export class SettingsScreen {
  constructor(router, storage) {
    this.router = router;
    this.storage = storage;
    this.fab = null;
  }

  render(container) {
    container.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
    });

    const screenEl = document.getElementById('settings-screen');
    screenEl.classList.add('screen--active');

    this.renderContent();
    this.setupFab();
  }

  renderContent() {
    const screenEl = document.getElementById('settings-screen');
    const settings = this.storage.getSettings();
    const stats = this.storage.getStats();
    const theme = settings?.theme || 'system';

    screenEl.innerHTML = `
      <div class="screen--settings">
        <section class="settings__section">
          <h2 class="settings__section-title">Display</h2>
          <div class="settings__group">
            <span class="settings__label">Theme</span>
            <select class="settings__select" id="theme-select">
              <option value="system" ${theme === 'system' ? 'selected' : ''}>System</option>
              <option value="light" ${theme === 'light' ? 'selected' : ''}>Light</option>
              <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
            </select>
          </div>
        </section>

        <section class="settings__section">
          <h2 class="settings__section-title">Data</h2>
          <button class="settings__button" id="export-btn">
            📤 Export Data (JSON)
          </button>
          <button class="settings__button settings__button--secondary" id="import-btn">
            📥 Import Data
          </button>
          <input type="file" id="import-file" accept=".json" style="display: none;">
        </section>

        <section class="settings__section">
          <h2 class="settings__section-title">Statistics</h2>
          <div class="settings__stats">
            <div class="settings__stat">
              <span class="settings__stat-label">Total Applications</span>
              <span class="settings__stat-value">${stats.totalAdded}</span>
            </div>
            <div class="settings__stat">
              <span class="settings__stat-label">Submitted</span>
              <span class="settings__stat-value">${stats.totalSubmitted}</span>
            </div>
            <div class="settings__stat">
              <span class="settings__stat-label">Accepted</span>
              <span class="settings__stat-value">${stats.totalAccepted}</span>
            </div>
            <div class="settings__stat">
              <span class="settings__stat-label">Current Streak</span>
              <span class="settings__stat-value">${settings.streakDays || 0} days</span>
            </div>
          </div>
        </section>

        <section class="settings__section settings__section--danger">
          <h2 class="settings__section-title">Danger Zone</h2>
          <button class="settings__button settings__danger" id="reset-btn">
            🗑️ Reset All Data
          </button>
        </section>

        <section class="settings__section">
          <h2 class="settings__section-title">About</h2>
          <p class="settings__about">
            <strong>PhD Application Tracker</strong> v1.0<br><br>
            A mobile-first, offline-capable PWA for managing your PhD applications.<br><br>
            Built with vanilla JavaScript, no frameworks.
          </p>
        </section>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      this.handleThemeChange(e.target.value);
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      this.handleExport();
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
      document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      this.handleImport(e);
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      this.handleReset();
    });
  }

  handleThemeChange(theme) {
    const settings = this.storage.getSettings();
    this.storage.updateSettings({ theme });

    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    toast.success(`Theme: ${theme}`);
  }

  handleExport() {
    try {
      const data = this.storage.getStore();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `phd-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed');
    }
  }

  handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result;
        if (typeof json !== 'string') {
          throw new Error('Invalid file');
        }

        const imported = JSON.parse(json);
        
        if (!imported.applications || !Array.isArray(imported.applications)) {
          throw new Error('Invalid format');
        }

        if (confirm(`Import ${imported.applications.length} applications? This will replace your current data.`)) {
          this.storage.importJSON(json);
          toast.success('Data imported!');
          this.renderContent();
        }
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Import failed: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    e.target.value = '';
  }

  handleReset() {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
      if (confirm('Really? All applications will be deleted.')) {
        this.storage.reset();
        toast.info('Data reset');
        this.renderContent();
      }
    }
  }

  setupFab() {
    // FAB disabled
  }
}