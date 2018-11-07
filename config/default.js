const config = {
    database: {
        development: {
            host: '', //Hostname/url without port
            port: 0, //Automatically appended in URI
            username: '', //MongoDB user username
            password: '', //MongoDB user password
            database: '' //Default MongoDB database to use
        },
        production: {
            host: '',
            port: 0,
            username: '',
            password: '',
            database: ''
        },
        test: {
            host: '',
            port: 0,
            username: '',
            password: '',
            database: ''
        }
    },
    session: {
        secret: '', //Encryption key
        resave: null, //Force session to be saved to store, even if no changes.
        saveUninitialized: null, //Force session to be saved to store when new
        store: null, //Storage mechanism to be used for session data
        collection: '', //If MongoDB is used for session data, define collection/table to use
        cookie: {
            path: '',
            httpOnly: null,
            secure: null,
            maxAge: null
        }
        
    },
    apiKeys: {
        facebook: {
            appID: '',
            appSecret: '',
            callback: ''
        }
    }
}

module.exports = config;