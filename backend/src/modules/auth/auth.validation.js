import AppError from '../../utils/AppError.js';

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, 'Email and password are required.'));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError(400, 'Please provide a valid email address.'));
  }
  next();
};

export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new AppError(400, 'Name, email, and password are required.'));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError(400, 'Please provide a valid email address.'));
  }
  if (password.length < 6) {
    return next(new AppError(400, 'Password must be at least 6 characters long.'));
  }
  if (role && !['admin', 'member'].includes(role)) {
    return next(new AppError(400, 'Role must be either admin or member.'));
  }
  next();
};
