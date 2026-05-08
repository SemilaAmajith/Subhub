// js/db.js - Unified Database Operations for MongoDB Backend

// Core DB wrapper for API calls


window.SubHubDB = {
    // --- USERS (Moved to MongoDB Backend) ---
    async getUsers() {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            return data.success ? data.users : [];
        } catch (error) {
            console.error("Error fetching users from MongoDB:", error);
            return [];
        }
    },
    async saveUser(user) {
        try {
            await fetch('http://localhost:5000/api/users', {
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
            const response = await fetch('http://localhost:5000/api/products');
            const data = await response.json();
            return data.success ? data.products : [];
        } catch (error) {
            console.error("Error fetching products from MongoDB:", error);
            return [];
        }
    },
    async saveProduct(product) {
        try {
            await fetch('http://localhost:5000/api/products', {
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
            await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting product from MongoDB:", error);
        }
    },

    // --- ORDERS (Moved to MongoDB Backend) ---
    async getOrders() {
        try {
            const response = await fetch('http://localhost:5000/api/orders');
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

            await fetch('http://localhost:5000/api/orders', {
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
            await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error("Error updating order status in MongoDB:", error);
        }
    }
};
