/**
 * stats-service.js
 * Streak computation, progress stats, and gamification logic
 */

import { getTodayISO, daysUntil } from '../utils/date-utils.js';
import { STATUS_PIPELINE } from '../utils/constants.js';

export function computeStats(applications, settings) {
  const total = applications.length;
  const byStatus = {};
  
  STATUS_PIPELINE.forEach(status => {
    byStatus[status] = applications.filter(app => app.status === status).length;
  });

  const totalSubmitted = byStatus['Submitted'] || 0;
  const totalAccepted = byStatus['Accepted'] || 0;
  const totalRejected = byStatus['Rejected'] || 0;
  
  let docsCompleted = 0;
  let docsTotal = 0;
  
  applications.forEach(app => {
    const docs = app.requiredDocuments || [];
    docsTotal += docs.length;
    docsCompleted += docs.filter(d => d.completed).length;
  });

  const docsProgress = docsTotal > 0 ? Math.round((docsCompleted / docsTotal) * 100) : 0;
  const submissionRate = total > 0 ? Math.round((totalSubmitted / total) * 100) : 0;
  const acceptanceRate = (totalSubmitted + totalAccepted + totalRejected) > 0 
    ? Math.round((totalAccepted / (totalSubmitted + totalAccepted + totalRejected)) * 100) 
    : 0;

  return {
    total,
    byStatus,
    totalSubmitted,
    totalAccepted,
    totalRejected,
    docsCompleted,
    docsTotal,
    docsProgress,
    submissionRate,
    acceptanceRate,
    streakDays: settings?.streakDays || 0
  };
}

export function updateStreak(settings) {
  const today = getTodayISO();
  const lastCheckin = settings?.streakLastCheckin || today;
  
  if (lastCheckin === today) {
    return settings;
  }

  const daysSinceLastCheckin = daysUntil(lastCheckin);
  
  if (daysSinceLastCheckin === 1) {
    return {
      ...settings,
      streakDays: (settings?.streakDays || 0) + 1,
      streakLastCheckin: today
    };
  } else if (daysSinceLastCheckin > 1) {
    return {
      ...settings,
      streakDays: 1,
      streakLastCheckin: today
    };
  }
  
  return settings;
}

export function checkStreak(settings) {
  const today = getTodayISO();
  const lastCheckin = settings?.streakLastCheckin;
  
  if (!lastCheckin || lastCheckin === today) {
    return { ...settings, streakActive: true };
  }
  
  const daysSinceLastCheckin = daysUntil(lastCheckin);
  
  if (daysSinceLastCheckin > 1) {
    return {
      ...settings,
      streakDays: 0,
      streakActive: false
    };
  }
  
  return { ...settings, streakActive: true };
}