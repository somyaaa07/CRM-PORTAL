import express from 'express';
import {
  verifyWebhook,
  receiveWebhook,
} from '../controllers/webhookController.js';

const router = express.Router();

router.get('/meta-leads',  verifyWebhook);
router.post('/meta-leads', receiveWebhook);

export default router;