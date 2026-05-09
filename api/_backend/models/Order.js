const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    service: { type: String, required: true },
    plan: { type: String, required: true },
    price: { type: Number, required: true },
    userAccount: { type: String, required: true },
    paymentMethod: { type: String, default: 'crypto' },
    status: { type: String, default: 'Pending' },
    proofImage: { type: String }, // Can store base64 or URL
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
