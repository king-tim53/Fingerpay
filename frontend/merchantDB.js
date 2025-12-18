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


/**
 * ==========================================
 * MODAL FUNCTIONALITY & CALCULATORS
 * ==========================================
 */

// Global Currency Formatter
const formatNaira = (amount) => {
    return '₦' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

// 1. PROJECT CALCULATION (Fee: 5%)
function calcProjectFees() {
    const amount = parseFloat(document.getElementById('projTarget').value) || 0;
    const fee = amount * 0.05;
    const net = amount - fee;

    document.getElementById('projFeeDisplay').innerText = formatNaira(fee);
    document.getElementById('projNetDisplay').innerText = formatNaira(net);
}

function handleNewProject(e) {
    e.preventDefault();
    const name = document.getElementById('projName').value;
    const cat = document.getElementById('projCategory').value;
    const net = document.getElementById('projNetDisplay').innerText;
    
    // Simulate API Call
    alert(`Project Created!\nTitle: ${name}\nCategory: ${cat}\nBudget: ${net}`);
    bootstrap.Modal.getInstance(document.getElementById('newProjectModal')).hide();
}

// 2. FUNDS CALCULATION
function calcFundTotal() {
    const amt = parseFloat(document.getElementById('fundAmount').value) || 0;
    // Assume 1.5% processing fee
    const total = amt + (amt * 0.015);
    document.getElementById('fundTotalDisplay').innerText = formatNaira(total);
}

function handleAddFunds(e) {
    e.preventDefault();
    const amt = document.getElementById('fundAmount').value;
    alert(`Funds Added: N${amt}\nYour wallet has been credited.`);
    bootstrap.Modal.getInstance(document.getElementById('addFundsModal')).hide();
}

// 3. TASK CALCULATION (Hours * Rate)
function calcTaskCost() {
    const hrs = parseFloat(document.getElementById('taskHours').value) || 0;
    const rate = parseFloat(document.getElementById('taskRate').value) || 0;
    const total = hrs * rate;
    
    document.getElementById('taskTotalCost').value = total.toLocaleString();
}

function handleAddTask(e) {
    e.preventDefault();
    const name = document.getElementById('taskNameInput').value;
    const pri = document.getElementById('taskPriority').value;
    const cost = document.getElementById('taskTotalCost').value;
    
    alert(`Task "${name}" added with ${pri} priority.\nEst Cost: N${cost}`);
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
}

// 4. STAFF SALARY & TAX CALCULATOR (Tax: 7.5%)
function calcStaffPay() {
    const gross = parseFloat(document.getElementById('staffSalary').value) || 0;
    const tax = gross * 0.075;
    const net = gross - tax;

    document.getElementById('staffTax').innerText = formatNaira(tax);
    document.getElementById('staffNet').innerText = formatNaira(net);
}

function handleNewStaff(e) {
    e.preventDefault();
    const name = document.getElementById('staffName').value;
    const bank = document.getElementById('staffBank').value;
    const acct = document.getElementById('staffAcct').value;
    
    if(acct.length !== 10) {
        alert("Error: Account Number must be 10 digits.");
        return;
    }
    
    alert(`Staff Onboarded!\nName: ${name}\nBank: ${bank}`);
    bootstrap.Modal.getInstance(document.getElementById('newStaffModal')).hide();
}

// 5. STOP PAY LOGIC
function handleStopPayAction() {
    const reason = document.getElementById('stopPayReason').value;
    if(!reason) {
        alert("Please select a reason for stopping payment.");
        return;
    }
    alert(`Salary Paused.\nReason Code: ${reason.toUpperCase()}`);
    bootstrap.Modal.getInstance(document.getElementById('stopPayModal')).hide();
}

// 6. POS ORDER CALCULATOR
function calcPosTotal() {
    const price = parseFloat(document.getElementById('posType').value) || 0;
    const qty = parseFloat(document.getElementById('posQty').value) || 1;
    const total = price * qty;
    
    document.getElementById('posTotalBtn').innerText = formatNaira(total);
}

function handlePosOrder(e) {
    e.preventDefault();
    const total = document.getElementById('posTotalBtn').innerText;
    alert(`Order Confirmed!\nTotal Debited: ${total}\nDelivery: 2-3 Business Days.`);
    bootstrap.Modal.getInstance(document.getElementById('requestPosModal')).hide();
}

// 7. COMPLAINT & TICKET GENERATOR
function handleComplaint(e) {
    e.preventDefault();
    // Generate Random Ticket ID
    const ticketID = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    alert(`Complaint Submitted!\nTicket ID: ${ticketID}\nSupport will contact you shortly.`);
    bootstrap.Modal.getInstance(document.getElementById('complaintModal')).hide();
}

// 8. GENERIC TERMINAL ACTIONS (Reboot, Rename)
function simulateTerminalAction(msg, delay) {
    // Show temporary loading state
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert(msg);
        
        // If inside the settings modal, keep it open, otherwise close it if needed
        // For this use case, we usually keep settings open
    }, delay);
}

// 9. SUPPLIES
function handleSupplies(e) {
    e.preventDefault();
    const item = document.getElementById('supplyItem');
    const itemName = item.options[item.selectedIndex].text;
    alert(`Request Sent for: ${itemName}.\nInventory Updated.`);
    bootstrap.Modal.getInstance(document.getElementById('consumablesModal')).hide();
}


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
/**
 * ==========================================
 * TRANSACTION RECEIPT LOGIC
 * Features: Dynamic Data, Color Toggle (Credit/Debit), Mock Share/Download
 * ==========================================
 */

function viewReceipt(amount, type, ref, party, desc, date, isCredit) {
    // 1. Populate Text Data into Modal Elements
    document.getElementById('receiptAmount').innerText = amount;
    document.getElementById('receiptType').innerText = type;
    document.getElementById('receiptRef').innerText = ref;
    document.getElementById('receiptParty').innerText = party;
    document.getElementById('receiptDesc').innerText = desc;
    document.getElementById('receiptDate').innerText = date;

    // 2. Dynamic Styling (Green for Credit, Red for Debit)
    // Select the colorful header div inside the modal
    const headerElement = document.querySelector('#receiptModal .modal-body > div'); 
    const iconElement = headerElement.querySelector('i'); // Select the icon

    if (headerElement) {
        // Reset classes
        headerElement.classList.remove('bg-success', 'bg-danger');
        
        if (isCredit) {
            // Credit (Inflow) Styling
            headerElement.classList.add('bg-success');
            if(iconElement) iconElement.className = "bi bi-check-circle-fill";
        } else {
            // Debit (Outflow) Styling
            headerElement.classList.add('bg-danger');
            if(iconElement) iconElement.className = "bi bi-arrow-up-right-circle-fill";
        }
    }

    // 3. Show the Modal using Bootstrap 5 API
    const modalElement = document.getElementById('receiptModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Helper: Simulate Sharing
function shareReceipt() {
    if (navigator.share) {
        navigator.share({
            title: 'FingerPay Receipt',
            text: `Transaction Receipt: ${document.getElementById('receiptRef').innerText}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback for desktop/unsupported browsers
        alert("Share options opened (Simulated)");
    }
}

// Helper: Simulate PDF Download
function downloadReceipt() {
    const btn = event.target.closest('button'); // Ensure we target the button even if icon is clicked
    const originalText = btn.innerHTML;
    
    // Loading State
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert("Receipt PDF saved to your device!");
    }, 1500);
}

