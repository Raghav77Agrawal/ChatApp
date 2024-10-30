const {Schema, model} = require('mongoose');
const userSchema = new Schema({
    username:{
        type:String,
    },
    password:{
        type:String,
    }
});
const user = model('users', userSchema);
module.exports = user;
