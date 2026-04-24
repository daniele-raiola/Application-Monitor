/**
 * calendar-service.js
 * Date computation, conflict detection, and event aggregation
 */

import { EVENT_TYPES } from '../utils/constants.js';

export function aggregateEvents(applications) {
  const eventMap = new Map();

  applications.forEach(app => {
    const { id, universityName, programName } = app;

    if (app.submissionDeadline) {
      addEvent(eventMap, app.submissionDeadline, {
        type: EVENT_TYPES.DEADLINE,
        applicationId: id,
        universityName,
        programName
      });
    }

    if (app.resultsPublicationDate) {
      addEvent(eventMap, app.resultsPublicationDate, {
        type: EVENT_TYPES.RESULTS,
        applicationId: id,
        universityName,
        programName
      });
    }

    if (app.interviewDate) {
      addEvent(eventMap, app.interviewDate, {
        type: EVENT_TYPES.INTERVIEW,
        applicationId: id,
        universityName,
        programName
      });
    }

    if (app.oralExamDate) {
      addEvent(eventMap, app.oralExamDate, {
        type: EVENT_TYPES.EXAM,
        applicationId: id,
        universityName,
        programName
      });
    }
  });

  return eventMap;
}

function addEvent(eventMap, dateStr, event) {
  const date = dateStr.split('T')[0];
  
  if (!eventMap.has(date)) {
    eventMap.set(date, []);
  }
  
  eventMap.get(date).push(event);
}

export function detectConflicts(eventMap) {
  const conflictDates = new Set();

  eventMap.forEach((events, date) => {
    if (events.length > 1) {
      conflictDates.add(date);
    }
  });

  return conflictDates;
}

export function getEventsForMonth(eventMap, year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const events = {};

  eventMap.forEach((eventList, date) => {
    if (date.startsWith(monthStr)) {
      events[date] = eventList;
    }
  });

  return events;
}

export function getEventsForDate(eventMap, dateStr) {
  const date = dateStr.split('T')[0];
  return eventMap.get(date) || [];
}

export function getAllEvents(eventMap) {
  const events = [];

  eventMap.forEach((eventList, date) => {
    eventList.forEach(event => {
      events.push({
        ...event,
        date
      });
    });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getUpcomingEvents(applications, limit = 5) {
  const eventMap = aggregateEvents(applications);
  const allEvents = getAllEvents(eventMap);
  const today = new Date().toISOString().split('T')[0];

  return allEvents
    .filter(e => e.date >= today)
    .slice(0, limit);
}

export function getEventTypeColor(type) {
  const colors = {
    [EVENT_TYPES.DEADLINE]: '#FF4444',
    [EVENT_TYPES.INTERVIEW]: '#FFA500',
    [EVENT_TYPES.EXAM]: '#FFD700',
    [EVENT_TYPES.RESULTS]: '#00CC66'
  };
  return colors[type] || '#888888';
}