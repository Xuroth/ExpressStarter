const passport          = require('passport');
const LocalStrategy     = require('passport-local');
const FacebookStrategy  = require('@passport-next/passport-facebook').Strategy;
const GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
const Users             = require('./userModel');
const config            = require('config');
const facebookAPI          = config.get('apiKeys.facebook');
const googleAPI         = config.get('apiKeys.google')

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
    graphApiVersion: 'v3.2',
    scope: ['public_profile', 'email']
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
            let facebook = {
                id: profile.id,
                token: accessToken,
                short_name: profile._json.short_name,
                email: profile._json.email
            };
            user.oauth.facebook = facebook;
            user.email = (req.user.email?req.user.email:facebook.email);
            user.username = (req.user.username?req.user.username:facebook.short_name)

            user.save( (err) => {
                if(err) throw err;
                return done(null, user);
            })
        }
    })
}))

passport.use(new GoogleStrategy({
    clientID: googleAPI.clientID,
    clientSecret: googleAPI.clientSecret,
    callbackURL: googleAPI.callback,
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    passReqToCallback: true
},
function(req, token, refreshToken, profile, done) {
    console.log('Google Profile: ', profile)
    process.nextTick( () => {
        if(!req.user){
            Users.findOne({'oauth.google.id': profile.id}, (err, user) => {
                if(err) return done(err);
                if(user) {
                    return done(null, user)
                } else {
                    var newUser = new Users();
                    let google = {
                        id: profile.id,
                        token: token,
                        name: profile.displayName,
                        email: profile.emails[0].value
                    }
                    newUser.oauth.google = google;

                    newUser.save( (err) => {
                        if(err) throw err;
                        return done(null, newUser);
                    })
                }
            })
        } else {
            let user = req.user;
            let google = {
                id: profile.id,
                token: token,
                name: profile.displayName,
                email: profile.emails[0].value
            };
            user.oauth.google = google;
            user.email = (req.user.email?req.user.email:profile.emails[0].value);
            user.username = (req.user.username?req.user.username:profile.displayName);

            user.save( (err) => {
                if(err) throw err;
                return done(null, user)
            })
        }
    })
}))

passport.use('localRegister', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done) {
    process.nextTick( () => {        
        Users.findOne({'email': username}, (err, user) => {
            if(err) {
                console.log(err)
                return done(err);
            }
            if(user) {
                return done(null, false, req.flash('errors','That email is already registered.'));
            } else {
                var newUser = new Users();
                newUser.email = username;
                newUser.password = newUser.generateHash(password);
                newUser.username = req.body.username;

                newUser.save( (err) => {
                    if(err){
                        throw err;
                    }
                    return done(null, newUser, req.flash('success', 'Thanks! You\'re now able to login.' ));
                })
            }
        })
    })
}))

passport.use('localLogin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done) {
    Users.findOne({'email': username}, (err, user) => {
        if(err) return done(err);
        if(!user) {
            return done(null, false, req.flash('errors', 'Unable to login. Check your email and password, then try again.'));
        }
        if(!user.validPassword(password)) {
           return done(null,false, req.flash('errors', 'We dont recognize that information. Check your email and password and try again.'));
        }
        return done(null, user, req.flash('success', 'Welcome back!'))
    })
}))
module.exports = passport;