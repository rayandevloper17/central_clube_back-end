// Simple in-memory notification bus for demo purposes
// In production, replace with persistent storage (DB table)

let _notifications = [];
let _nextId = 1;

export function addNotification({ recipient_id, reservation_id, submitter_id, type, message }) {
  const id = String(_nextId++);
  const notif = {
    id,
    recipient_id: String(recipient_id),
    reservation_id: reservation_id != null ? String(reservation_id) : null,
    submitter_id: submitter_id != null ? String(submitter_id) : null,
    type: type || 'info',
    message: message || '',
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  _notifications.push(notif);
  return notif;
}

export function getNotificationsForUser(userId) {
  return _notifications.filter(n => String(n.recipient_id) === String(userId));
}

export function markNotificationRead(id) {
  const idx = _notifications.findIndex(n => String(n.id) === String(id));
  if (idx >= 0) {
    _notifications[idx].isRead = true;
    return _notifications[idx];
  }
  return null;
}

export function removeAll() {
  _notifications = [];
  _nextId = 1;
}