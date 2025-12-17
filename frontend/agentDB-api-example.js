/**
 * Agent Dashboard API Integration Example
 * This file demonstrates how to use the FingerPayAPI in the agent dashboard
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // Check if user is authenticated
    if (!FingerPayAPI.auth.isAuthenticated()) {
        window.location.href = 'log.html';
        return;
    }

    // Check if user is an agent
    const userType = localStorage.getItem('userType');
    if (userType !== 'agent') {
        alert('Access denied. Agent account required.');
        window.location.href = 'log.html';
        return;
    }

    // Load dashboard data
    await loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    try {
        // Show loading state
        showLoadingState();

        // Fetch dashboard data
        const dashboardData = await FingerPayAPI.agent.getDashboard();
        
        // Update UI with dashboard data
        updateDashboardUI(dashboardData);
        
        // Fetch enrolled customers
        const customers = await FingerPayAPI.agent.getEnrolledCustomers();
        updateCustomersList(customers);
        
        // Fetch agent profile
        const profile = await FingerPayAPI.agent.getProfile();
        updateProfileUI(profile);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data. Please refresh the page.');
    } finally {
        hideLoadingState();
    }
}

/**
 * Update dashboard UI with data
 */
function updateDashboardUI(data) {
    // Update statistics cards
    if (data.stats) {
        document.getElementById('totalRegistrations').textContent = data.stats.totalRegistrations || 0;
        document.getElementById('totalEarnings').textContent = `₦${(data.stats.totalEarnings || 0).toLocaleString()}`;
        document.getElementById('todayEarnings').textContent = `₦${(data.stats.todayEarnings || 0).toLocaleString()}`;
        document.getElementById('liquidityBalance').textContent = `₦${(data.stats.liquidityBalance || 0).toLocaleString()}`;
    }

    // Update chart if data is available
    if (data.chartData) {
        updateChart(data.chartData);
    }

    // Update recent activities
    if (data.recentActivities) {
        updateRecentActivities(data.recentActivities);
    }
}

/**
 * Update customers list
 */
function updateCustomersList(customers) {
    const customersList = document.getElementById('customersList');
    if (!customersList) return;

    if (!customers || customers.length === 0) {
        customersList.innerHTML = '<p class="text-muted text-center">No customers enrolled yet.</p>';
        return;
    }

    customersList.innerHTML = customers.data.map(customer => `
        <div class="card mb-2">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${customer.name}</h6>
                        <small class="text-muted">${customer.phone}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-${customer.isActive ? 'success' : 'secondary'}">
                            ${customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Update profile UI
 */
function updateProfileUI(profile) {
    if (profile.data) {
        const agent = profile.data;
        document.getElementById('agentName').textContent = agent.name || 'Agent';
        document.getElementById('agentEmail').textContent = agent.email || '';
        document.getElementById('agentPhone').textContent = agent.phone || '';
        document.getElementById('agentLocation').textContent = agent.location?.address || '';
        
        // Store in localStorage for easy access
        localStorage.setItem('userName', agent.name);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Liquidity update form
    const liquidityForm = document.getElementById('liquidityForm');
    if (liquidityForm) {
        liquidityForm.addEventListener('submit', handleLiquidityUpdate);
    }

    // Customer enrollment form
    const enrollForm = document.getElementById('enrollCustomerForm');
    if (enrollForm) {
        enrollForm.addEventListener('submit', handleCustomerEnrollment);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
}

/**
 * Handle logout
 */
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        FingerPayAPI.auth.logout();
        window.location.href = 'log.html';
    }
}

/**
 * Handle liquidity update
 */
async function handleLiquidityUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    const action = formData.get('action'); // 'add' or 'withdraw'
    
    try {
        const response = await FingerPayAPI.agent.updateLiquidityStatus({
            amount,
            action
        });
        
        showSuccess('Liquidity updated successfully!');
        await loadDashboardData(); // Refresh dashboard
        e.target.reset();
        
        // Close modal if using Bootstrap modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('liquidityModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Liquidity update error:', error);
        showError(error.message || 'Failed to update liquidity.');
    }
}

/**
 * Handle customer enrollment
 */
async function handleCustomerEnrollment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        idType: formData.get('idType'),
        idNumber: formData.get('idNumber'),
        bvn: formData.get('bvn'),
        biometricData: formData.get('biometricData'), // From fingerprint scanner
    };
    
    try {
        const response = await FingerPayAPI.customer.enroll(customerData);
        
        showSuccess('Customer enrolled successfully!');
        await loadDashboardData(); // Refresh dashboard
        e.target.reset();
        
        // Close modal if using Bootstrap modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('enrollModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Customer enrollment error:', error);
        showError(error.message || 'Failed to enroll customer.');
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) {
        loader.classList.remove('d-none');
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) {
        loader.classList.add('d-none');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    // You can use toast, alert, or custom notification
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Update chart with real data
 */
function updateChart(chartData) {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Registrations',
                    data: chartData.registrations || [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#0A7A5E',
                    borderRadius: 4,
                },
                {
                    label: 'Earnings (₦)',
                    data: chartData.earnings || [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#fbbf24',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * Update recent activities list
 */
function updateRecentActivities(activities) {
    const activitiesList = document.getElementById('recentActivities');
    if (!activitiesList) return;
    
    if (!activities || activities.length === 0) {
        activitiesList.innerHTML = '<p class="text-muted text-center">No recent activities.</p>';
        return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between">
                <span>${activity.description}</span>
                <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}
