require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For crypto screenshot base64
app.use(express.urlencoded({ extended: true }));



// Robust Serverless Database Connection Logic
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    if (mongoose.connection.readyState >= 1) {
        isConnected = true;
        return;
    }
    if (!process.env.MONGO_URI) {
        throw new Error('CRITICAL ERROR: MONGO_URI is missing from environment variables!');
    }
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
};

// Middleware to ensure DB is connected before handling any route
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        res.status(500).json({ success: false, message: 'Database connection failed. Please check Vercel logs and MONGO_URI.' });
    }
});

// Routes (Support both local /api and Vercel stripped paths)
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/auth', '/auth'], authRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('SubHub Backend API is running...');
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
