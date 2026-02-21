import { Notification} from '../models/index.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Проверяем, существует ли пользователь
    if (!userId) {
      return res.json({
        success: true,
        notifications: []
      });
    }

    const userNotifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Если уведомлений нет, возвращаем пустой массив
    if (!userNotifications || userNotifications.length === 0) {
      return res.json({
        success: true,
        notifications: []
      });
    }

    // Форматируем уведомления для фронтенда
    const formattedNotifications = userNotifications.map(notification => {
      // ... существующий код форматирования ...
      let iconType = 'system';
      let color = 'text-[#003071]';
      let bgColor = 'bg-[#003071]/10';

      switch (notification.type) {
        case 'course':
          iconType = 'course';
          color = 'text-[#003071]';
          bgColor = 'bg-[#003071]/10';
          break;
        case 'achievement':
          iconType = 'achievement';
          color = 'text-[#9C27B0]';
          bgColor = 'bg-[#9C27B0]/10';
          break;
        case 'reminder':
          iconType = 'deadline';
          color = 'text-[#718FDD]';
          bgColor = 'bg-[#718FDD]/10';
          break;
        case 'news':
          iconType = 'message';
          color = 'text-[#365DA6]';
          bgColor = 'bg-[#365DA6]/10';
          break;
        default:
          iconType = 'system';
          color = 'text-gray-500';
          bgColor = 'bg-gray-500/10';
      }

      return {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(notification.createdAt),
        iconType,
        color,
        bgColor,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl
      };
    });

    res.json({
      success: true,
      notifications: formattedNotifications
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    // Возвращаем успешный ответ с пустым массивом вместо ошибки
    res.json({
      success: true,
      notifications: []
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        userId 
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Уведомление помечено как прочитанное'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении уведомления'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { 
        where: { 
          userId,
          isRead: false
        } 
      }
    );

    res.json({
      success: true,
      message: 'Все уведомления помечены как прочитанные'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении уведомлений'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении количества непрочитанных уведомлений'
    });
  }
};

// Вспомогательная функция для форматирования времени
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} минут назад`;
  if (diffHours < 24) return `${diffHours} часов назад`;
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  
  return new Date(date).toLocaleDateString('ru-RU');
};