//Models are always starts with capital letter hence the file name starting with a capital letter.
//Creating a user Schema ..for more info go to mongoose docs
//const { type } = require('@testing-library/user-event/dist/type')
const mongoose=require('mongoose')
const {Schema}=mongoose
const NotesSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type: String,
        required: true

    },
    description:{
        type:String,
        required:true,
    },
    tag:{
        type : String,
        default:"General"
    },
    date:{
        type:Date,
        default: Date.now
    }
})

module.exports= mongoose.model('notes', NotesSchema)