import express from 'express';
import {
  saveCallLog,
  getCallLogsByLead,
  getMyCallLogs,
} from '../controllers/callLogController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// POST   /api/call-logs          → Call log save karo
router.post('/', auth, saveCallLog);

// GET    /api/call-logs/my-logs  → Agent ki apni history
router.get('/my-logs', auth, getMyCallLogs);

// GET    /api/call-logs/lead/:leadId → Ek lead ki poori history
router.get('/lead/:leadId', auth, getCallLogsByLead);

export default router;