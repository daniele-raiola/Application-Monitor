/**
 * date-utils.js
 * Date manipulation and formatting utilities
 * Works with ISO date strings (YYYY-MM-DD) and ISO datetime strings (YYYY-MM-DDTHH:mm:ssZ)
 */

/**
 * Format an ISO date string into a readable format
 * @param {string} isoDate - ISO date string (YYYY-MM-DD or full datetime)
 * @param {string} format - 'short', 'medium', 'long', or 'time'
 * @returns {string} Formatted date
 */
export function formatDate(isoDate, format = 'short') {
  if (!isoDate) return '';

  // Extract just the date part if it's a datetime
  const dateStr = isoDate.split('T')[0];
  const date = new Date(dateStr + 'T00:00:00Z'); // UTC time

  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: '2-digit' },
    long: { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Get countdown days from today to a target date
 * @param {string} targetDate - ISO date string (YYYY-MM-DD)
 * @returns {number} Days remaining (negative if past)
 */
export function daysUntil(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate + 'T00:00:00Z');
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate a countdown badge label
 * @param {string} targetDate - ISO date string
 * @returns {string} Badge text like "47 days left" or "Past due"
 */
export function getCountdownLabel(targetDate) {
  const days = daysUntil(targetDate);

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/**
 * Check if a date has passed
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export function isPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr + 'T00:00:00Z');
  target.setHours(0, 0, 0, 0);

  return target < today;
}

/**
 * Check if a date is in the future
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export function isFuture(dateStr) {
  return daysUntil(dateStr) > 0;
}

/**
 * Check if a date is today
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export function isToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr + 'T00:00:00Z');
  target.setHours(0, 0, 0, 0);

  return today.getTime() === target.getTime();
}

/**
 * Check if a date is urgent (7 days or less away)
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export function isUrgent(dateStr) {
  const days = daysUntil(dateStr);
  return days >= 0 && days <= 7;
}

/**
 * Check if a date is critical (3 days or less away)
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export function isCritical(dateStr) {
  const days = daysUntil(dateStr);
  return days >= 0 && days <= 3;
}

/**
 * Get today's date in ISO format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getTodayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current datetime in ISO format
 * @returns {string} ISO datetime string (YYYY-MM-DDTHH:mm:ssZ)
 */
export function getNowISO() {
  return new Date().toISOString();
}

/**
 * Check if two dates conflict (overlap)
 * @param {string} date1 - ISO date string
 * @param {string} date2 - ISO date string
 * @returns {boolean}
 */
export function datesConflict(date1, date2) {
  const d1 = date1.split('T')[0]; // Extract date only
  const d2 = date2.split('T')[0];
  return d1 === d2;
}

/**
 * Get dates for a given month
 * @param {number} year
 * @param {number} month - 1-indexed (1 = January)
 * @returns {Array<{date: string, dayOfWeek: number, isOutside: boolean}>}
 */
export function getMonthDates(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  const dates = [];
  const date = new Date(startDate);

  while (dates.length < 42) { // 6 weeks * 7 days
    const isoDate = date.toISOString().split('T')[0];
    const isOutside = date.getMonth() + 1 !== month;

    dates.push({
      date: isoDate,
      dayOfWeek: date.getDay(),
      isOutside
    });

    date.setDate(date.getDate() + 1);
  }

  return dates;
}

/**
 * Get the month/year label for a given month
 * @param {number} year
 * @param {number} month - 1-indexed
 * @returns {string} Like "September 2025"
 */
export function getMonthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Parse ISO date string and get year/month/day
 * @param {string} isoDate - ISO date string (YYYY-MM-DD)
 * @returns {object} { year, month (1-indexed), day }
 */
export function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}
