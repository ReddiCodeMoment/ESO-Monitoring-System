import { useNotification } from '../context/NotificationContext'
import '../styles/notifications.css'

export function NotificationToast() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-content">
            <div className="notification-header">
              <span className="notification-icon">
                {notification.type === 'success' && '✓'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'info' && 'ℹ'}
              </span>
              <span className="notification-title">{notification.title}</span>
            </div>
            {notification.message && (
              <p className="notification-message">{notification.message}</p>
            )}
          </div>

          <div className="notification-actions">
            {notification.action && (
              <button
                className="notification-action-btn"
                onClick={() => {
                  notification.action?.onClick()
                  removeNotification(notification.id)
                }}
              >
                {notification.action.label}
              </button>
            )}
            <button
              className="notification-close-btn"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
