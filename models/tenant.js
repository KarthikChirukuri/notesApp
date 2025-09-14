const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., Acme
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tenant", tenantSchema);