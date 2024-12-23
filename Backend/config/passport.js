import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'userEmail',
      passwordField: 'password',
    },
    async (userEmail, password, done) => {
      try {
        
        const user = await User.findOne({ userEmail });
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

       
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        console.log("user authentiocated");
        
     
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.userId); 
});


passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findOne({ userId });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
