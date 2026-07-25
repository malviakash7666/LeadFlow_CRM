import jwt from 'jsonwebtoken';
import { User } from '../database/models/index.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError(401, 'You are not logged in. Please log in to get access.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey');

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new AppError(401, 'The user belonging to this token no longer exists.'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
