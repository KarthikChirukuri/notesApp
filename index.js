const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const port = 3000;

const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/notesApp');
}


app.get("/login", (req,res) => {
    res.render("login.ejs");
});

// let notes = [];
const Note = require("./models/note");

app.post("/login", (req,res)=>{
    const {username, password} = req.body;
    console.log(username);
    console.log(password);
    res.send("Login request Sent!");
})

app.get("/notes", async(req,res)=>{
    const notes = await Note.find();
    res.render("index.ejs", {notes});
})

app.get("/notes/new", (req,res)=>{
    res.render("newNotes.ejs");
})

app.post("/notes/new", async(req,res)=>{
    const text = req.body.newNotes;
    // const id = uuidv4();
    // notes.push({id, text});
    // console.log("Text received: ", text);
    // console.log("ID:", id);
    await new Note({text}).save();
    res.redirect("/notes");
})

app.get("/notes/:id", async(req,res)=>{
    const note = await Note.findById(req.params.id);
    if(!note){
        return res.send("Note not found");
    }
    res.render("viewNote.ejs", {note});
})

app.get("/notes/:id/edit", async(req,res)=>{
    // const note = notes.find(n => n.id === req.params.id);
    const note = await Note.findById(req.params.id);
    res.render("editNote.ejs", {note});
})

app.patch("/notes/:id/edit", async(req,res)=>{
    // const note = notes.find(n => n.id === req.params.id);
    const note = await Note.findById(req.params.id);
    if(!note){
        return res.send("Note not found");
    }
    note.text = req.body.newText;
    await note.save();
    res.redirect("/notes");
})

app.delete("/notes/:id", async(req, res) => {
    // const id = req.params.id;
    // const noteIndex = notes.findIndex(n => n.id === id);

    // if(noteIndex === -1){
    //     return res.send("Note not found");
    // }

    // notes.splice(noteIndex, 1); 
    const note = await Note.findByIdAndDelete(req.params.id);
    res.redirect("/notes");
});

app.listen(port, ()=>{
    console.log(`server running at port ${port}`);
})