import express from 'express';
import {
  getDashboardStats,
  getAllAgents,
  addAgent,
  toggleAgentStatus,
  resetAgentPassword,
  deleteLead,
  getAgentReports,
  getAgentDailyStats,
  getAdminDailyStats,
  getSingleAgentStats,
} from '../controllers/adminController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { subscribePageToWebhook } from '../services/metaService.js';


const router = express.Router();

// ── Agent bhi access kar sake ─────────────────────────────
router.get('/my-stats', auth, getAgentDailyStats);

// ── Ab se saare routes Admin Only ─────────────────────────
router.use(auth, adminOnly);

router.get('/stats',                        getDashboardStats);
router.get('/agents',                       getAllAgents);
router.post('/agents',                      addAgent);
router.put('/agents/:agentId/toggle',       toggleAgentStatus);
router.put('/agents/:agentId/password',     resetAgentPassword);
router.delete('/leads/:leadId',             deleteLead);
router.get('/reports',                      getAgentReports);
router.get('/overall-stats',                getAdminDailyStats);
router.get('/agent-stats/:agentId',         getSingleAgentStats);
router.post('/subscribe-page', auth, adminOnly, async (req, res) => {
  try {
    const result = await subscribePageToWebhook();
    res.json({ message: '✅ Page subscribed!', result });
  } catch (err) {
    res.status(500).json({ message: '❌ Error', error: err.message });
  }
});
export default router;