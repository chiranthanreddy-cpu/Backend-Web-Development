const crypto = require('crypto');

// In-memory store: suitable for development/learning only. Production requires a shared store like Redis.
const sessions = new Map();

const DEFAULT_TTL_MS = Number(process.env.SESSION_TTL_MS) || 60 * 60 * 1000;

function create(userId, ttlMs = DEFAULT_TTL_MS) {
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + ttlMs;

  const session = {
    id: sessionId,
    userId: Number(userId),
    expiresAt,
  };

  sessions.set(sessionId, session);
  return session;
}

function get(sessionId) {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Remove expired session during read
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

function destroy(sessionId) {
  if (!sessionId) return false;
  return sessions.delete(sessionId);
}

function clear() {
  sessions.clear();
}

module.exports = {
  create,
  get,
  destroy,
  clear,
};