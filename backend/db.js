const mongoose= require('mongoose')
const mongoUri="mongodb+srv://hussainghantiwala8:S89U0Yz7nEAxlqBh@cluster0.ybqhi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const connectToMongo= async()=>{
     try {
        mongoose.connect(mongoUri)
        console.log("Connected")
     } catch (error) {
        console.log(error)
     }
}

module.exports=connectToMongo;