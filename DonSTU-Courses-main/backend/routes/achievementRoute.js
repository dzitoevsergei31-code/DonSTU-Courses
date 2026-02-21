import express from 'express';
import { 
  getUserAchievements, 
  getAchievementProgress 
} from '../controllers/achievementController.js';
import { routeProtection } from '../middleware/route-protection.js';

export const achievementRouter = express.Router();

achievementRouter.get('/', routeProtection, getUserAchievements);
achievementRouter.get('/:achievementId/progress', routeProtection, getAchievementProgress);