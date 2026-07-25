import bcrypt from 'bcrypt';
import { User } from '../../database/models/index.js';
import AppError from '../../utils/AppError.js';

export const getAllUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ['password'] }
  });
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
};

export const createUserByAdmin = async (name, email, password, role) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'member'
  });

  user.password = undefined;
  return user;
};

export const updateUserByAdmin = async (id, name, email, role) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (role) {
    if (!['admin', 'member'].includes(role)) {
      throw new AppError(400, 'Invalid role');
    }
    user.role = role;
  }

  await user.save();
  user.password = undefined;
  return user;
};

export const deleteUserByAdmin = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  await user.destroy();
};
