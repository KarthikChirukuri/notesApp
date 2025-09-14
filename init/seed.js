const mongoose = require("mongoose");
const Tenant = require("../models/tenant");

async function seedTenants() {
  await mongoose.connect("mongodb://127.0.0.1:27017/notesApp");

  await Tenant.deleteMany(); // clear old tenants (optional)
  await Tenant.create({ name: "Acme", plan: "free" });
  await Tenant.create({ name: "Globex", plan: "free" });

  console.log("Tenants seeded");
  mongoose.disconnect();
}

seedTenants();