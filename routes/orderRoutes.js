const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   POST /api/orders
// @desc    Create a new order
router.post('/', async (req, res) => {
    try {
        const { orderId, service, plan, price, userAccount, paymentMethod, status, proofImage } = req.body;

        const newOrder = new Order({
            orderId,
            service,
            plan,
            price,
            userAccount,
            paymentMethod,
            status,
            proofImage
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, order: savedOrder });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (For Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/orders/:orderId
// @desc    Update order status
router.put('/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
