const express= require('express')
const router = express.Router()
const Todo= require("../models/Todo")
const fetchuser = require("../middleware/login")
const { body, validationResult } = require('express-validator')
const { route } = require('./auth')
//Fetching all the pending Todos
router.get('/fetchtodo', fetchuser, async(req,res)=>{
   try {
    const todo= await Todo.find({user:req.user.id})
    res.json(todo)
   } catch (error) {
    res.status(500).send("Internal server error")
   }
})
//Adding a Todo using : Post "api/todo/addtodo" login required
router.post('/addtodo', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', "Description must atleast be up to 5 characters").isLength({ min: 5 })
], async(req,res)=>{
    const errors= validationResult(req)
    try {
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const {title, description, isCompleted}= req.body
        const todo=new Todo({
            title, description, user:req.user.id, isCompleted: isCompleted||false
        })
        const savedTodo=await todo.save()
        res.json(savedTodo)

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})
//Updating a Todo using Put, Now in the update itself we can mark isCompletes as true and delete the todo once isComplete is true, if isComplete is false it stays in the database
router.put('/updatetodo/:id', fetchuser,async(req,res)=>{
    try {
        const {title, description,isCompleted}=req.body
        const newTodo={}
        if(title){newTodo.title=title}
        if(description){newTodo.description=description}
        if (typeof isCompleted === 'boolean') newTodo.isCompleted = isCompleted;
        let todo=await Todo.findById(req.params.id)
        if(!todo){
            return res.status(404).send("Not Found")
        }
        if(todo.user.toString()!==req.user.id){
            res.status(401).send("Unauthorized")
        }
        todo= await Todo.findByIdAndUpdate(req.params.id, {$set: newTodo}, {new:true})
        res.json(todo)
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})
//Deleting a Todo using delete
router.delete('/deletetodo/:id', fetchuser, async(req, res)=>{
    try{
        let todo= await Todo.findById(req.params.id)
        if(!todo){
            res.status(404).send("Not Found")
        }
        if(todo.user.toString()!==req.user.id){
            res.status(401).send('Unauthorized')
        }
        todo= await Todo.findByIdAndDelete(req.params.id)
        res.json({"Success":"Todo deleted", todo:todo})
    }catch(error){
        res.status(500).send("Internal Server Error")
    }
})

module.exports=router