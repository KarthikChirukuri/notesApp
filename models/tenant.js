const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },        
    slug: { type: String, required: true },        
    plan: { type: String, default: "free" },       
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tenant", tenantSchema);