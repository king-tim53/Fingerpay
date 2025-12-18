/**
 * ==========================================
 * MERCHANT DASHBOARD CONTROLLER (FIXED)
 * Features: Dashboard, Staff, POS, Projects, Credit AI
 * ==========================================
 */

// ==========================================
// 1. GLOBAL NAVIGATION & UI LOGIC
// ==========================================

// FIX: This function is now global so HTML buttons can find it
window.showSection = function(sectionId, btnElement, event) {
    if (event) event.preventDefault();
    
    console.log("Navigating to:", sectionId);

    // 1. Hide all content sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('d-none');
        el.classList.remove('fade-in');
    });

    // 2. Show target section
    // Handles specific naming (e.g., 'credit' -> 'credit-section')
    const targetId = sectionId + '-section';
    const target = document.getElementById(targetId);
    
    if(target) {
        target.classList.remove('d-none');
        setTimeout(() => target.classList.add('fade-in'), 10);
    } else {
        console.warn("Section ID not found:", targetId);
    }
    
    // 3. Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // 4. Update Header Title
    const titleEl = document.getElementById('pageTitle');
    if(titleEl) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'sales': 'Sales & History',
            'projects': 'Growth Projects',
            'logistics': 'POS Logistics',
            'staff': 'Staff Manager',
            'settings': 'Settings',
            'credit': 'Credit AI 4.0'
        };
        titleEl.textContent = titles[sectionId] || 'Dashboard';
    }

    // 5. Mobile Menu: Close sidebar on selection
    if(window.innerWidth < 992) {
        document.getElementById('sidebar')?.classList.remove('active');
    }
};

// Global Toast Notification Helper
window.showToast = function(msg) {
    let toastEl = document.getElementById('staffToast');
    let toastBody = document.getElementById('toastMsg');
    
    // Fallback if specific toast IDs are missing
    if (!toastEl) {
        toastEl = document.getElementById('liveToast'); // Try generic toast
        if (toastEl) toastBody = toastEl.querySelector('.toast-body');
    }

    if(toastEl && toastBody) {
        toastBody.textContent = msg;
        new bootstrap.Toast(toastEl).show();
    } else {
        alert(msg); // Fallback to alert
    }
};

// Generic Form Handler
window.handleFormSubmit = function(event, modalId, successMessage) {
    event.preventDefault();
    
    const currentModalEl = document.getElementById(modalId);
    if(currentModalEl) {
        const modal = bootstrap.Modal.getInstance(currentModalEl);
        if(modal) modal.hide();
    }

    // Show Success Modal
    const successModalEl = document.getElementById('genericSuccessModal');
    const successTextEl = document.getElementById('successMessageText');
    
    if(successModalEl && successTextEl) {
        successTextEl.textContent = successMessage;
        new bootstrap.Modal(successModalEl).show();
    } else {
        window.showToast(successMessage);
    }

    event.target.reset();
};


// ==========================================
// 2. INITIALIZATION (DOM LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Set Current Date
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

    // 2. Mobile Menu Toggle
    const menuBtn = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if(menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // 3. Initialize Staff Table
    renderStaff();

    // 4. Initialize Project Slider
    const slider = document.getElementById('savePercent');
    const output = document.getElementById('percentVal');
    if (slider && output) {
        slider.addEventListener('input', function() {
            output.textContent = this.value + "%";
        });
    }

    // 5. Load SDG/School Data (If elements exist in Credit AI)
    if(typeof renderSchool === 'function' && document.getElementById('schoolContent')) {
        renderSchool('en', null);
    }
    if(typeof renderLiteracy === 'function' && document.getElementById('loanTermsAccordion')) {
        renderLiteracy();
    }
});


// ==========================================
// 3. FEATURE: STAFF MANAGER
// ==========================================
let staffList = [
    { id: 101, name: 'Mr. John Doe', role: 'Cashier', salary: 50000, bank: 'Zenith', acct: '202***', source: 'Wallet', active: true },
    { id: 102, name: 'Sarah Smith', role: 'Manager', salary: 120000, bank: 'GTBank', acct: '012***', source: 'Card', active: true }
];

function renderStaff() {
    const tbody = document.getElementById('staffTableBody');
    if(!tbody) return;
    tbody.innerHTML = ''; 

    staffList.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ps-4 fw-bold">${staff.name}</td>
            <td><span class="badge bg-light text-dark border">${staff.role}</span></td>
            <td class="fw-bold">N${staff.salary.toLocaleString()}</td>
            <td class="small text-muted">${staff.bank}</td>
            <td><span class="badge ${staff.source === 'Wallet' ? 'bg-success' : 'bg-primary'} bg-opacity-75">${staff.source}</span></td>
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${staff.active ? 'checked' : ''} onchange="toggleStaffStatus(${staff.id})">
                </div>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-danger" onclick="confirmStopPay(${staff.id})"><i class="bi bi-pause-circle"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add New Staff
const addStaffForm = document.getElementById('addStaffForm');
if(addStaffForm) {
    addStaffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('staffName').value;
        staffList.push({
            id: Date.now(),
            name: name,
            role: 'New Hire',
            salary: 0,
            bank: 'N/A',
            source: 'Wallet',
            active: true
        });
        renderStaff();
        window.showToast(`Staff ${name} added.`);
        const modal = bootstrap.Modal.getInstance(document.getElementById('newStaffModal'));
        if(modal) modal.hide();
        e.target.reset();
    });
}

window.toggleStaffStatus = function(id) {
    const staff = staffList.find(s => s.id === id);
    if(staff) {
        staff.active = !staff.active;
        window.showToast(staff.active ? "Auto-Pay Re-enabled" : "Auto-Pay Paused");
    }
};

window.confirmStopPay = function(id) {
    if(confirm("Are you sure you want to stop payment?")) {
        window.toggleStaffStatus(id); 
        renderStaff(); 
    }
};


// ==========================================
// 4. FEATURE: POS & LOGISTICS
// ==========================================
window.handlePosOrder = function(event) {
    event.preventDefault();
    const modal = bootstrap.Modal.getInstance(document.getElementById('requestPosModal'));
    if(modal) modal.hide();
    
    // Trigger Delivery Animation Modal
    const deliveryModal = new bootstrap.Modal(document.getElementById('deliveryModal'));
    deliveryModal.show();
    event.target.reset();
};

window.refreshFleetStatus = function(btn) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Updating...`;
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        window.showToast("Fleet telemetry updated.");
    }, 1500);
};

// ==========================================
// 5. FEATURE: PROJECTS & FUNDS
// ==========================================
window.handleAddFunds = function(event) {
    event.preventDefault();
    const amount = document.getElementById('fundAmount').value;
    
    // Simulate updating the progress bar
    const progressBar = document.getElementById('projectProgressBar');
    if(progressBar) {
        progressBar.style.width = "75%";
        progressBar.innerText = "75% Funded";
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFundsModal'));
    if(modal) modal.hide();
    window.showToast(`N${amount} added to project.`);
    event.target.reset();
};

window.handleAddTask = function(event) {
    event.preventDefault();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    if(modal) modal.hide();
    window.showToast("New task added to breakdown.");
    event.target.reset();
};

// ==========================================
// 6. FEATURE: CREDIT AI (LOANS)
// ==========================================
window.simulateGenerateCreditProfile = function() {
    const initialState = document.getElementById('aiInitialState');
    if(initialState) initialState.classList.add('d-none');
    
    document.getElementById('aiLoadingState').classList.remove('d-none');
    
    setTimeout(() => {
        document.getElementById('aiLoadingState').classList.add('d-none');
        document.getElementById('aiResultState').classList.remove('d-none');
        document.getElementById('aiResultState').classList.add('fade-in');
        
        // Animate Score
        const scoreEl = document.getElementById('creditScore');
        if(scoreEl) scoreEl.innerText = "785";
    }, 3000);
};

window.selectLoan = function(amount) {
    const el = document.getElementById('loanPrincipal');
    if(el) el.textContent = 'N' + amount;
    new bootstrap.Modal(document.getElementById('loanModal')).show();
};

window.initiateLoanBiometrics = function() {
    document.getElementById('loanStep1').classList.add('d-none');
    document.getElementById('loanStep2').classList.remove('d-none');
    
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loanModal'));
        if(modal) modal.hide();
        window.showToast("Loan Disbursed Successfully!");
        
        // Reset modal state
        setTimeout(() => {
            document.getElementById('loanStep1').classList.remove('d-none');
            document.getElementById('loanStep2').classList.add('d-none');
        }, 1000);
    }, 2500);
};

window.runAdvancedSimulation = function() {
    document.getElementById('simulationResult').classList.remove('d-none');
    document.getElementById('simText').innerHTML = "AI Prediction: <strong>+15% Profit</strong> if executed.";
};

// ==========================================
// 7. SDG MODULES (Health & Education for Credit AI)
// ==========================================

// Health Planner Logic
window.calculateHealthPlan = function() {
    const expenses = document.getElementById('healthExpenses').value;
    if(expenses) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('healthPlanModal')); // Fix ID reference
        if(modal) modal.hide(); 
        // Fallback for different modal IDs based on previous versions
        const altModal = bootstrap.Modal.getInstance(document.getElementById('healthModal'));
        if(altModal) altModal.hide();

        window.showToast("Health Goal Set: Save N" + (expenses*6).toLocaleString());
    }
};

// School / Education Logic
const schoolData = {
    en: { free: ["Cashflow 101", "Customer Love"], paid: ["Advanced Tax"] },
    pidgin: { free: ["How Money Move", "Hold Customer Tight"], paid: ["Tax Wahala"] },
    yoruba: { free: ["Isakoso Owo", "Itoju Onibara"], paid: ["Owo Ori"] },
    igbo: { free: ["Ijikwa Ego", "Idebe Ndi Ahia"], paid: ["Iwu Tax"] },
    hausa: { free: ["Kula da Kudi", "Tsare Customer"], paid: ["Biyan Haraji"] }
};

window.renderSchool = function(lang, btnElement) {
    if (btnElement) {
        document.querySelectorAll('#langTabs .nav-link').forEach(b => b.classList.remove('active', 'bg-info', 'text-dark'));
        btnElement.classList.add('active', 'bg-info', 'text-dark');
    }

    const data = schoolData[lang] || schoolData['en'];
    const container = document.getElementById('schoolContent');
    if(!container) return;

    let html = `<h6 class="text-white-50 small">Free Lessons</h6><div class="list-group mb-3">`;
    data.free.forEach(t => {
        html += `<button class="list-group-item bg-dark text-white border-secondary"><i class="bi bi-play-circle text-warning me-2"></i> ${t}</button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
};

// Literacy Logic
const literacyData = {
    terms: ["Principal", "Interest", "Default"],
    en: ["Original money borrowed.", "Fee charged.", "Failure to pay."],
    pidgin: ["The main money.", "The extra money.", "If you fall hand."],
    yoruba: ["Owo ti a ya.", "Ele lori owo.", "Ikuna lati sanwo."],
    igbo: ["Ego isi.", "Ego nlele.", "Adighị akwụghachi."],
    hausa: ["Ainihin kudin.", "Kudin ruwa.", "Kasa biya."]
};

window.renderLiteracy = function() {
    const langSelect = document.getElementById('litLangSelect');
    if(!langSelect) return;
    
    const lang = langSelect.value;
    const container = document.getElementById('loanTermsAccordion');
    if(!container) return;

    const terms = literacyData.terms;
    const defs = literacyData[lang] || literacyData['en'];

    let html = '';
    terms.forEach((term, idx) => {
        html += `
            <div class="accordion-item bg-dark border-secondary text-white mb-2">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed bg-transparent text-white shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#term${idx}">
                        ${term}
                    </button>
                </h2>
                <div id="term${idx}" class="accordion-collapse collapse" data-bs-parent="#loanTermsAccordion">
                    <div class="accordion-body text-white-50 small">${defs[idx]}</div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
};

