/**
 * Toast.js
 * Toast notification system (singleton)
 * Manages a queue of toast messages with auto-dismiss
 */

import { TOAST_TYPES } from '../utils/constants.js';

export class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.queue = [];
    this.timers = new Map();
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - TOAST_TYPES constant (success, warning, error, info)
   * @param {Object} options - { duration, action, onAction }
   */
  show(message, type = TOAST_TYPES.INFO, options = {}) {
    const {
      duration = 4000,
      action = null,
      onAction = null
    } = options;

    const toastEl = document.createElement('div');
    const toastId = `toast-${Date.now()}-${Math.random()}`;
    toastEl.className = `toast toast--${type}`;
    toastEl.id = toastId;

    const messageEl = document.createElement('div');
    messageEl.className = 'toast__message';
    messageEl.textContent = message;
    toastEl.appendChild(messageEl);

    if (action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast__action';
      actionBtn.textContent = action;
      actionBtn.addEventListener('click', () => {
        if (onAction) onAction();
        this.dismiss(toastId);
      });
      toastEl.appendChild(actionBtn);
    }

    this.container.appendChild(toastEl);
    this.queue.push(toastId);

    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(toastId);
      }, duration);

      this.timers.set(toastId, timer);
    }

    return toastId;
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(toastId) {
    const toastEl = document.getElementById(toastId);
    if (!toastEl) return;

    // Clear timer if exists
    const timer = this.timers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(toastId);
    }

    // Animate out
    toastEl.classList.add('toast--exiting');

    // Remove after animation
    setTimeout(() => {
      toastEl.remove();
      this.queue = this.queue.filter(id => id !== toastId);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    const toastIds = [...this.queue];
    toastIds.forEach(id => this.dismiss(id));
  }

  /**
   * Convenience methods
   */
  success(message, options = {}) {
    return this.show(message, TOAST_TYPES.SUCCESS, options);
  }

  error(message, options = {}) {
    return this.show(message, TOAST_TYPES.ERROR, options);
  }

  warning(message, options = {}) {
    return this.show(message, TOAST_TYPES.WARNING, options);
  }

  info(message, options = {}) {
    return this.show(message, TOAST_TYPES.INFO, options);
  }
}

// Export singleton instance
export const toast = new Toast();
