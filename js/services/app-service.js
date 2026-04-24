/**
 * app-service.js
 * Business logic for application CRUD operations
 * Does NOT touch the DOM — pure data logic
 */

import { storage } from './storage.js';
import { generateUUID } from '../utils/uuid.js';
import { getNowISO } from '../utils/date-utils.js';
import { STATUS_PIPELINE } from '../utils/constants.js';

/**
 * Create a new application
 * @param {Object} fields - Application fields (universityName, programName, submissionDeadline required)
 * @returns {Object} Created application
 */
export function createApplication(fields) {
  const application = {
    id: generateUUID(),
    universityName: fields.universityName || '',
    programName: fields.programName || '',
    department: fields.department || '',
    country: fields.country || '',
    applicationPortalURL: fields.applicationPortalURL || '',
    submissionDeadline: fields.submissionDeadline || '',
    resultsPublicationDate: fields.resultsPublicationDate || null,
    interviewDate: fields.interviewDate || null,
    oralExamDate: fields.oralExamDate || null,
    status: 'Planning',
    requiredDocuments: (fields.requiredDocuments || []).map(doc => ({
      id: generateUUID(),
      name: doc.name || '',
      completed: doc.completed || false
    })),
    notes: fields.notes || '',
    tags: fields.tags || [],
    createdAt: getNowISO(),
    updatedAt: getNowISO(),
    statusHistory: [
      {
        status: 'Planning',
        timestamp: getNowISO()
      }
    ]
  };

  storage.addApplication(application);
  return application;
}

/**
 * Update an application
 * @param {string} id - Application ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success
 */
export function updateApplication(id, updates) {
  const app = storage.getApplication(id);
  if (!app) return false;

  // Track status changes in history
  if (updates.status && updates.status !== app.status) {
    updates.statusHistory = [
      ...(app.statusHistory || []),
      {
        status: updates.status,
        timestamp: getNowISO()
      }
    ];
  }

  return storage.updateApplication(id, updates);
}

/**
 * Delete an application
 * @param {string} id - Application ID
 * @returns {boolean} Success
 */
export function deleteApplication(id) {
  return storage.deleteApplication(id);
}

/**
 * Get all applications
 * @returns {Array} Applications
 */
export function getAllApplications() {
  return storage.getApplications();
}

/**
 * Get application by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getApplicationById(id) {
  return storage.getApplication(id);
}

/**
 * Get applications filtered by status
 * @param {string} status - Status name
 * @returns {Array}
 */
export function getApplicationsByStatus(status) {
  return getAllApplications().filter(app => app.status === status);
}

/**
 * Advance application to next status
 * @param {string} id
 * @returns {boolean}
 */
export function advanceStatus(id) {
  const app = storage.getApplication(id);
  if (!app) return false;

  const currentIndex = STATUS_PIPELINE.indexOf(app.status);
  if (currentIndex === -1 || currentIndex === STATUS_PIPELINE.length - 1) {
    return false; // Already at end
  }

  const nextStatus = STATUS_PIPELINE[currentIndex + 1];
  return updateApplication(id, { status: nextStatus });
}

/**
 * Regress application to previous status
 * @param {string} id
 * @returns {boolean}
 */
export function regressStatus(id) {
  const app = storage.getApplication(id);
  if (!app) return false;

  const currentIndex = STATUS_PIPELINE.indexOf(app.status);
  if (currentIndex === -1 || currentIndex === 0) {
    return false; // Already at start
  }

  const prevStatus = STATUS_PIPELINE[currentIndex - 1];
  return updateApplication(id, { status: prevStatus });
}

/**
 * Update document completion status
 * @param {string} appId
 * @param {string} docId
 * @param {boolean} completed
 * @returns {boolean}
 */
export function updateDocumentStatus(appId, docId, completed) {
  const app = storage.getApplication(appId);
  if (!app) return false;

  const docs = app.requiredDocuments || [];
  const doc = docs.find(d => d.id === docId);
  if (!doc) return false;

  doc.completed = completed;
  return updateApplication(appId, { requiredDocuments: docs });
}

/**
 * Add a document to an application
 * @param {string} appId
 * @param {string} name - Document name
 * @returns {boolean}
 */
export function addDocument(appId, name) {
  const app = storage.getApplication(appId);
  if (!app) return false;

  const docs = app.requiredDocuments || [];
  docs.push({
    id: generateUUID(),
    name: name,
    completed: false
  });

  return updateApplication(appId, { requiredDocuments: docs });
}

/**
 * Remove a document from an application
 * @param {string} appId
 * @param {string} docId
 * @returns {boolean}
 */
export function removeDocument(appId, docId) {
  const app = storage.getApplication(appId);
  if (!app) return false;

  const docs = (app.requiredDocuments || []).filter(d => d.id !== docId);
  return updateApplication(appId, { requiredDocuments: docs });
}

/**
 * Get completion percentage for documents
 * @param {string} appId
 * @returns {number} 0-100
 */
export function getDocumentCompletion(appId) {
  const app = storage.getApplication(appId);
  if (!app || !app.requiredDocuments || app.requiredDocuments.length === 0) {
    return 0;
  }

  const completed = app.requiredDocuments.filter(d => d.completed).length;
  return Math.round((completed / app.requiredDocuments.length) * 100);
}

/**
 * Update notes for an application
 * @param {string} appId
 * @param {string} notes
 * @returns {boolean}
 */
export function updateNotes(appId, notes) {
  return updateApplication(appId, { notes });
}

/**
 * Add tags to an application
 * @param {string} appId
 * @param {string[]} tags
 * @returns {boolean}
 */
export function updateTags(appId, tags) {
  return updateApplication(appId, { tags });
}
