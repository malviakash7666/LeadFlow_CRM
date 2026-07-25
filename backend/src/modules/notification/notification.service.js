import { Notification, Lead } from '../../database/models/index.js';
import { sendNotification } from '../../utils/socket.js';
import AppError from '../../utils/AppError.js';

export const getUserNotifications = async (userId) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Lead, as: 'lead', attributes: ['id', 'name', 'company'] }
    ]
  });
};

export const createNotification = async ({ userId, leadId, type, title, message }) => {
  const notif = await Notification.create({
    userId,
    leadId,
    type,
    title,
    message,
    isRead: false
  });

  const eagerNotif = await Notification.findByPk(notif.id, {
    include: [
      { model: Lead, as: 'lead', attributes: ['id', 'name', 'company'] }
    ]
  });

  sendNotification(userId, 'notification:received', eagerNotif);

  return eagerNotif;
};

export const markNotificationRead = async (userId, id) => {
  const notif = await Notification.findOne({ where: { id, userId } });
  if (!notif) {
    throw new AppError(404, 'Notification not found');
  }

  notif.isRead = true;
  await notif.save();
  return notif;
};

export const markAllNotificationsRead = async (userId) => {
  await Notification.update(
    { isRead: true },
    { where: { userId, isRead: false } }
  );
};
