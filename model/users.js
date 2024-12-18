const {Schema, model} = require('mongoose');
const userSchema = new Schema({
    email:{
        type:String,
    },
    password:{
        type:String,
    }
});
const user = model('users', userSchema);
module.exports = user;
