const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/products
// @desc    Create or update a product
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        // Use findOneAndUpdate with upsert to create or update based on 'id'
        const product = await Product.findOneAndUpdate(
            { id: productData.id },
            productData,
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by id
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
