/**
 * uuid.js
 * UUID v4 generation utility with fallback
 */

export function generateUUID() {
  // Use native crypto.randomUUID() if available
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a unique ID for local use (shorter than UUID)
 */
export function generateID() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
