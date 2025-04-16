//S58l24ewNvl2IaLD
//Since i did'nt bring my note book i'll write here 
require('dotenv').config();

const connectToMongo=require('./db')
const express= require('express')
const cors= require('cors')
connectToMongo();
const app= express()
const port=process.env.PORT;
app.use(cors())
app.use(express.json())

//Available Routes...
app.use('/api/auth', require('./routes/auth')) //We will use app.use to connect routes.
app.use('/api/notes', require('./routes/notes')) //We will use app.use to connect routes.
// app.use('/api/auth', require['./routes/notes']) //We will use app.use to connect routes.
app.get('/',(req, res)=>{ 
    res.send('Hello Duniya!') //App.get will basically get yout request(res) in which the response will be "Login" eg: http://localhost:5000/login hence redirecting us to the login page. orrr the LOGIN REQUEST
})
app.listen(port, ()=>{
    console.log(`Port is : http://localhost:${port}`)
}) 

//Crazy stuff, if  you want to download any npm package in your dependency just "npm i -D "name of the package" Boommmm downloaded to your dependencies."  