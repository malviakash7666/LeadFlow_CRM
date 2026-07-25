import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../database/models/index.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.util.js';
import AppError from '../../utils/AppError.js';

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;

  return { user, accessToken, refreshToken };
};

export const registerUser = async (name, email, password, role) => {
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
  if (!token) {
    throw new AppError(400, 'Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey');
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new AppError(401, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};
