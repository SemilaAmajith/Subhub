// Admin Authentication Check Removed - Direct Access Granted
document.body.style.display = 'block';



// Admin Layout logic
function switchTab(tabId) {
    document.getElementById('tab-dashboard').style.display = 'none';
    document.getElementById('tab-products').style.display = 'none';
    document.getElementById('tab-orders').style.display = 'none';
    document.getElementById('tab-customers').style.display = 'none';
    
    document.getElementById('tab-' + tabId).style.display = 'block';
    
    // update active state in sidebar
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(l => l.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if(tabId === 'dashboard') loadDashboard();
    if(tabId === 'products') loadProducts();
    if(tabId === 'orders') loadOrders();
    if(tabId === 'customers') loadCustomers();
}

async function loadCustomers() {
    const users = await SubHubDB.getUsers();
    const table = document.getElementById('customersTable').querySelector('tbody');
    table.innerHTML = '';
    
    [...users].reverse().forEach(u => {
        const date = u.dateJoined ? new Date(u.dateJoined).toLocaleDateString() : 'N/A';
        table.innerHTML += `
            <tr>
                <td>${u.id || '-'}</td>
                <td style="font-weight: 500; color: #fff;">${u.name || '-'}</td>
                <td>${u.email}</td>
                <td>${u.phone || '-'}</td>
                <td><span class="badge" style="background: rgba(0, 229, 255, 0.1); color: var(--accent-secondary);">${date}</span></td>
            </tr>
        `;
    });
}

let revenueChartInstance = null;

async function loadDashboard() {
    const orders = await SubHubDB.getOrders();
    const products = await SubHubDB.getProducts();
    
    let totalRev = 0;
    orders.forEach(o => totalRev += parseFloat(o.price));
    
    document.getElementById('totalRevenue').innerText = '$' + totalRev.toFixed(2);
    document.getElementById('totalOrders').innerText = orders.length;
    document.getElementById('totalProducts').innerText = products.length;
    
    // Fill recent orders table
    const table = document.getElementById('ordersTable').querySelector('tbody');
    table.innerHTML = '';
    
    // Get last 5 orders
    const recent = [...orders].reverse().slice(0, 5);
    recent.forEach(o => {
        table.innerHTML += `
            <tr>
                <td>${o.id}</td>
                <td>${o.service}</td>
                <td>${o.plan}</td>
                <td>${o.userAccount}</td>
                <td style="color:var(--accent-secondary);">$${o.price.toFixed(2)}</td>
                <td><span class="badge ${o.status === 'Completed' ? 'badge-success' : 'badge-pending'}">${o.status}</span></td>
            </tr>
        `;
    });

    if (document.getElementById('revenueChart')) {
        updateRevenueChart();
    }
}

window.updateRevenueChart = async function() {
    const filter = document.getElementById('revenueFilter').value;
    const orders = await SubHubDB.getOrders();
    
    let labels = [];
    let data = [];
    const now = new Date();
    
    if (filter === 'today') {
        labels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
        data = new Array(8).fill(0);
        
        orders.forEach(o => {
            const d = new Date(o.date);
            if (d.toDateString() === now.toDateString()) {
                const hour = d.getHours();
                const index = Math.floor(hour / 3);
                data[index] += parseFloat(o.price);
            }
        });
    } else if (filter === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(0);
        }
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        orders.forEach(o => {
            const d = new Date(o.date);
            if (d > oneWeekAgo && d <= now) {
                const diffTime = Math.abs(now - d);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const index = 7 - diffDays;
                if (index >= 0 && index < 7) {
                    data[index] += parseFloat(o.price);
                }
            }
        });
    } else if (filter === 'monthly') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = new Array(4).fill(0);
        
        orders.forEach(o => {
            const d = new Date(o.date);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                const date = d.getDate();
                let week = Math.floor((date - 1) / 7);
                if (week > 3) week = 3; 
                data[week] += parseFloat(o.price);
            }
        });
    }
    
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue ($)',
                data: data,
                borderColor: '#00e5ff',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#00e5ff',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00e5ff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 20, 36, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#00e5ff',
                    borderColor: 'rgba(0, 229, 255, 0.2)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: {
                        color: '#9ca3af',
                        font: { family: 'Outfit' },
                        callback: function(value) { return '$' + value; }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadOrders() {
    let orders = await SubHubDB.getOrders();
    const table = document.getElementById('fullOrdersTable').querySelector('tbody');
    table.innerHTML = '';
    
    const filterFrom = document.getElementById('filterFromDate') ? document.getElementById('filterFromDate').value : '';
    const filterTo = document.getElementById('filterToDate') ? document.getElementById('filterToDate').value : '';
    const filterSearch = document.getElementById('filterOrderSearch') ? document.getElementById('filterOrderSearch').value.toLowerCase() : '';
    
    let filteredOrders = orders.filter(o => {
        let match = true;
        const orderDate = new Date(o.date);
        orderDate.setHours(0,0,0,0);
        
        if (filterFrom) {
            const [y, m, d] = filterFrom.split('-');
            const fromD = new Date(y, m-1, d);
            fromD.setHours(0,0,0,0);
            if (orderDate < fromD) match = false;
        }
        if (filterTo) {
            const [y, m, d] = filterTo.split('-');
            const toD = new Date(y, m-1, d);
            toD.setHours(23,59,59,999);
            if (orderDate > toD) match = false;
        }
        if (filterSearch) {
            const idMatch = o.id.toLowerCase().includes(filterSearch);
            const emailMatch = (o.userAccount || '').toLowerCase().includes(filterSearch);
            if (!idMatch && !emailMatch) match = false;
        }
        return match;
    });
    
    [...filteredOrders].reverse().forEach(o => {
        let statusBadge = '';
        if (o.status === 'Completed') {
            statusBadge = `<span class="badge badge-success">Completed</span>`;
        } else {
            statusBadge = `<button class="badge badge-pending" style="cursor:pointer;" onclick="markOrderCompleted('${o.id}')">Approve Payment</button>`;
        }
        
        let proofHtml = '-';
        if (o.proofImage) {
            proofHtml = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    ${o.proof ? `<span style="font-family: monospace; font-size: 0.8rem;" title="${o.proof}">${o.proof.substring(0,6)}...</span>` : ''}
                    <a href="${o.proofImage}" download="Proof_${o.id}.png" title="Download Proof" style="color: var(--accent-secondary); font-size: 1.2rem; transition: color 0.3s;"><i class="fas fa-file-download"></i></a>
                    <a href="javascript:void(0)" onclick="viewProofImage('${o.id}')" title="View Proof" style="color: var(--text-main); font-size: 1.2rem; transition: color 0.3s;"><i class="fas fa-eye"></i></a>
                </div>
            `;
        } else if (o.proof) {
            proofHtml = `<span style="font-family: monospace; font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;" title="${o.proof}">${o.proof.substring(0, 10)}...</span>`;
        }
        
        table.innerHTML += `
            <tr>
                <td>${o.id}</td>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td>${new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>${o.service}</td>
                <td>${o.plan}</td>
                <td>${o.userAccount}</td>
                <td style="text-transform: capitalize;">${o.paymentMethod}</td>
                <td style="color:var(--accent-secondary);">$${parseFloat(o.price).toFixed(2)}</td>
                <td>${proofHtml}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
}

window.viewProofImage = async function(orderId) {
    let orders = await SubHubDB.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order && order.proofImage) {
        document.getElementById('proofModalImg').src = order.proofImage;
        document.getElementById('proofModalOverlay').classList.add('active');
    }
};

window.closeProofModal = function() {
    document.getElementById('proofModalOverlay').classList.remove('active');
    document.getElementById('proofModalImg').src = '';
};

async function loadProducts() {
    const products = await SubHubDB.getProducts();
    const container = document.getElementById('adminProductGrid');
    container.innerHTML = '';
    
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card" style="cursor: default;">
                <img src="${p.image}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-desc" style="margin-bottom:10px;">ID: ${p.id}</p>
                    <p style="color:var(--accent-secondary); margin-bottom:15px; font-size:0.9rem;">${p.plans.length} Pricing Plans</p>
                    <div style="display:flex; gap:10px; margin-top:auto;">
                        <button class="buy-btn" style="flex:1;" onclick="editProduct('${p.id}')">Edit</button>
                        <button class="buy-btn" style="flex:1; border-color:var(--danger); color:var(--danger);" onclick="deleteProduct('${p.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
}

let isEditing = null;
let uploadedBase64 = null;

// Handle file input change for preview and conversion
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    const fileInput = document.getElementById('p_img_file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    uploadedBase64 = evt.target.result;
                    document.getElementById('p_img_preview').src = uploadedBase64;
                    document.getElementById('p_img_preview_container').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function addPlanField(duration = '', price = '', stripeLink = '') {
    const container = document.getElementById('p_plans_container');
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.innerHTML = `
        <input type="text" class="form-input plan-duration" placeholder="e.g. 1 Month" value="${duration}" style="flex: 2;">
        <input type="number" step="0.01" class="form-input plan-price" placeholder="Price ($)" value="${price}" style="flex: 1;">
        <input type="text" class="form-input plan-stripe" placeholder="Stripe Payment Link (Optional)" value="${stripeLink}" style="flex: 3;">
        <button type="button" class="icon-btn" style="color: #ff3366;" onclick="this.parentElement.remove()"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function openProductModal() {
    isEditing = null;
    uploadedBase64 = null;
    document.getElementById('adminModalTitle').innerText = 'Add New Service';
    document.getElementById('p_id').value = '';
    document.getElementById('p_name').value = '';
    document.getElementById('p_img_file').value = '';
    document.getElementById('p_img_preview_container').style.display = 'none';
    document.getElementById('p_desc').value = '';
    
    document.getElementById('p_plans_container').innerHTML = '';
    addPlanField(); // add one default row
    
    document.getElementById('adminModalOverlay').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModalOverlay').classList.remove('active');
}

async function editProduct(id) {
    const products = await SubHubDB.getProducts();
    const p = products.find(prod => prod.id === id);
    if(!p) return;
    
    isEditing = id;
    uploadedBase64 = p.image || null; // Preserve old image if not updated
    
    document.getElementById('adminModalTitle').innerText = 'Edit Service';
    document.getElementById('p_id').value = p.id;
    document.getElementById('p_name').value = p.name;
    document.getElementById('p_desc').value = p.description;
    
    document.getElementById('p_plans_container').innerHTML = '';
    if (p.plans && p.plans.length > 0) {
        p.plans.forEach(plan => addPlanField(plan.duration, plan.price, plan.stripeLink || ''));
    } else {
        addPlanField();
    }
    
    document.getElementById('p_img_file').value = '';
    if (uploadedBase64 && uploadedBase64.startsWith('data:image')) {
        document.getElementById('p_img_preview').src = uploadedBase64;
        document.getElementById('p_img_preview_container').style.display = 'block';
    } else {
        document.getElementById('p_img_preview_container').style.display = 'none';
    }
    
    document.getElementById('adminModalOverlay').classList.add('active');
}

async function saveProduct() {
    const id = document.getElementById('p_id').value;
    const name = document.getElementById('p_name').value;
    const desc = document.getElementById('p_desc').value;
    
    if(!id || !name) return alert("ID and Name are required!");
    
    const planDivs = document.getElementById('p_plans_container').children;
    const newPlans = [];
    for(let i=0; i<planDivs.length; i++) {
        const dur = planDivs[i].querySelector('.plan-duration').value;
        const pr = parseFloat(planDivs[i].querySelector('.plan-price').value);
        const sl = planDivs[i].querySelector('.plan-stripe').value;
        if(dur && !isNaN(pr)) {
            newPlans.push({ duration: dur, price: pr, stripeLink: sl });
        }
    }
    if(newPlans.length === 0) {
        return alert("At least one valid pricing plan is required.");
    }
    
    let imageToSave = uploadedBase64 || 'assets/images/netflix.png';
    // If not new image but editing, we preserve old one by fetching it if uploadedBase64 is empty
    if(isEditing && !uploadedBase64) {
        const products = await SubHubDB.getProducts();
        const oldP = products.find(p => p.id === isEditing);
        if(oldP && oldP.image) imageToSave = oldP.image;
    }
    
    let productToSave = {
        id: id,
        name: name,
        image: imageToSave,
        description: desc,
        plans: newPlans
    };
    
    if(isEditing && isEditing !== id) {
        await SubHubDB.deleteProduct(isEditing);
    }
    
    await SubHubDB.saveProduct(productToSave);
    
    closeAdminModal();
    loadProducts();
    loadDashboard();
}

async function deleteProduct(id) {
    if(confirm('Are you sure you want to delete this service?')) {
        await SubHubDB.deleteProduct(id);
        loadProducts();
        loadDashboard();
    }
}

async function markOrderCompleted(orderId) {
    if(confirm('Are you sure you want to approve this payment and activate the subscription?')) {
        await SubHubDB.updateOrderStatus(orderId, 'Completed');
        
        let orders = await SubHubDB.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if(index !== -1) {
            
            // Attempt to send email to the customer using EmailJS
            const customerEmail = orders[index].userAccount;
            if (typeof emailjs !== 'undefined' && customerEmail && customerEmail.includes('@')) {
                const templateParams = {
                    to_email: customerEmail,
                    to_name: "Valued Customer",
                    message: `Great news! Your payment for ${orders[index].service} (${orders[index].plan}) has been approved. You will receive another email within 5 minutes containing your premium account username and password. Order ID: ${orderId}`,
                    verification_code: 'Approved'
                };
                
                emailjs.send("service_ton7qk8", "template_menv67q", templateParams, "dZwzK6URCLMZlTROJ")
                    .then(() => {
                        console.log("Approval email sent successfully.");
                    }).catch(err => {
                        console.error("Failed to send approval email:", err);
                    });
            }

            loadOrders();
            loadDashboard();
        }
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    if(document.getElementById('filterFromDate')) document.getElementById('filterFromDate').value = todayLocal;
    if(document.getElementById('filterToDate')) document.getElementById('filterToDate').value = todayLocal;
    
    loadDashboard();
});
