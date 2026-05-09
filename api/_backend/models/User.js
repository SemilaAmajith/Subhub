const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Firebase UID or generated ID
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Stored if user changes password via frontend, although auth is primarily handled by Firebase
    dateJoined: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
