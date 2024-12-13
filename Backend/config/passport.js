const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models/User'); // Make sure you import your User model

passport.use(
  new LocalStrategy(
    {
      usernameField: 'userId', // We are using userId for login
      passwordField: 'password',
    },
    async (userId, password, done) => {
      try {
        // Find user by userId (which was randomly generated)
        const user = await User.findOne({ userId });
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Successfully authenticated
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user into session (by user ID)
passport.serializeUser((user, done) => {
  done(null, user.userId); // Using userId for session
});

// Deserialize user from session
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findOne({ userId });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

