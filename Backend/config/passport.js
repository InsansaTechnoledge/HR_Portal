import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js'; // Ensure the User model is correctly imported

passport.use(
  new LocalStrategy(
    {
      usernameField: 'userId', // Using userId for login
      passwordField: 'password',
    },
    async (userId, password, done) => {
      try {
        // Find user by userId
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

export default passport;
