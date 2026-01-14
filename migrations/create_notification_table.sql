-- Create notification table for persistent storage
-- This replaces the in-memory notification system

CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    reservation_id INTEGER REFERENCES reservation(id) ON DELETE CASCADE,
    submitter_id INTEGER REFERENCES utilisateur(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_reservation ON notification(reservation_id);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notification(is_read);

-- Add comment
COMMENT ON TABLE notification IS 'Stores user notifications for reservations and system events';
COMMENT ON COLUMN notification.submitter_id IS 'ID of user who triggered the notification (null for system notifications)';
