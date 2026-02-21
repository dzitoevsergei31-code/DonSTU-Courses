import express from 'express';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead,
  getUnreadCount 
} from '../controllers/notificationController.js';
import { routeProtection } from '../middleware/route-protection.js';

export const notificationRouter = express.Router();

notificationRouter.get('/', routeProtection, getUserNotifications);
notificationRouter.get('/unread-count', routeProtection, getUnreadCount);
notificationRouter.put('/:notificationId/read', routeProtection, markAsRead);
notificationRouter.put('/read-all', routeProtection, markAllAsRead);