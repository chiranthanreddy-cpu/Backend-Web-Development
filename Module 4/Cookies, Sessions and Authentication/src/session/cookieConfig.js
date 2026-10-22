const COOKIE_NAME = 'sid';

function getCookieOptions() {
  const isSecure = process.env.COOKIE_SECURE === 'true';
  const ttlMs = Number(process.env.SESSION_TTL_MS) || 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge: ttlMs,
  };
}

function getClearCookieOptions() {
  const options = getCookieOptions();
  delete options.maxAge;
  return options;
}

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  getClearCookieOptions,
};