import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from './user.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));


router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
