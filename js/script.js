// Mock Database and Initial State
const defaultProducts = [
    {
        id: 'netflix',
        name: 'Netflix Premium 4K',
        image: 'assets/images/netflix.png',
        description: 'Unlimited ad-free movies, TV shows, and mobile games in Ultra HD.',
        plans: [
            { duration: '1 Month', price: 22.99 },
            { duration: '3 Months', price: 65.00 },
            { duration: '6 Months', price: 120.00 },
            { duration: '1 Year', price: 220.00 }
        ]
    },
    {
        id: 'prime',
        name: 'Amazon Prime Video',
        image: 'assets/images/prime.png',
        description: 'Exclusive Amazon Originals, movies, and TV shows.',
        plans: [
            { duration: '1 Month', price: 14.99 },
            { duration: '3 Months', price: 42.00 },
            { duration: '6 Months', price: 80.00 },
            { duration: '1 Year', price: 139.00 }
        ]
    },
    {
        id: 'hbo',
        name: 'Max (HBO) Ad-Free',
        image: 'assets/images/hbo.png',
        description: 'Iconic series, award-winning movies, and fresh originals.',
        plans: [
            { duration: '1 Month', price: 15.99 },
            { duration: '3 Months', price: 45.00 },
            { duration: '6 Months', price: 85.00 },
            { duration: '1 Year', price: 149.99 }
        ]
    },
    {
        id: 'capcut',
        name: 'CapCut Pro',
        image: 'assets/images/capcut.png',
        description: 'Unlock all pro features, premium templates, and advanced tools.',
        plans: [
            { duration: '1 Month', price: 9.99 },
            { duration: '1 Year', price: 74.99 }
        ]
    },
    {
        id: 'webdev',
        name: 'Web Dev & Maintenance',
        image: 'assets/images/webdev.png',
        description: 'Professional website development, hosting, and monthly maintenance.',
        plans: [
            { duration: '1 Month (Maintenance)', price: 49.99 },
            { duration: '3 Months (Maintenance)', price: 135.00 },
            { duration: '6 Months (Maintenance)', price: 250.00 },
            { duration: '1 Year (Maintenance)', price: 480.00 },
            { duration: 'Custom Site Build', price: 999.00 }
        ]
    }
];

// Initialize DB
async function initDB() {
    // Instead of localStorage, we rely on Firebase.
    // If Firebase is empty, save default products
    try {
        const products = await SubHubDB.getProducts();
        if (products.length === 0) {
            for (let prod of defaultProducts) {
                await SubHubDB.saveProduct(prod);
            }
        }
    } catch (e) {
        console.error("Firebase init error:", e);
    }
}

// Sidebar Drawer Logic
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');

function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('active');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
}

if (openSidebarBtn) openSidebarBtn.addEventListener('click', toggleSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

// Dynamic Menu & Authentication UI state global handler
function updateAuthUI() {
    const user = localStorage.getItem('subhub_user');

    // 1. Top Navbar Login Button
    const loginBtns = document.querySelectorAll('.login-btn');
    loginBtns.forEach(btn => {
        if (user) {
            const userName = user.split('@')[0];
            btn.href = 'account.html';
            btn.innerHTML = `<i class="fas fa-user-circle"></i> ${userName}`;
            btn.style.background = 'rgba(0, 229, 255, 0.1)';
            btn.style.color = 'var(--accent-secondary)';
            btn.style.border = '1px solid rgba(0, 229, 255, 0.3)';
        } else {
            btn.href = 'login.html';
            btn.innerHTML = `<i class="fas fa-user-circle"></i> Login`;
        }
    });

    // 2. Sidebar Restructure & Auth Injection
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        const path = window.location.pathname;
        const isStore = path.includes('store.html');
        const isContact = path.includes('contact.html');

        sidebarNav.innerHTML = `
            <li><a href="index.html" class="${(!isStore && !isContact && !path.includes('account')) ? 'active' : ''}"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="store.html" class="${isStore ? 'active' : ''}"><i class="fas fa-compass"></i> Explore Services</a></li>
            <li><a href="contact.html" class="${isContact ? 'active' : ''}"><i class="fas fa-envelope"></i> Contact Us</a></li>
        `;
    }

    let sidebarBottom = document.getElementById('sidebarAuthWrapper');
    if (!sidebarBottom) {
        const sb = document.getElementById('sidebar');
        if (sb) {
            const footer = sb.querySelector('.sidebar-footer');
            sidebarBottom = document.createElement('div');
            sidebarBottom.id = 'sidebarAuthWrapper';
            sidebarBottom.style.padding = '20px 30px';
            sidebarBottom.style.borderTop = '1px solid rgba(255,255,255,0.05)';
            sb.insertBefore(sidebarBottom, footer);
        }
    }

    if (sidebarBottom) {
        if (user) {
            sidebarBottom.innerHTML = `
                <a href="account.html" style="display:flex; align-items:center; gap:15px; color: var(--accent-secondary); font-size: 1.1rem; font-weight: 500;">
                    <i class="fas fa-user-circle" style="font-size: 1.8rem;"></i>
                    <div style="display:flex; flex-direction:column; line-height: 1.2;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Signed in as</span>
                        <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 150px;">${user}</span>
                    </div>
                </a>
            `;
        } else {
            sidebarBottom.innerHTML = `
                <a href="login.html" style="display:flex; align-items:center; gap:15px; color: var(--text-main); font-size: 1.1rem; font-weight: 500; transition: color 0.3s;">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </a>
            `;
        }
    }
}

// Render Products on Home Page
async function renderProducts(searchQuery = "") {
    const container = document.getElementById('productContainer');
    if (!container) return;

    try {
        let products = await SubHubDB.getProducts();

        if (searchQuery) {
            products = products.filter(p =>
                (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No products found in the active catalog.</div>';
            return;
        }

        products.forEach(product => {
            // Fallback for missing or malformed plans
            const plans = (product.plans && product.plans.length > 0) ? product.plans : [{ duration: '1 Month', price: 9.99 }];
            // Show lowest price as starting price
            const lowestPrice = Math.min(...plans.map(p => parseFloat(p.price) || 0));

            let imageUrl = product.image || 'assets/images/netflix.png';
            let formattedPrice = typeof lowestPrice === 'number' && !isNaN(lowestPrice) ? lowestPrice.toFixed(2) : '0.00';

            const card = document.createElement('div');
            card.className = 'product-card';
            // Add Vanilla-tilt data attributes for modern 3D effect
            card.setAttribute('data-tilt', '');
            card.setAttribute('data-tilt-max', '10');
            card.setAttribute('data-tilt-speed', '400');
            card.setAttribute('data-tilt-glare', 'true');
            card.setAttribute('data-tilt-max-glare', '0.2');

            card.innerHTML = `
                <div class="product-img-wrapper" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="${imageUrl}" alt="${product.name || 'Product'}" class="product-img" onerror="this.src='assets/images/netflix.png'" style="filter: brightness(0.6);">
                    <div style="position: absolute; width: 90%; text-align: center; color: #ffffff; font-weight: 800; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 5px #fff, 0 0 15px var(--accent-secondary), 0 0 30px var(--accent-secondary), 0 0 45px var(--accent-primary); z-index: 2; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; backdrop-filter: blur(2px); border: 1px solid rgba(0, 229, 255, 0.4); box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);">
                        ${product.name || 'Unknown Service'}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name || 'Unknown Service'}</h3>
                    <p class="product-desc">${product.description || 'Premium service subscription.'}</p>
                    <div class="product-footer">
                        <span class="product-price">From $${formattedPrice}</span>
                        <button class="buy-btn" onclick="openCheckout('${product.id}')">
                            <span>Select Plan</span> <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Re-initialize VanillaTilt if available
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".product-card"));
        }
    } catch (error) {
        container.innerHTML = `<div style="grid-column: 1/-1; color: red; text-align: center;">Error rendering products: ${error.message}</div>`;
        console.error(error);
    }
}

// Checkout Modal Logic
let currentProduct = null;
let selectedPlan = null;
let selectedPayment = 'crypto';

async function openCheckout(productId) {
    const products = await SubHubDB.getProducts();
    currentProduct = products.find(p => p.id === productId);

    if (!currentProduct) return;

    // Fallback for missing plans
    if (!currentProduct.plans || currentProduct.plans.length === 0) {
        currentProduct.plans = [{ duration: '1 Month', price: 9.99 }];
    }

    // Default to first plan
    selectedPlan = currentProduct.plans[0];

    // Create Modal if it doesn't exist
    let modalOverlay = document.getElementById('checkoutModalOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'checkoutModalOverlay';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }

    let imageUrl = currentProduct.image || 'assets/images/netflix.png';
    const activeUser = localStorage.getItem('subhub_user') || '';

    modalOverlay.innerHTML = `
        <div class="checkout-modal">
            <button class="modal-close" onclick="closeCheckout()"><i class="fas fa-times"></i></button>
            <div class="checkout-left" style="background-image: url('${imageUrl}')"></div>
            <div class="checkout-right">
                <h2 style="margin-bottom: 5px;">${currentProduct.name}</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">Direct top-up / Instant Delivery via Email</p>
                
                <div class="form-group">
                    <label>Account Email / User ID</label>
                    <input type="text" class="form-input" id="accountId" placeholder="Enter your email or ID" value="${activeUser}">
                </div>

                <h3>Select Subscription Plan</h3>
                <div class="plan-options" id="planOptions">
                    ${currentProduct.plans.map((plan, index) => `
                        <div class="plan-card ${index === 0 ? 'selected' : ''}" onclick="selectPlan(${index})">
                            <span>${plan.duration}</span>
                            <span style="font-weight: bold;">$${plan.price.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <h3>Payment Details (Crypto Only)</h3>
                <div id="paymentDetailsArea" style="margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid var(--border-color);">
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">Send the exact amount to one of the wallets below and upload the Proof Screenshot.</p>
                        <p style="font-size: 0.85rem; margin-bottom: 8px;"><strong>BTC:</strong> <span style="color:var(--accent-secondary); font-family:monospace; user-select:all;">1Di9qtUkzUSi1Jpqrf8km7L1gMYZNohsns</span></p>
                        <p style="font-size: 0.85rem;"><strong>USDT (TRC20):</strong> <span style="color:var(--accent-secondary); font-family:monospace; user-select:all;">TCT1xLuxLcDjFkD8YPHsLvDMMWoJwWY6hf</span></p>
                    </div>
                    <div class="form-group">
                        <label>Upload Payment Proof Screenshot</label>
                        <input type="file" id="cryptoProofImage" class="form-input" accept="image/*" style="padding: 9px 15px;" onchange="handleCryptoProofUpload(event)">
                        <div id="cryptoProofPreviewContainer" style="margin-top:10px; display:none; text-align: center;">
                            <img id="cryptoProofPreview" style="max-width: 100%; max-height: 150px; border-radius: 8px; border: 1px solid var(--border-color);">
                        </div>
                    </div>
                </div>

                <button class="pay-btn" id="mainPayBtn" onclick="processPayment()">
                    Pay $${selectedPlan.price.toFixed(2)}
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
}

function closeCheckout() {
    const modalOverlay = document.getElementById('checkoutModalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    }
}

function selectPlan(index) {
    selectedPlan = currentProduct.plans[index];
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach((card, i) => {
        if (i === index) card.classList.add('selected');
        else card.classList.remove('selected');
    });

    // Update button price
    const payBtn = document.querySelector('.pay-btn');
    if (payBtn) payBtn.innerText = `Pay $${selectedPlan.price.toFixed(2)}`;
}



let cryptoProofBase64 = '';
window.handleCryptoProofUpload = function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            cryptoProofBase64 = e.target.result;
            document.getElementById('cryptoProofPreview').src = cryptoProofBase64;
            document.getElementById('cryptoProofPreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

async function processPayment() {
    const activeUser = localStorage.getItem('subhub_user');
    if (!activeUser) {
        alert("You must be logged in to make a purchase. Please sign in first.");
        window.location.href = 'login.html';
        return;
    }

    const accountId = document.getElementById('accountId').value;
    if (!accountId) {
        alert("Please enter your Account ID or Email.");
        return;
    }

    // Show loading state on button
    const btn = document.querySelector('.checkout-right .pay-btn');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    if (!cryptoProofBase64) {
        alert("Please upload a screenshot proof of your payment.");
        btn.innerHTML = oldText;
        btn.disabled = false;
        return;
    }

    try {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            service: currentProduct.name,
            plan: selectedPlan.duration,
            price: selectedPlan.price,
            userAccount: accountId,
            paymentMethod: 'crypto',
            status: 'Pending',
            proofImage: cryptoProofBase64,
            proof: cryptoProofBase64 // fallback
        };

        await SubHubDB.saveOrder(newOrder);

        cryptoProofBase64 = ''; // Reset
        showPendingMessage();
    } catch (e) {
        console.error("Error saving order:", e);
        alert("Failed to submit payment. Please try again.");
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
}

function showReceipt(orderId) {
    const accountId = localStorage.getItem('subhub_user');
    const rightPanel = document.querySelector('.checkout-right');
    rightPanel.innerHTML = `
        <div style="text-align: center; margin-top: 20px;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success); margin-bottom: 15px;"></i>
            <h2>Payment Successful</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Your subscription is now active.</p>
            
            <div id="receiptContent" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px; border: 1px solid var(--border-color);">
                <div style="text-align: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="font-family: 'Space Grotesk', sans-serif;">SubHub E-Receipt</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${new Date().toLocaleString()}</p>
                </div>
                <p style="margin-bottom: 5px;"><strong>Order ID:</strong> <span style="color: var(--accent-secondary);">${orderId}</span></p>
                <p style="margin-bottom: 5px;"><strong>Service:</strong> ${currentProduct.name}</p>
                <p style="margin-bottom: 5px;"><strong>Plan:</strong> ${selectedPlan.duration}</p>
                <p style="margin-bottom: 5px;"><strong>Account:</strong> ${accountId}</p>
                <p style="margin-top: 15px; font-size: 1.2rem; font-weight: bold; border-top: 1px dashed var(--border-color); padding-top: 10px;">Amount Paid: <span style="float: right;">$${selectedPlan.price.toFixed(2)}</span></p>
            </div>
            
            <button class="secondary-cta" style="width: 100%; margin-bottom: 10px;" onclick="downloadReceipt()">
                <i class="fas fa-file-pdf"></i> Download PDF
            </button>
            <button class="pay-btn" style="width: 100%;" onclick="closeCheckout()">Close</button>
        </div>
    `;
}

function downloadReceipt() {
    // Load html2pdf dynamically if not present
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => { generatePDF(); };
        document.head.appendChild(script);
    } else {
        generatePDF();
    }
}

function generatePDF() {
    const element = document.getElementById('receiptContent');
    const opt = {
        margin: 0.5,
        filename: 'SubHub_Receipt.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function showPendingMessage() {
    const rightPanel = document.querySelector('.checkout-right');
    rightPanel.innerHTML = `
        <div style="text-align: center; margin-top: 30px;">
            <i class="fas fa-clock" style="font-size: 3rem; color: #ffab00; margin-bottom: 15px;"></i>
            <h2>Verification Pending</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px; line-height: 1.6;">Your payment has been submitted successfully.</p>
            <div style="background: rgba(255,171,0,0.1); border: 1px solid rgba(255,171,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                <p style="font-size: 0.9rem; color: #ffab00; line-height: 1.5;"><i class="fas fa-info-circle"></i> We will verify your payment within 5 to 10 minutes. Once approved, you will receive an email with your premium account details.</p>
            </div>
            <button class="pay-btn" style="width: 100%;" onclick="closeCheckout()">Return to Store</button>
        </div>
    `;
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    renderProducts();
    updateAuthUI();
});

// Search Bar Logic
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            renderProducts(query);

            // Scroll to products if user starts typing
            if (query.length > 0) {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    const y = productsSection.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        });
    }
});
