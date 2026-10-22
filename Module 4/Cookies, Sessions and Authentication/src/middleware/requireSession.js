const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const { COOKIE_NAME } = require('../session/cookieConfig');

async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies && req.signedCookies[COOKIE_NAME];
    if (!sessionId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      sessionStore.destroy(sessionId);
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    req.sessionId = sessionId;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireSession;