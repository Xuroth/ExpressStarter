const passport          = require('passport');
const FacebookStrategy  = require('@passport-next/passport-facebook').Strategy;
const Users             = require('./userModel');
const config            = require('config');
const facebookAPI          = config.get('apiKeys.facebook');
passport.serializeUser(function(user, done) {
    done(null, user.id)
});
passport.deserializeUser(function(id, done) {
    Users.findById(id, (err, user) => {
        if(err) console.log(err);
        done(err, user)
    })
})
passport.use(new FacebookStrategy({
    clientID: facebookAPI.appID,
    clientSecret: facebookAPI.appSecret,
    callbackURL: facebookAPI.callback,
    profileFields: ['id', 'email', 'short_name', 'picture'],
    passReqToCallback: true,
    graphApiVersion: 'v3.2'
},
function(req, accessToken, refreshToken, profile, done) {
    process.nextTick( () => {
        if(!req.user) {
            Users.findOne({'oauth.facebook.id': profile.id}, (err, user) => {
                if(err) return done(err);
                if(user) {
                    return done(null, user);
                } else {
                    var newUser = new Users();
                    let facebook = {
                        id: profile.id,
                        token: accessToken,
                        short_name: profile._json.short_name,
                        email: profile._json.email
                    }
                    newUser.oauth.facebook = facebook;
                    newUser.email = facebook.email;
                    newUser.username = facebook.short_name;
                    newUser.save( (err) => {
                        if(err) throw err;
                        return done(null, newUser);
                    })
                }
            })
        } else {
            
            let user = req.user;
            user.email = (req.user.email?req.user.email:profile._json.email)
            user.username = 'This just in';
            console.log(req.user)
            user.save( (err) => {
                if(err) throw err;
                return done(null, user)
            })
        }
    })
}))

module.exports = passport;