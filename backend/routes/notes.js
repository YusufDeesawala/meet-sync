const express = require('express')
const router = express.Router()
const Notes = require("../models/Notes")
const fetchuser = require("../middleware/login")
const { body, validationResult } = require('express-validator')
//Route 1 Get all the notes : GET
router.get('/fetchnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        res.status(500).send("Internal server error")
    }
})
//Adding a note using : Post "api/notes/addnote" login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', "Description must atleast be up to 5 characters").isLength({ min: 5 })
], async (req, res) => {
    try {
        //If error send bad request
        const errors = validationResult(req)
        if (!errors) {
            return res.status(400).json({ errors: errors.array() })
        }
        //We will destructure this and put this into New Notes
        const { title, description, tag } = req.body
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        //We will save the notes by awaiting it.
        const savedNotes = await note.save()
        res.json(savedNotes) 
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

//Update an existing Note using Put

router.put('/updatenote/:id', fetchuser, async(req, res)=>{
    try {
        const {title, description, tag}= req.body
        //Creating a new note object 
        const newNote={};
        if(title){newNote.title=title}
        if(description){newNote.description}
        if(tag){newNote.tag}

        //Finding the note to be updated and update it 
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }
        if (note.user.toString() !==req.user.id) {
            return res.status(401).send("Unauthorized")
        }
        //Finding the note id and updating it accordingly
        note= await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true}) //New true means updating it apparantly
        res.json({note})
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})
//Deleting the Note
router.delete("/deletenote/:id", fetchuser, async(req,res)=>{
    try {
        //Finding the note to be deleted
        let note= await Notes.findById(req.params.id);
        if (!note) {
            res.status(404).send("Not Found")
        }
        //Allow deletion if the user own this note
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Unauthorized")
        }
        note= await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note deleted", note:note})
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

module.exports = router