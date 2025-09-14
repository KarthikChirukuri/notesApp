const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const port = 3000;

const jwt = require("jsonwebtoken");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

main()
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/notesApp");
}

const Note = require("./models/note");
const User = require("./models/user");
const Tenant = require("./models/tenant");

function authenticate(req, res, next) {
  const token = req.session.token;
  if (!token) return res.status(401).send("Access Denied. No Token Provided.");
  try {
    const decoded = jwt.verify(token, "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).send("Forbidden: Admins only");
  }
  next();
}

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");
  const isMatch = await user.checkPassword(password);
  if (!isMatch) return res.status(400).send("Invalid password");
  const token = jwt.sign(
    { id: user._id, role: user.role, tenant: user.tenant },
    "supersecretkey",
    {
      expiresIn: "1h",
    }
  );
  req.session.token = token;
  res.redirect("/notes");
});

app.get("/signup", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/signup", async (req, res) => {
  let { email, password, tenant } = req.body;
  const tdoc = await Tenant.findOne({ name: tenant });
  const user = new User({ email, password, tenant: tdoc._id });
  await user.save();
  res.send(`User registered successfully ` + tdoc.name);
});

app.get("/notes", authenticate, async (req, res) => {
  const notes = await Note.find({ tenant: req.user.tenant });
  res.render("index.ejs", { notes });
});

app.get("/notes/new", authenticate, async (req, res) => {
  res.render("newNotes.ejs");
});

app.post("/notes/new", authenticate, async (req, res) => {
  const text = req.body.newNotes;
  await new Note({ text, tenant: req.user.tenant, author: req.user.id }).save();
  res.redirect("/notes");
});

app.get("/notes/:id", authenticate, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.send("Note not found");
  }
  if (req.user.role === "Member" && note.author.toString() !== req.user.id) {
    return res.status(403).send("Forbidden: You can only edit your own notes");
  }

  if (note.tenant.toString() !== req.user.tenant) {
    return res.status(403).send("Forbidden: Not your tenant's note");
  }

  res.render("viewNote.ejs", { note });
});

app.get("/notes/:id/edit", authenticate, async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render("editNote.ejs", { note });
});

app.patch("/notes/:id/edit", authenticate, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.send("Note not found");
  }
  if (note.tenant.toString() !== req.user.tenant) {
    return res.status(403).send("Forbidden: Not your tenant's note");
  }
  if (req.user.role === "Member" && note.author.toString() !== req.user.id) {
    return res.status(403).send("Forbidden: You can only edit your own notes");
  }

  note.text = req.body.newText;
  await note.save();
  res.redirect("/notes");
});

app.delete("/notes/:id", authenticate, authorizeAdmin, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect("/notes");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out, please try again");
    }
  });
  res.clearCookie("connect.sid");
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});