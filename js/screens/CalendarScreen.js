/**
 * CalendarScreen.js
 * Calendar view screen controller
 */

import { Modal } from '../components/Modal.js';
import { Toast as toast } from '../components/Toast.js';
import { getUpcomingEvents, aggregateEvents, detectConflicts, getEventsForDate, getEventTypeColor } from '../services/calendar-service.js';
import { getTodayISO, parseISODate, formatDate } from '../utils/date-utils.js';
import { EVENT_TYPE_COLORS } from '../utils/constants.js';

export class CalendarScreen {
  constructor(router, appService, calendarService) {
    this.router = router;
    this.appService = appService;
    this.calendarService = calendarService;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1;
    this.selectedDate = null;
    this.eventMap = null;
    this.conflictDates = null;
    this.container = null;
  }

  render(container) {
    this.container = container;
    
    container.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
    });

    const screenEl = document.getElementById('calendar-screen');
    screenEl.classList.add('screen--active');

    screenEl.innerHTML = `
      <div class="calendar-screen">
        <div class="calendar-nav">
          <button class="calendar-nav__btn" id="cal-prev">←</button>
          <span class="calendar-nav__month" id="cal-month-label"></span>
          <button class="calendar-nav__btn" id="cal-next">→</button>
        </div>
        
        <div class="calendar-grid__header">
          <div class="calendar-grid__weekday">Sun</div>
          <div class="calendar-grid__weekday">Mon</div>
          <div class="calendar-grid__weekday">Tue</div>
          <div class="calendar-grid__weekday">Wed</div>
          <div class="calendar-grid__weekday">Thu</div>
          <div class="calendar-grid__weekday">Fri</div>
          <div class="calendar-grid__weekday">Sat</div>
        </div>
        
        <div class="calendar-grid" id="calendar-grid"></div>
        
        <div class="upcoming-events">
          <div class="upcoming-events__title">Upcoming Events</div>
          <div class="upcoming-events__strip" id="upcoming-events"></div>
        </div>
      </div>
    `;

    this.setupCalendar();
this.setupFab();
    this.setupEventListeners();
  }

  setupCalendar() {
    const apps = this.appService.getAllApplications();
    this.eventMap = aggregateEvents(apps);
    this.conflictDates = detectConflicts(this.eventMap);

    this.renderMonthLabel();
    this.renderGrid();
    this.renderUpcoming();
  }

  renderMonthLabel() {
    const label = document.getElementById('cal-month-label');
    if (label) {
      const date = new Date(this.currentYear, this.currentMonth - 1, 1);
      label.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  renderGrid() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Helper to get ISO date string in local timezone
    const toLocalISO = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Get today's date in local timezone
    const today = toLocalISO(new Date());
    const date = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isoDate = toLocalISO(date);
      const isOutside = date.getMonth() + 1 !== this.currentMonth;
      const day = date.getDate();
      const hasEvents = this.eventMap.has(isoDate);
      const hasConflict = this.conflictDates.has(isoDate);

      const cell = document.createElement('div');
      cell.className = 'calendar-grid__cell';
      if (isOutside) cell.classList.add('calendar-grid__cell--outside');
      if (isoDate === today) cell.classList.add('calendar-grid__cell--today');
      if (this.selectedDate === isoDate) cell.classList.add('calendar-grid__cell--selected');
      if (hasConflict) cell.classList.add('calendar-grid__cell--conflict');
      cell.dataset.date = isoDate;

      const dateEl = document.createElement('span');
      dateEl.className = 'calendar-grid__date';
      dateEl.textContent = day;
      cell.appendChild(dateEl);

      if (hasEvents) {
        const events = this.eventMap.get(isoDate);
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

      if (hasConflict) {
        const warning = document.createElement('span');
        warning.className = 'calendar-grid__conflict-warning';
        warning.textContent = '⚠️';
        warning.title = 'Conflicting events';
        cell.appendChild(warning);
      }

      cell.addEventListener('click', () => {
        if (!isOutside) {
          this.selectedDate = isoDate;
          this.showDateDetails(isoDate);
        }
      });

      grid.appendChild(cell);

      date.setDate(date.getDate() + 1);
    }
  }

  renderUpcoming() {
    const strip = document.getElementById('upcoming-events');
    if (!strip) return;

    strip.innerHTML = '';

    const apps = this.appService.getAllApplications();
    const events = getUpcomingEvents(apps, 5);

    if (events.length === 0) {
      strip.innerHTML = '<p class="upcoming-events__empty">No upcoming events</p>';
      return;
    }

    events.forEach(event => {
      const chip = document.createElement('button');
      chip.className = 'upcoming-events__chip';
      chip.dataset.date = event.date;
      chip.dataset.appId = event.applicationId;

      const dot = document.createElement('span');
      dot.className = 'upcoming-events__dot';
      dot.style.backgroundColor = getEventTypeColor(event.type);

      const dateEl = document.createElement('span');
      dateEl.className = 'upcoming-events__date';
      dateEl.textContent = formatDate(event.date, 'short');

      chip.appendChild(dot);
      chip.appendChild(dateEl);
      chip.appendChild(document.createTextNode(event.universityName));

      chip.addEventListener('click', () => {
        this.router.navigate(`#/detail/${event.applicationId}`);
      });

      strip.appendChild(chip);
    });
  }

  showDateDetails(dateStr) {
    const events = getEventsForDate(this.eventMap, dateStr);
    
    if (events.length === 0) return;

    const modal = document.createElement('div');
    modal.className = 'modal-scrim modal-scrim--open';
    modal.style.zIndex = '200';

    const sheet = document.createElement('div');
    sheet.className = 'modal-sheet modal-sheet--open';

    const handle = document.createElement('div');
    handle.className = 'modal-sheet__drag-handle';
    sheet.appendChild(handle);

    const header = document.createElement('div');
    header.className = 'modal-sheet__header';

    const title = document.createElement('h2');
    title.className = 'modal-sheet__title';
    title.textContent = formatDate(dateStr, 'long');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-sheet__close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => modal.remove());

    header.appendChild(title);
    header.appendChild(closeBtn);
    sheet.appendChild(header);

    const content = document.createElement('div');
    content.className = 'modal-sheet__content';

    events.forEach(event => {
      const eventEl = document.createElement('div');
      eventEl.className = 'date-event';

      const type = document.createElement('span');
      type.className = 'date-event__type';
      type.style.backgroundColor = getEventTypeColor(event.type);
      type.textContent = event.type;

      const uni = document.createElement('strong');
      uni.textContent = event.universityName;

      const prog = document.createElement('p');
      prog.textContent = event.programName;

      const link = document.createElement('button');
      link.className = 'btn btn--primary btn--block';
      link.textContent = 'View Application';
      link.addEventListener('click', () => {
        this.router.navigate(`#/detail/${event.applicationId}`);
        modal.remove();
      });

      eventEl.appendChild(type);
      eventEl.appendChild(uni);
      eventEl.appendChild(prog);
      eventEl.appendChild(link);
      content.appendChild(eventEl);
    });

    sheet.appendChild(content);

    modal.appendChild(sheet);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  navigateMonth(direction) {
    this.currentMonth += direction;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.selectedDate = null;
    this.renderMonthLabel();
    this.renderGrid();
  }

  setupEventListeners() {
    document.getElementById('cal-prev')?.addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('cal-next')?.addEventListener('click', () => this.navigateMonth(1));
  }

  /**
   * Setup FAB - handled globally, just add event listener here
   */
  setupFab() {
    // FAB is global, just listen for the event
    window.addEventListener('fab:add-calendar', () => {
      this.openQuickAddModal();
    });
  }

  /**
   * Open quick add deadline modal
   */
  openQuickAddModal() {
    // Get all applications for selection
    const apps = this.appService.getAllApplications();
    
    if (apps.length === 0) {
      toast.info('Add an application first from Applications screen');
      return;
    }

    // Create content as a DOM element
    const content = document.createElement('div');
    
    const intro = document.createElement('p');
    intro.textContent = 'Select an application and add a deadline:';
    intro.style.marginBottom = '16px';
    intro.style.color = 'var(--color-text-secondary)';
    content.appendChild(intro);
    
    // Application select
    const appGroup = document.createElement('div');
    appGroup.className = 'form-group';
    const appLabel = document.createElement('label');
    appLabel.className = 'form-label';
    appLabel.textContent = 'Application';
    const appSelect = document.createElement('select');
    appSelect.className = 'form-input';
    appSelect.id = 'quick-app-select';
    apps.forEach(app => {
      const option = document.createElement('option');
      option.value = app.id;
      option.textContent = app.universityName + ' - ' + app.programName;
      appSelect.appendChild(option);
    });
    appGroup.appendChild(appLabel);
    appGroup.appendChild(appSelect);
    content.appendChild(appGroup);
    
    // Type select
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    const typeLabel = document.createElement('label');
    typeLabel.className = 'form-label';
    typeLabel.textContent = 'Deadline Type';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'form-input';
    typeSelect.id = 'quick-deadline-type';
    const types = [
      { value: 'submissionDeadline', text: 'Submission Deadline' },
      { value: 'resultsPublicationDate', text: 'Results Publication' },
      { value: 'interviewDate', text: 'Interview Date' },
      { value: 'oralExamDate', text: 'Oral Exam Date' }
    ];
    types.forEach(t => {
      const option = document.createElement('option');
      option.value = t.value;
      option.textContent = t.text;
      typeSelect.appendChild(option);
    });
    typeGroup.appendChild(typeLabel);
    typeGroup.appendChild(typeSelect);
    content.appendChild(typeGroup);
    
    // Date input
    const dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    const dateLabel = document.createElement('label');
    dateLabel.className = 'form-label';
    dateLabel.textContent = 'Date';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'form-input';
    dateInput.id = 'quick-deadline-date';
    dateGroup.appendChild(dateLabel);
    dateGroup.appendChild(dateInput);
    content.appendChild(dateGroup);
    
    const modal = new Modal('Add Deadline', content);
    modal.open();
    
    modal.addActions([
      { label: 'Save', type: 'primary', onClick: () => {
        const appId = document.getElementById('quick-app-select').value;
        const field = document.getElementById('quick-deadline-type').value;
        const date = document.getElementById('quick-deadline-date').value;
        if (!appId || !field || !date) {
          toast.error('Please fill in all fields');
          return;
        }
        this.appService.updateApplication(appId, { [field]: date });
        toast.success('Deadline added!');
        modal.close();
        this.setupCalendar();
      }},
      { label: 'Cancel', type: 'secondary', onClick: () => modal.close() }
    ]);
  }
}