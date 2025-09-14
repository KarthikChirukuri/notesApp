const mongoose = require("mongoose");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Note = require("../models/note");

require("dotenv").config();

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDb = async () => {
  await Tenant.deleteMany({});
  await User.deleteMany({});
  await Note.deleteMany({});

  // create tenants
  const acme = await Tenant.create({ name: "Acme", slug: "acme" });
  const globex = await Tenant.create({ name: "Globex", slug: "globex" });

  // create users one by one so pre-save middleware hashes passwords
  const users = [
    { email: "admin@acme.test", password: "password", role: "Admin", tenant: acme._id },
    { email: "user@acme.test", password: "password", role: "Member", tenant: acme._id },
    { email: "admin@globex.test", password: "password", role: "Admin", tenant: globex._id },
    { email: "user@globex.test", password: "password", role: "Member", tenant: globex._id },
  ];

  for (const u of users) {
    const user = new User(u);
    await user.save(); // triggers hashing
  }

  console.log("Initial data created successfully");
};

initDb();
