const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models/User'); 

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
  done(null, user.userEmail); 
});


passport.deserializeUser(async (userEmail, done) => {
  try {
    const user = await User.findOne({ userEmail });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

