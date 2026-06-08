import express from 'express';
import { getMyAlerts, dismissAlert ,getMetaLeadAlerts } from '../controllers/alertController.js';
import { adminOnly, auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-alerts', auth, getMyAlerts);
router.put('/dismiss/:leadId', auth, dismissAlert);
router.get('/meta-leads-alert',auth , adminOnly , getMetaLeadAlerts)

export default router;