const mongoose = require('mongoose');

const NoteSchems = new mongoose.Schema({
    text : {type: String, required: true},
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Note", NoteSchems);