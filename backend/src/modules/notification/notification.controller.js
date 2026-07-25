import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from './notification.service.js';

export const getList = async (req, res, next) => {
  try {
    const list = await getUserNotifications(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: list
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notif = await markNotificationRead(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
