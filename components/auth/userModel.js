const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    email: {
        type: String
    },
    username: {
        type: String
    },
    oauth: {
        facebook: {
            id: String,
            token: String,
            short_name: String,
            email: String
        }
    }
});

userSchema.methods.generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);