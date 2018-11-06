const express   = require('express');
const app = express();
const morgan    = require('morgan')

//Set 'production' flag for easier-to-read env detection
var isProduction = process.env.NODE_ENV === 'production';

//Initialize Morgan logger
if(isProduction) {
    //Use traditional log format on production env
    app.use(morgan('common'))
} else {
    //Custom log format for pretty display on all non-production envs
    let format = '[:date[web]] - :method ":url" Status: :status\n  From: :remote-addr - HTTP/:http-version\n  Response Time: :response-time ms';
    app.use(morgan(format)) // See Morgan Docs for more info https://github.com/expressjs/morgan
}

//Define Basic routes
app.use('/', require('./components/main/routes'));

//Error 404 handler
app.use( (req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err)
})

//Non-Production env: Display stacktrace data
if(!isProduction) {
    app.use( (err, req, res, next) => {
        //Send stacktrace to console
        console.warn(err.stack);
        //Set error status, default to 500 - Internal Service Error
        res.status(err.status || 500);
        //Deliver response depending on request type
        if(req.is('application/json')) {
            //Return JSON
            res.json({'errors': {
                message: err.message,
                error: err,
                stacktrace: err.stack
            }});
        } else {
            //Return HTML
            res.send('ERROR!')
        }
    });
}

//Production env: Show error, do NOT include stacktrace data
app.use( (err, req, res, next) => {
    res.status(err.status || 500);
    res.json({'errors': {
        message: err.message,
        error: {}
    }});
});

//Initialize HTTP server;
app.listen(3000, () => {
    console.log('Server started on :3000')
});