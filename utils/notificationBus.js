// Persistent notification logic - now checks for database model
// If model exists, saves to DB. Otherwise, falls back to in-memory (legacy support)

let _notifications = [];
let _nextId = 1;

let _models = null;

export function setNotificationModels(models) {
  _models = models;
}

export async function addNotification({ recipient_id, reservation_id, submitter_id, type, message }) {
  // If we have models and notification table exists, save to DB
  if (_models && _models.notification) {
    try {
      // Find submitter name if available for dynamic messages
      let submitterName = 'Système';
      if (submitter_id && _models.utilisateur) {
        const submitter = await _models.utilisateur.findByPk(submitter_id);
        if (submitter) {
          submitterName = `${submitter.prenom} ${submitter.nom}`.trim();
        }
      }

      // Enrich message if needed (e.g. if message is template-like)
      let finalMessage = message;
      if (message.includes('{submitter}')) {
        finalMessage = message.replace('{submitter}', submitterName);
      }

      const notif = await _models.notification.create({
        recipient_id,
        reservation_id,
        submitter_id,
        type: type || 'info',
        message: finalMessage,
        is_read: false,
        created_at: new Date()
      });
      return notif;
    } catch (err) {
      console.error('Failed to save notification to DB:', err);
      // Fallback to memory on error
    }
  }

  // Fallback / Legacy in-memory
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
    submitterName: 'Système' // Default for in-memory
  };
  _notifications.push(notif);
  return notif;
}

export async function getNotificationsForUser(userId) {
  if (_models && _models.notification) {
    try {
      // Fetch from DB with sorting
      const notifs = await _models.notification.findAll({
        where: { recipient_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50 // Limit history
      });
      
      // Map to frontend expected format
      // We need to fetch submitter names efficiently
      // For simplicity, we'll let the frontend display "Système" or simple messages
      // OR we can include submitter data.
      // Let's attach submitter name if possible
      const results = [];
      for (const n of notifs) {
        let submitterName = 'Système';
        if (n.submitter_id && _models.utilisateur) {
           const u = await _models.utilisateur.findByPk(n.submitter_id);
           if (u) submitterName = `${u.prenom} ${u.nom}`.trim();
        }
        
        results.push({
          id: n.id,
          recipient_id: n.recipient_id,
          reservation_id: n.reservation_id,
          submitter_id: n.submitter_id,
          type: n.type,
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          submitterName: submitterName
        });
      }
      return results;
    } catch (err) {
      console.error('Failed to fetch notifications from DB:', err);
    }
  }

  return _notifications.filter(n => String(n.recipient_id) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markNotificationRead(id) {
  if (_models && _models.notification) {
    try {
      const notif = await _models.notification.findByPk(id);
      if (notif) {
        await notif.update({ is_read: true });
        return notif;
      }
    } catch (err) {
      console.error('Failed to update notification in DB:', err);
    }
  }

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