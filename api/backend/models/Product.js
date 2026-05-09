const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    plans: [{
        duration: String,
        price: Number,
        stripeLink: String // Keeping for backwards compatibility if needed
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
