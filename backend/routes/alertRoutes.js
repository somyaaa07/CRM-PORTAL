import express from 'express';
import { getMyAlerts, dismissAlert } from '../controllers/alertController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-alerts', auth, getMyAlerts);
router.put('/dismiss/:leadId', auth, dismissAlert);

export default router;