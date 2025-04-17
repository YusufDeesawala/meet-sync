const express= require('express')
const User = require('../models/User')
const {body, validationResult}= require('express-validator')
const bcrypt= require('bcryptjs')
const router=express.Router()
var jwt= require('jsonwebtoken')
var fetchUser= require('../middleware/login')
const JWT_SECRET='Hussainissex$y'
// Create a user using Post "/api/auth/. Doesn't require auth"
//This is Route 1 for creating users.
router.post('/',[
    //for valisation we are gonna add body which is a function is express VALIDATOR, vo email should be proper, password should be strong and name should consist of more than 3 characters
    body('name','enter a valid name').isLength({min:3}),
    body('email','enter a valid email').isEmail(),
    body('password', 'nigga strong password required').isStrongPassword(),
],async(req, res)=>{
        const error= validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).json({error:error.array()})
        }
        //we are gonna see if a user with the same email Id exists or not,
        try {
        let user= await User.findOne({email:req.body.email});
        if (user) {
            return res.status(400).json({error:"The user with the same email exists"})
        }
        const salt= await bcrypt.genSalt(10)
        const secPass= await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name:req.body.name,   
            email:req.body.email,
            password: secPass
        })
        const data={
            user:{
                id:user.id
            }
        }
        const authToken= jwt.sign(data, JWT_SECRET)
        //then we will print the response
        res.json({authToken:authToken})
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Error occured");
    }
})
//This is route 2 for logging in users after creating them
router.post('/login', [
    body('password','Password cannot be empty').exists(),
    body('email','Enter a valid email').isEmail()
], async(req, res)=>{
    const errors= validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error:errors.array()})
    }
    const {email, password}= req.body;
    try {
        let user= await User.findOne({email})
        if (!user) {
            return res.status(400).json({error:"Nigga...Wrong Credentials"})
        }
        const passwordCompare= await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({error:"Nigga...Wrong Credentials"})
        }
        const payload={
            user:{
                id:user.id
            }
        }
        const authToken=jwt.sign(payload, JWT_SECRET)
        res.json({authToken})
    } catch (err) {
     console.log(err.message)
     res.status(500).send("Internal error occured")   
    }
})

//Route 3:- Get user details using post, needs login
router.post('/getuser', fetchUser ,async(req,res)=>{
    try {
        userId=req.user.id;
        const user=await User.findById(userId).select('-password')
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error occured")
    }
})
// }).then(user=> res.json(user)).catch(err=>{console.log(err); res.json({errors:'Enter a unique email', message: err.message})})
// })})
//Authenticate a user using POST LOGIN
module.exports=router