import { Router } from 'express';
import { login, forgetPassword, validateOtp,resetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.post('/validateOtp', validateOtp);
router.post('/resetPassword',resetPassword);

export default router;
