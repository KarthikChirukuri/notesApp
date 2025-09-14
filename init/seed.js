const mongoose = require("mongoose");
const Tenant = require("../models/tenant");

async function seedTenants() {
  await mongoose.connect(dbUrl);

  await Tenant.deleteMany();
  await Tenant.create({ name: "Acme", plan: "free" });
  await Tenant.create({ name: "Globex", plan: "free" });

  console.log("Tenants seeded");
  mongoose.disconnect();
}

seedTenants();