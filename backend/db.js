require('dotenv').config();

const mongoose= require('mongoose')
const mongoUri = process.env.MONGO_URL
const connectToMongo= async()=>{
     try {
        mongoose.connect(mongoUri)
        console.log("Connected")
     } catch (error) {
        console.log(error)
     }
}

module.exports=connectToMongo;