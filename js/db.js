// js/db.js - Unified Database Operations for MongoDB Backend

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api';

window.SubHubDB = {
    // --- USERS (Moved to MongoDB Backend) ---
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE}/users`);
            const data = await response.json();
            return data.success ? data.users : [];
        } catch (error) {
            console.error("Error fetching users from MongoDB:", error);
            return [];
        }
    },
    async saveUser(user) {
        try {
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
        } catch (error) {
            console.error("Error saving user to MongoDB:", error);
        }
    },
    
    // --- PRODUCTS (Moved to MongoDB Backend) ---
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE}/products`);
            const data = await response.json();
            return data.success ? data.products : [];
        } catch (error) {
            console.error("Error fetching products from MongoDB:", error);
            return [];
        }
    },
    async saveProduct(product) {
        try {
            await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        } catch (error) {
            console.error("Error saving product to MongoDB:", error);
        }
    },
    async deleteProduct(productId) {
        try {
            await fetch(`${API_BASE}/products/${productId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting product from MongoDB:", error);
        }
    },

    // --- ORDERS (Moved to MongoDB Backend) ---
    async getOrders() {
        try {
            const response = await fetch(`${API_BASE}/orders`);
            const data = await response.json();
            if (data.success) {
                // MongoDB orders
                return data.orders.map(order => ({
                    id: order.orderId,
                    date: order.createdAt,
                    service: order.service,
                    plan: order.plan,
                    price: order.price,
                    userAccount: order.userAccount,
                    paymentMethod: order.paymentMethod,
                    status: order.status,
                    proofImage: order.proofImage,
                    proof: order.proofImage
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching orders from MongoDB:", error);
            return [];
        }
    },
    async saveOrder(order) {
        try {
            // Convert to MongoDB schema format
            const mongoOrder = {
                orderId: order.id,
                service: order.service,
                plan: order.plan,
                price: order.price,
                userAccount: order.userAccount,
                paymentMethod: order.paymentMethod || 'crypto',
                status: order.status,
                proofImage: order.proofImage || order.proof
            };

            await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mongoOrder)
            });
        } catch (error) {
            console.error("Error saving order to MongoDB:", error);
        }
    },
    async updateOrderStatus(orderId, status) {
        try {
            await fetch(`${API_BASE}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error("Error updating order status in MongoDB:", error);
        }
    }
};
