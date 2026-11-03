'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;

    // 1. Returning OAuth user: match the stable Google ID first.
    const existingGoogleUser = users.find(
      (user) => user.googleId === googleId
    );

    if (existingGoogleUser) {
      return done(null, existingGoogleUser);
    }

    const email = profile.emails[0].value;

    // 2. Existing local account: link only when Google's email is verified.
    const existingEmailUser = users.find(
      (user) => user.email === email
    );

    if (existingEmailUser) {
      if (profile._json.email_verified === true) {
        existingEmailUser.googleId = googleId;
        return done(null, existingEmailUser);
      }

      return done(null, false);
    }

    // 3. Brand-new user.
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: profile.displayName,
      role: 'member',
    };

    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
