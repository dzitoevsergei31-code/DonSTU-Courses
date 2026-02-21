import express from 'express';
import { 
  checkAuth, 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  changePassword,
} from '../controllers/authController.js';
import { routeProtection } from '../middleware/route-protection.js';

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/check', routeProtection, checkAuth);

authRouter.get('/profile', routeProtection, getProfile);
authRouter.put('/profile', routeProtection, updateProfile);
authRouter.put('/profile/password', routeProtection, changePassword);