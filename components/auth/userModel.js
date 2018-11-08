const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    email: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    oauth: {
        facebook: {
            id: {
                type: String,
                default: ''
            },
            token: {
                type: String,
                default: ''
            },
            short_name: {
                type: String,
                default: ''
            },
            email: {
                type: String,
                default: ''
            }
        },
        google: {
            id: {
                type: String,
                default: ''
            },
            token: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: ''
            },
            email: {
                type: String,
                default: ''
            }
        }
    }
}, {minimize: false});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);