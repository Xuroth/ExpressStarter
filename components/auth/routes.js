const router    = require('express').Router();
const passport  = require('passport');

//Facebook Login/Register Request
router.get('/fb', passport.authenticate('facebook', {
    successRedirect: '/',
    successFlash: 'Thanks! You\'re good to go!',
    failureRedirect: '/',
    failureFlash: 'Hmm... Something went wrong.'
}))

//Facebook Login/Register Callback Handler
router.get('/fb/next', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}));

router.get('/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}))

router.get('/google/next', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}))
//Local Register Form
router.get('/register', (req, res) => {
    res.render('components/auth/register', {titlebarName: 'Register'})
})

//Local Register Form Handler
router.post('/register', passport.authenticate('localRegister', {
    successRedirect: '/',
    failureRedirect: '/auth/register'
}))

//Local Login Form
router.get('/login', (req, res) => {
    res.render('components/auth/login', {titlebarName: 'Login'})
})

router.post('/login', passport.authenticate('localLogin', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
}))

module.exports = router;