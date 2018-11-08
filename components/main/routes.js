const router    = require('express').Router();
const passport = require('passport')
router.get('/', (req, res) => {
    
    res.render('components/main/index', {name: 'Index Page', titlebarName: 'Home'});
})
// router.get('/auth/fb/next', passport.authenticate('facebook', {
//     // successRedirect: '/next',
//     failureRedirect: '/'
// }), (req, res) => {
//     console.log(req.originalUrl)
// })
// router.get('/auth/fb', passport.authenticate('facebook', {
//     scope: ['public_profile', 'email']
// }));
router.get('/next', (req, res) => {
    req.flash('errors', 'This is an error.')
    res.redirect('/')
})
module.exports = router;