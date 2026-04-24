/**
 * constants.js
 * Central registry of app-wide constants and enumerations
 */

export const STATUS_PIPELINE = [
  'Planning',
  'Drafting',
  'Submitted',
  'Under Review',
  'Interviewing',
  'Accepted',
  'Rejected'
];

export const STATUS_COLORS = {
  'Planning': 'var(--status-planning)',
  'Drafting': 'var(--status-drafting)',
  'Submitted': 'var(--status-submitted)',
  'Under Review': 'var(--status-under-review)',
  'Interviewing': 'var(--status-interviewing)',
  'Accepted': 'var(--status-accepted)',
  'Rejected': 'var(--status-rejected)'
};

export const ROUTES = {
  DASHBOARD: '#/dashboard',
  APPLICATIONS: '#/applications',
  CALENDAR: '#/calendar',
  SETTINGS: '#/settings',
  DETAIL: '#/detail'
};

export const EVENT_TYPES = {
  DEADLINE: 'deadline',
  INTERVIEW: 'interview',
  EXAM: 'exam',
  RESULTS: 'results'
};

export const EVENT_TYPE_COLORS = {
  [EVENT_TYPES.DEADLINE]: '#FF4444',
  [EVENT_TYPES.INTERVIEW]: '#FFA500',
  [EVENT_TYPES.EXAM]: '#FFD700',
  [EVENT_TYPES.RESULTS]: '#00CC66'
};

export const DOCUMENT_TYPES = [
  'CV / Resume',
  'Statement of Purpose',
  'Letters of Recommendation',
  'Transcripts',
  'Test Scores (GRE/GMAT)',
  'Language Proficiency (TOEFL/IELTS)',
  'Portfolio',
  'Cover Letter',
  'Research Proposal'
];

export const TOAST_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

export const SCHEMA_VERSION = 1;

export const STORAGE_KEY = 'phd_tracker_v1';
