import notificationService from '../services/notification.service.js';

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
      if (message && message.includes('{submitter}')) {
        finalMessage = message.replace('{submitter}', submitterName);
      }

      const notif = await _models.notification.create({
        recipient_id,
        reservation_id,
        submitter_id,
        type: type || 'info',
        message: finalMessage,
        score_data: null, // ✅ Explicitly set to null
        is_read: false,
        created_at: new Date(),
        read_at: null // ✅ Explicitly set to null
      });

      // 🔥 FIREBASE PUSH NOTIFICATION LOGIC
      if (_models.utilisateur && recipient_id) {
        const recipient = await _models.utilisateur.findByPk(recipient_id);
        if (recipient && recipient.fcm_token) {
          const title = 'Padel Mindset'; // Default title
          console.log(`🚀 Sending FCM to user ${recipient_id} (Token: ${recipient.fcm_token.substring(0, 10)}...)`);
          await notificationService.sendMulticast(
            [recipient.fcm_token],
            title,
            finalMessage,
            {
              type: type || 'info',
              reservationId: reservation_id ? String(reservation_id) : '',
              submitterId: submitter_id ? String(submitter_id) : '',
              click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
          );
        } else {
          console.log(`⚠️ User ${recipient_id} has no FCM token.`);
        }
      }

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
        let submitterPhoto = null;
        if (n.submitter_id && _models.utilisateur) {
          const u = await _models.utilisateur.findByPk(n.submitter_id);
          if (u) {
            submitterName = `${u.prenom} ${u.nom}`.trim();
            submitterPhoto = u.photo; // ✅ Include profile picture
          }
        }

        results.push({
          id: n.id,
          recipient_id: n.recipient_id,
          reservation_id: n.reservation_id,
          submitter_id: n.submitter_id,
          type: n.type,
          message: n.message,
          isRead: n.is_read,
          is_read: n.is_read, // ✅ Both formats
          createdAt: n.created_at,
          created_at: n.created_at,
          submitterName: submitterName,
          submitter_name: submitterName, // ✅ Both formats
          submitterPhoto: submitterPhoto, // ✅ NEW
          submitter_photo: submitterPhoto
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

// ✅ NEW: Mark all notifications as read for a user
export async function markAllNotificationsRead(userId) {
  if (_models && _models.notification) {
    try {
      await _models.notification.update(
        { is_read: true },
        { where: { recipient_id: userId, is_read: false } }
      );
      return { success: true, message: 'All notifications marked as read' };
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return { success: false, error: err.message };
    }
  }

  // In-memory fallback
  _notifications.forEach(n => {
    if (String(n.recipient_id) === String(userId)) {
      n.isRead = true;
    }
  });
  return { success: true, message: 'All notifications marked as read' };
}

// ✅ NEW: Delete a single notification
export async function deleteNotification(id, userId) {
  if (_models && _models.notification) {
    try {
      const deleted = await _models.notification.destroy({
        where: { 
          id: id,
          recipient_id: userId // Authorization check: only recipient can delete
        }
      });
      return deleted > 0;
    } catch (err) {
      console.error('Failed to delete notification from DB:', err);
      return false;
    }
  }

  const idx = _notifications.findIndex(n => String(n.id) === String(id) && String(n.recipient_id) === String(userId));
  if (idx >= 0) {
    _notifications.splice(idx, 1);
    return true;
  }
  return false;
}

// ✅ NEW: Delete all notifications for a user
export async function deleteAllNotifications(userId) {
  if (_models && _models.notification) {
    try {
      const deleted = await _models.notification.destroy({
        where: { recipient_id: userId }
      });
      return { success: true, count: deleted };
    } catch (err) {
      console.error('Failed to clear all notifications from DB:', err);
      return { success: false, error: err.message };
    }
  }

  const initialCount = _notifications.length;
  _notifications = _notifications.filter(n => String(n.recipient_id) !== String(userId));
  return { success: true, count: initialCount - _notifications.length };
}

export function removeAll() {
  _notifications = [];
  _nextId = 1;
}