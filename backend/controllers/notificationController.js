import { Notification } from "../models/index.js";

// my notifications
const getMyNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
    
    });

    const unreadCount = await Notification.count({ // ← count() instead of findAll()
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { id: notificationId, userId } }
    );

    res.json({ message: 'Notification marked as read' }); // ← typo fixed

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { getMyNotification, markAsRead, markAllAsRead };