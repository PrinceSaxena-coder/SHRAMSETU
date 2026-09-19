import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const VALID_REGISTRATION_ROLES = ['customer', 'worker'];

function buildSafeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body || {};

    if (!name || !email || !password || !role) {
      const error = new Error('name, email, password, and role are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      const error = new Error('Please provide a valid email address.');
      error.statusCode = 400;
      throw error;
    }

    if (String(password).length < 6) {
      const error = new Error('Password must be at least 6 characters long.');
      error.statusCode = 400;
      throw error;
    }

    if (!VALID_REGISTRATION_ROLES.includes(role)) {
      const error = new Error('Role must be either customer or worker.');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      passwordHash,
      role,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      const error = new Error('email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(req.user.userId).lean();

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      user: buildSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};
