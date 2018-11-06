const router    = require('express').Router();

router.get('/', (req, res) => {
    res.send('Index Page');
})

module.exports = router;