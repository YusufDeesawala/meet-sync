//Creating a user Schema ..for more info go to mongoose docs
//const { type } = require('@testing-library/user-event/dist/type');
const mongoose=require('mongoose')
const { Schema } = mongoose;
// So this is where we make the user schema, like lets say its just what we will put in out basktet...and in this basket imma put User's name, email and password
const UserSchema= new Schema({
    name:{
        type: String,
        required: true,

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    }
})
const User= mongoose.model('user', UserSchema)
module.exports= User