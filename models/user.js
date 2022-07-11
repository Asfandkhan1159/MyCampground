const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true /* by the use of unique if you try to create 2 users with same email it will throw duplicate error */
    }
}) /* we didnot require username and password because we add passport and passport is gonna do this for us. */

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);