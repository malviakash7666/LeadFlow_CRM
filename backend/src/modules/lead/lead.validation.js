import AppError from '../../utils/AppError.js';

export const validateCaptureLead = (req, res, next) => {
  const { name, email, company, phone, message } = req.body;
  if (!name || !email || !company || !phone || !message) {
    return next(new AppError(400, 'Name, email, company, phone, and message are required.'));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError(400, 'Please provide a valid email address.'));
  }
  next();
};

export const validateUpdateLeadStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new AppError(400, 'Status is required.'));
  }
  const validStatuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
  }
  next();
};

export const validateAssignLead = (req, res, next) => {
  const { assignedTo } = req.body;
  if (assignedTo === undefined) {
    return next(new AppError(400, 'assignedTo user ID is required.'));
  }
  next();
};

export const validateAddNote = (req, res, next) => {
  const { note } = req.body;
  if (!note || note.trim() === '') {
    return next(new AppError(400, 'Note content is required.'));
  }
  next();
};
