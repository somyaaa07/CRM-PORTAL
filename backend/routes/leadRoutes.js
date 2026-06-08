import express from 'express';
import {
  addLead,
  getAllLeads,
  getMyLeads,
  assignLead,
  updateLeadStatus,
  getLeadById,
  getLeadDetail,
  bulkUpload,
} from '../controllers/leadController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();


// router.post('/bulk-upload',        auth, adminOnly, upload.single('file'), bulkUpload);
// router.post('/add-lead',  auth, addLead);
// router.get('/my-leads',            auth,            getMyLeads);
// router.post('/',                   auth, adminOnly, addLead);
// router.get('/',                    auth, adminOnly, getAllLeads);
// ── Specific routes PEHLE ─────────────────────────────────
router.post('/bulk-upload',   auth, adminOnly, upload.single('file'), bulkUpload);
router.post('/add-lead',      auth,            addLead);   // ✅ auth added, moved up
router.get('/my-leads',       auth,            getMyLeads);
router.get('/',               auth, adminOnly, getAllLeads);



router.get('/:leadId/detail',      auth,            getLeadDetail);
router.get('/:leadId',             auth,            getLeadById);
router.put('/:leadId/assign',      auth, adminOnly, assignLead);
router.put('/:leadId/status',      auth,            updateLeadStatus);

export default router;