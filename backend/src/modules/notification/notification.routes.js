import { Router } from 'express';
import { getList, markRead, markAllRead } from './notification.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getList);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

export default router;
