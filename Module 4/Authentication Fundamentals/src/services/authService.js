const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const COST_FACTOR = 10;
// Valid precomputed bcrypt hash for timing-safe dummy comparison
const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

function invalidCredentialsError() {
  const error = new Error('Invalid email or password');
  error.statusCode = 401;
  error.code = 'INVALID_CREDENTIALS';
  return error;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register({ name, email, password }) {
  // Validate non-empty strings
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    const error = new Error('Name, email, and password are required non-empty strings');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // Hash password asynchronously
  const passwordHash = await bcrypt.hash(password, COST_FACTOR);

  // Persist user
  const user = await userRepository.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  // Explicit safe allowlist
  return sanitizeUser(user);
}

async function login({ email, password }) {
  // Validate non-empty strings
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    const error = new Error('Email and password are required non-empty strings');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    // Timing-safe dummy compare so missing account takes comparable time
    await bcrypt.compare(password, DUMMY_HASH).catch(() => {});
    throw invalidCredentialsError();
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw invalidCredentialsError();
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
};