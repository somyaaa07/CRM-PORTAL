import express from 'express';
import {
    getMyNotification,
    markAllAsRead,
    markAsRead
} from '../controllers/notificationController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router();

router.get('/',auth,getMyNotification);
router.put('/read-all',auth, markAllAsRead);

router.put('/:notificationId/read',auth,markAsRead);

export default router;