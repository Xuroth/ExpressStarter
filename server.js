//Define server vars
const express       = require('express');
const morgan        = require('morgan');
const helmet        = require('helmet');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');
const MongoStore    = require('connect-mongodb-session')(session);
const config        = require('config');
// const handlebars    = require('express-handlebars');
// const extendHbs     = require('handlebars-extend-block');
const exphbs        = require('express-hbs');
const flash         = require('express-flash');
const favicon       = require('serve-favicon');
const passport      = require('passport');
const mongoose      = require('mongoose');
const app           = express();

//Set 'production' flag for easier-to-read env detection
var isProduction = process.env.NODE_ENV === 'production';

//Use helmet to set headers
app.use(helmet());

//Initialize Morgan logger
if(isProduction) {
    //Use traditional log format on production env
    app.use(morgan('common'))
} else {
    //Custom log format for pretty display on all non-production envs
    let format = '[:date[web]] - :method ":url" Status: :status\n  From: :remote-addr - HTTP/:http-version\n  Response Time: :response-time ms';
    app.use(morgan(format)) // See Morgan Docs for more info https://github.com/expressjs/morgan
}

//Session Setup
let db;
//Get database settings based on env
if(isProduction){
    db = config.get('database.production');
} else if(process.env.NODE_ENV === 'test') {
    db = config.get('database.test');
} else {
    db = config.get('database.development');
}
//Create a Store to use in the session
const store = new MongoStore({
    uri: `mongodb://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`,
    collection: config.get('session.collection')
})
//Retrieve required session config options ('secret', 'resave', etc.)
let sessionOptions = config.get('session')

//Initialize session, add store to sessionOptions
app.use(cookieParser(sessionOptions.secret))
app.use(session( {...sessionOptions, store} ));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(`mongodb://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`, {useNewUrlParser: true}, (err, success) => {
    if(err) console.log('Unable to connect to database.')
})
require('./components/auth/passport')

// //Create view Engine
// var hbs = handlebars.create({
//     layoutsDir: 'components/templates',
//     defaultLayout: 'main',
//     extname: '.hbs',
//     partialsDir: 'components/templates/partials'
// });

// //Extend default engine with block-support
// hbs.handlebars = extendHbs(hbs.handlebars);

//Set app to use view engine
// app.engine('.hbs', hbs.engine);
app.engine('.hbs', exphbs.express4({
    partialsDir: __dirname + '/templates/partials',
    layoutsDir: __dirname + '/templates',
    defaultLayout: __dirname + '/templates/default/layout'
}))
app.set('view engine', '.hbs');
app.set('views', __dirname);

//Set favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'))

//Serve static resources
app.use(express.static('public'))

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