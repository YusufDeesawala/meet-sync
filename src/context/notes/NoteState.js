import NoteContext from "./noteContext";
import { useState } from "react";

const NoteState=(props)=>{
  const host='http://localhost:5000'
    const notesInitial=[]
      const [notes, setNotes] = useState(notesInitial)
      //Get all Notes


      const getNotes=async()=>{
        const url=`${host}/api/notes/fetchnotes`
        const response=await fetch(url,{
          method:'GET',
          headers:{
            'Content-Type':'application/json',
            'auth-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdkNjc0MmQ1MjhiNTY4YmFiZWFmNWQ5In0sImlhdCI6MTc0MjUzNzcxNH0._23IN1LDxubcJtLtEQ0bHLBcbDHYuiS6gVIcBVqQi8I'
          },
        })
        const json=await response.json()
        console.log(json)
        setNotes(json)
      }


      //Add a note
      const addNote=async (title, description, tag)=>{
        const url=`${host}/api/notes/addnote`
        const response=await fetch(url,{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'auth-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdkNjc0MmQ1MjhiNTY4YmFiZWFmNWQ5In0sImlhdCI6MTc0MjUzNzcxNH0._23IN1LDxubcJtLtEQ0bHLBcbDHYuiS6gVIcBVqQi8I'
          },
          body:JSON.stringify({title, description,tag})
        })
        const json = await response.json()
        console.log(json)
        console.log("Adding a new note")
        const note={
          "_id": "67e3dca28decb40e0156904787",
          "user": "67d6742d528b568babeaf5d9556",
          "title": title,
          "description": description,
          "tag": tag,
          "date": Date.now(),
          "__v": 0
        }
        setNotes(notes.concat(note))
      }


      //Delete a note
      const deleteNote=async (id)=>{
        const url =`${host}/api/notes/deletenote/${id}`
        const response=await fetch(url,{
          method:'DELETE',
          headers:{
            'Content-Type':'application/json',
            'auth-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdkNjc0MmQ1MjhiNTY4YmFiZWFmNWQ5In0sImlhdCI6MTc0MjUzNzcxNH0._23IN1LDxubcJtLtEQ0bHLBcbDHYuiS6gVIcBVqQi8I'
          },
        })
        const json= await response.json()
        console.log(json)
        console.log("Deleting note with id",id)
        const newNote=notes.filter((note)=>{
          //Return all notes except the one with the given Id , basically filter out the note with the given ID 
          return note._id!==id})
          //Set the notes to the new array of notes
        setNotes(newNote)
      }
      //Edit a note
      const editNote=async (id, title, description, tag)=>{
        //Lets create API call for this
        const url=`${host}/api/notes/updatenote/67def1406969a9acea7acd54`
        const response=await fetch(url,{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'auth-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdkNjc0MmQ1MjhiNTY4YmFiZWFmNWQ5In0sImlhdCI6MTc0MjUzNzcxNH0._23IN1LDxubcJtLtEQ0bHLBcbDHYuiS6gVIcBVqQi8I'
          },
          body:JSON.stringify({title, description,tag})
        })
        const json=await response.json()
        console.log(json)
        //Logic to edit note
        for (let index = 0; index < notes.length; index++) {
          const element = notes[index];
          if (element._id===id) {
            element.title=title
            element.description=description
            element.tag=tag
            break;
            
          }
          
        }
      }
    return (
        <NoteContext.Provider value={{notes, setNotes, deleteNote, editNote,addNote, getNotes}}>{props.children}</NoteContext.Provider>
    )
}
export default NoteState