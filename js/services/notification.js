/**
 * notification.js
 * Push notification and in-app alert scheduling
 */

/**
 * Request permission for push notifications
 * @returns {Promise<boolean>} Permission granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send a push notification
 * @param {string} title
 * @param {Object} options - title, body, icon, badge, tag, requireInteraction
 */
export function sendNotification(title, options = {}) {
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  try {
    new Notification(title, {
      icon: '/assets/icons/app-icon-192.png',
      badge: '/assets/icons/favicon.ico',
      ...options
    });
  } catch (e) {
    console.error('Notification error:', e);
  }
}

/**
 * Schedule a notification for a future date
 * @param {string} dateStr - ISO date string
 * @param {string} title
 * @param {Object} options
 */
export function scheduleNotification(dateStr, title, options = {}) {
  const targetDate = new Date(dateStr + 'T09:00:00Z').getTime();
  const now = Date.now();
  const delay = targetDate - now;

  if (delay > 0) {
    setTimeout(() => {
      sendNotification(title, options);
    }, delay);
  }
}

/**
 * Schedule notifications for key deadlines
 * 7 days, 3 days, 1 day before
 * @param {Object} application
 */
export function scheduleDeadlineNotifications(application) {
  const deadline = application.submissionDeadline;
  if (!deadline) return;

  const targetDate = new Date(deadline + 'T00:00:00Z').getTime();

  // 7 days before
  const sevenDaysBefore = new Date(targetDate - 7 * 24 * 60 * 60 * 1000);
  scheduleNotification(sevenDaysBefore.toISOString().split('T')[0], 'Application deadline in 7 days', {
    body: `${application.universityName} - ${application.programName}`,
    tag: `deadline-7d-${application.id}`
  });

  // 3 days before
  const threeDaysBefore = new Date(targetDate - 3 * 24 * 60 * 60 * 1000);
  scheduleNotification(threeDaysBefore.toISOString().split('T')[0], 'Application deadline in 3 days', {
    body: `${application.universityName} - ${application.programName}`,
    tag: `deadline-3d-${application.id}`,
    requireInteraction: true
  });

  // 1 day before
  const oneDayBefore = new Date(targetDate - 24 * 60 * 60 * 1000);
  scheduleNotification(oneDayBefore.toISOString().split('T')[0], 'Application deadline tomorrow!', {
    body: `${application.universityName} - ${application.programName}`,
    tag: `deadline-1d-${application.id}`,
    requireInteraction: true
  });
}
