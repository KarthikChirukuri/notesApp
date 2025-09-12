const mongoose = require("mongoose");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Note = require("../models/note");

main().then(() => console.log("DB connected")).catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/notesApp");
}

const initDb = async () => {
  await Tenant.deleteMany({});
  await User.deleteMany({});
  await Note.deleteMany({});

  
  const acme = await Tenant.create({ name: "Acme", slug: "acme" });
  const globex = await Tenant.create({ name: "Globex", slug: "globex" });

  
  const users = [
    { email: "admin@acme.test", password: "password", role: "Admin", tenant: acme._id },
    { email: "user@acme.test", password: "password", role: "Member", tenant: acme._id },
    { email: "admin@globex.test", password: "password", role: "Admin", tenant: globex._id },
    { email: "user@globex.test", password: "password", role: "Member", tenant: globex._id },
  ];
  await User.insertMany(users);

  console.log("Initial data created successfully");
};

initDb();
