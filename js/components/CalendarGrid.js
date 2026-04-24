/**
 * CalendarGrid.js
 * Interactive calendar grid component
 */

import { getMonthDates, getMonthLabel, getTodayISO, parseISODate } from '../utils/date-utils.js';
import { EVENT_TYPE_COLORS } from '../utils/constants.js';
import { getEventTypeColor } from '../services/calendar-service.js';

export class CalendarGrid {
  constructor(year, month, options = {}) {
    this.year = year;
    this.month = month;
    this.eventMap = options.eventMap || new Map();
    this.conflictDates = options.conflictDates || new Set();
    this.selectedDate = options.selectedDate || null;
    this.onDateSelect = options.onDateSelect || (() => {});
  }

  /**
   * Update year/month
   */
  setDate(year, month) {
    this.year = year;
    this.month = month;
  }

  /**
   * Update events
   */
  setEvents(eventMap, conflictDates) {
    this.eventMap = eventMap;
    this.conflictDates = conflictDates;
  }

  /**
   * Render the calendar grid
   */
  render() {
    const container = document.createElement('div');
    container.className = 'calendar';

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'calendar-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav__btn';
    prevBtn.textContent = '←';
    prevBtn.title = 'Previous month';
    prevBtn.addEventListener('click', () => this.navigate(-1));

    const monthLabel = document.createElement('span');
    monthLabel.className = 'calendar-nav__month';
    monthLabel.textContent = getMonthLabel(this.year, this.month);
    monthLabel.id = 'calendar-month-label';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav__btn';
    nextBtn.textContent = '→';
    nextBtn.title = 'Next month';
    nextBtn.addEventListener('click', () => this.navigate(1));

    nav.appendChild(prevBtn);
    nav.appendChild(monthLabel);
    nav.appendChild(nextBtn);
    container.appendChild(nav);

    // Weekday headers
    const header = document.createElement('div');
    header.className = 'calendar-grid__header';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const el = document.createElement('div');
      el.className = 'calendar-grid__weekday';
      el.textContent = day;
      header.appendChild(el);
    });
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const dates = getMonthDates(this.year, this.month);
    const today = getTodayISO();

    dates.forEach(dateInfo => {
      const cell = this.createCell(dateInfo, today);
      grid.appendChild(cell);
    });

    container.appendChild(grid);

    return container;
  }

  /**
   * Create a calendar cell
   */
  createCell(dateInfo, today) {
    const { date, dayOfWeek, isOutside } = dateInfo;
    const day = parseInt(date.split('-')[2]);

    const cell = document.createElement('div');
    cell.className = 'calendar-grid__cell';
    cell.dataset.date = date;

    if (isOutside) {
      cell.classList.add('calendar-grid__cell--outside');
    }

    const todayDate = today.split('T')[0];
    if (date === todayDate) {
      cell.classList.add('calendar-grid__cell--today');
    }

    if (this.selectedDate === date) {
      cell.classList.add('calendar-grid__cell--selected');
    }

    if (this.conflictDates.has(date)) {
      cell.classList.add('calendar-grid__cell--conflict');
    }

    const dateEl = document.createElement('span');
    dateEl.className = 'calendar-grid__date';
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    const events = this.eventMap.get(date) || [];
    if (events.length > 0) {
      const eventsEl = document.createElement('div');
      eventsEl.className = 'calendar-grid__events';

      const displayEvents = events.slice(0, 4);
      displayEvents.forEach(event => {
        const dot = document.createElement('span');
        dot.className = `calendar-grid__event-dot calendar-grid__event-dot--${event.type}`;
        dot.style.backgroundColor = getEventTypeColor(event.type);
        dot.title = `${event.type}: ${event.universityName}`;
        eventsEl.appendChild(dot);
      });

      if (events.length > 4) {
        const overflow = document.createElement('span');
        overflow.className = 'calendar-grid__overflow';
        overflow.textContent = `+${events.length - 4}`;
        eventsEl.appendChild(overflow);
      }

      cell.appendChild(eventsEl);
    }

    if (this.conflictDates.has(date)) {
      const warning = document.createElement('span');
      warning.className = 'calendar-grid__conflict-warning';
      warning.textContent = '⚠️';
      warning.title = 'Conflicting events';
      cell.appendChild(warning);
    }

    cell.addEventListener('click', () => {
      if (!isOutside) {
        this.selectedDate = date;
        this.onDateSelect(date, events);
      }
    });

    return cell;
  }

  /**
   * Navigate months
   */
  navigate(direction) {
    let newMonth = this.month + direction;
    let newYear = this.year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    this.year = newYear;
    this.month = newMonth;

    this.onDateSelect = this.onDateSelect || (() => {});
  }
}