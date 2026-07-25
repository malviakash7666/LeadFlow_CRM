import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  let errorResponse = {
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : err.message
  };

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    err.statusCode = 400;
    errorResponse.message = err.errors.map(el => el.message).join(', ');
    errorResponse.error = err.name;
  }

  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    errorResponse.message = 'Invalid token. Please log in again.';
    errorResponse.error = err.name;
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    errorResponse.message = 'Your session has expired. Please log in again.';
    errorResponse.error = err.name;
  }

  res.status(err.statusCode).json(errorResponse);
};

export default errorHandler;
