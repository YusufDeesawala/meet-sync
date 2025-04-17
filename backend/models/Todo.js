const mongoose= require ('mongoose')
const {Schema}= mongoose
const TodoSchema= new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type:String,
        required:true
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    }
})

module.exports=mongoose.model('todo', TodoSchema)