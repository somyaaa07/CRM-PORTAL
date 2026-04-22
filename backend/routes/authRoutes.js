import express from 'express';
import { register, login } from '../controllers/authController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register → Sirf admin karega (protected)
router.post('/register', auth, adminOnly, register);

// POST /api/auth/login → Sabke liye open
router.post('/login', login);

export default router;