// ==========================================
// 1. INITIALIZATION & SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Set Current Date
    const dateOpts = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', dateOpts);

    
    // C. Mobile Sidebar Toggle
    const menuBtn = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if(menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active'); // CSS handles the transformation
            // If checking specifically for Bootstrap class toggling, logic goes here
            // But usually CSS media queries handle the 'active' class on mobile
            if(sidebar.style.marginLeft === '0px') {
                sidebar.style.marginLeft = '-260px';
            } else {
                sidebar.style.marginLeft = '0px';
            }
        });
    }

    // D. Initialize Staff List
    renderStaff();

    // E. Link Specific Buttons that might need dynamic listeners (Optional safety)
    // Most buttons are handled via onclick attributes in HTML or specific ID listeners below
});


// ==========================================
// 2. NAVIGATION & UI LOGIC
// ==========================================

// Switch between Dashboard Sections (Overview, Sales, Projects, etc.)
function showSection(sectionId, btnElement) {
    // 1. Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('d-none');
        el.classList.remove('fade-in'); // Reset animation class
    });

    // 2. Show target section with animation
    const target = document.getElementById(sectionId + '-section');
    if(target) {
        target.classList.remove('d-none');
        // Small timeout to re-trigger animation if needed, or just let CSS handle it
        setTimeout(() => target.classList.add('fade-in'), 10);
    }
    
    // 3. Update Sidebar Active State
    document.querySelectorAll('#sidebarNav .nav-link').forEach(l => l.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // 4. Update Header Title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'sales': 'Sales & Transaction History',
        'projects': 'Higher Projects & Goals',
        'logistics': 'POS Fleet Logistics',
        'staff': 'Staff & Payroll Manager',
        'settings': 'Business Settings',
    };
    const titleEl = document.getElementById('pageTitle');
    if(titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

    // 5. Auto-close sidebar on mobile
    if(window.innerWidth < 992) {
        const sidebar = document.getElementById('sidebar');
        if(sidebar) sidebar.style.marginLeft = '-260px';
    }
}

// Trigger the CSS Truck Animation
function triggerDeliveryAnim() {
    const modal = new bootstrap.Modal(document.getElementById('deliveryModal'));
    modal.show();
}


// ==========================================
// 3. GENERIC FORM SUBMISSION HANDLER
// ==========================================
// This handles New Project, Add Funds, Complaints, Withdrawal, etc.
window.handleFormSubmit = function(event, modalId, successMessage) {
    event.preventDefault(); // Stop page reload
    
    // 1. Locate and Hide the current form modal
    const currentModalEl = document.getElementById(modalId);
    const currentModal = bootstrap.Modal.getInstance(currentModalEl);
    if(currentModal) currentModal.hide();

    // 2. Show the Generic Success Modal
    const successModalEl = document.getElementById('genericSuccessModal');
    const successTextEl = document.getElementById('successMessageText');
    
    if(successModalEl && successTextEl) {
        successTextEl.textContent = successMessage;
        const successModal = new bootstrap.Modal(successModalEl);
        
        // Small delay for smooth visual transition
        setTimeout(() => {
            successModal.show();
        }, 300);
    }

    // 3. Reset the form inputs
    event.target.reset();
};


// ==========================================
// 4. STAFF & PAYROLL MANAGER
// ==========================================

// Initial Dummy Data
let staffList = [
    { id: 101, name: 'Mr. John Doe', role: 'Cashier', salary: 50000, bank: 'Zenith', acct: '202023***', source: 'Wallet', active: true },
    { id: 102, name: 'Sarah Smith', role: 'Manager', salary: 120000, bank: 'GTBank', acct: '012345***', source: 'Card', active: true }
];

// Render Table
function renderStaff() {
    const tbody = document.getElementById('staffTableBody');
    if(!tbody) return;
    tbody.innerHTML = ''; // Clear current list

    staffList.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ps-4 fw-bold">${staff.name}</td>
            <td><span class="badge bg-light text-dark border">${staff.role}</span></td>
            <td class="fw-bold">N${staff.salary.toLocaleString()}</td>
            <td class="small text-muted">${staff.bank} - ${staff.acct}</td>
            <td>
                <span class="badge ${staff.source === 'Wallet' ? 'bg-success' : 'bg-primary'} bg-opacity-75">
                    <i class="bi ${staff.source === 'Wallet' ? 'bi-wallet2' : 'bi-credit-card'} me-1"></i> ${staff.source}
                </span>
            </td>
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${staff.active ? 'checked' : ''} onchange="toggleStaffStatus(${staff.id})">
                </div>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-danger" title="Stop Payment" onclick="confirmStopPay(${staff.id})">
                    <i class="bi bi-pause-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add New Staff Listener
const addStaffForm = document.getElementById('addStaffForm');
if(addStaffForm) {
    addStaffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Gather Data
        const name = document.getElementById('staffName').value;
        const role = document.getElementById('staffRole').value;
        const salary = document.getElementById('staffSalary').value;
        const bank = document.getElementById('staffBank').value;
        const acctRaw = document.getElementById('staffAcct').value;
        const sourceVal = document.querySelector('input[name="paySource"]:checked').nextElementSibling.innerText.includes('Wallet') ? 'Wallet' : 'Card';

        const newStaff = {
            id: Date.now(),
            name: name,
            role: role,
            salary: parseInt(salary),
            bank: bank,
            acct: acctRaw.substring(0,6) + '***', // Mask account
            source: sourceVal,
            active: true
        };

        // Add to Array
        staffList.push(newStaff);
        
        // Re-render
        renderStaff();
        
        // Close Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newStaffModal'));
        modal.hide();
        
        // Show Toast Feedback
        showToast(`Payroll updated! Reminder set for ${newStaff.name}.`);
        
        // Reset Form
        e.target.reset();
    });
}

// Toggle Auto-Pay Status (Switch)
window.toggleStaffStatus = function(id) {
    const staff = staffList.find(s => s.id === id);
    if(staff) {
        staff.active = !staff.active;
        const statusMsg = staff.active ? "Auto-Pay Re-enabled" : "Auto-Pay Paused";
        showToast(`${statusMsg} for ${staff.name}`);
    }
};

// Stop Payment Logic (Button -> Modal -> Action)
let staffIdToStop = null;

window.confirmStopPay = function(id) {
    // 1. Store ID
    staffIdToStop = id;
    
    // 2. Show Confirmation Modal
    const modal = new bootstrap.Modal(document.getElementById('stopPayModal'));
    modal.show();
};

// This function is called by the "Yes, Pause" button in the StopPayModal
// Ensure the button in HTML has: onclick="finalizeStopPay()"
// NOTE: In the previous HTML, check the button onclick. If it calls confirmStopPay() without ID, update logic:
// Actually, let's bind the logic inside the modal button for safety.
// Search for the button with class 'btn-warning' inside stopPayModal in HTML logic or do it here:

// If the HTML button calls confirmStopPay() with no args, we handle it:
// Let's assume the HTML button is: onclick="handleStopPayAction()"
window.handleStopPayAction = function() {
    if(staffIdToStop !== null) {
        const staff = staffList.find(s => s.id === staffIdToStop);
        if(staff) {
            staff.active = false; // Turn off
            renderStaff(); // Update UI (switch goes off)
            showToast(`Payment stopped for ${staff.name}.`);
        }
        
        // Hide Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('stopPayModal'));
        modal.hide();
        
        // Reset
        staffIdToStop = null;
    }
};

// ==========================================
// 5. TOAST NOTIFICATION HELPER
// ==========================================
function showToast(msg) {
    const toastEl = document.getElementById('staffToast');
    const toastBody = document.getElementById('toastMsg');
    
    if(toastEl && toastBody) {
        toastBody.textContent = msg;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// ==========================================
// 6. WITHDRAWAL & COMPLAINT HELPERS
// ==========================================
// (These are mostly handled by window.handleFormSubmit via HTML attributes, 
// but we ensure the Withdraw button in the dashboard links correctly)

// Note: Ensure the "Withdraw Funds" button in the HTML dashboard section 
// has data-bs-target="#withdrawModal".


// ==========================================
// 7. POS LOGISTICS LOGIC
// ==========================================

// Handle POS Order Form -> Trigger Truck Animation
window.handlePosOrder = function(event) {
    event.preventDefault();
    
    // 1. Hide Order Modal
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('requestPosModal'));
    orderModal.hide();
    
    // 2. Trigger Delivery Animation (Existing function)
    triggerDeliveryAnim();
    
    // 3. Reset form
    event.target.reset();
};

// Open Terminal Settings Modal
window.openTerminalSettings = function(name, serial) {
    document.getElementById('manageSerial').textContent = serial;
    document.getElementById('terminalRenameInput').value = name;
    
    const modal = new bootstrap.Modal(document.getElementById('terminalSettingsModal'));
    modal.show();
};

// Simulate Remote Action (Reboot, Print)
window.simulateTerminalAction = function(msg, delay) {
    // 1. Hide Settings Modal
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('terminalSettingsModal'));
    settingsModal.hide();
    
    // 2. Show Loading State via Toast
    showToast(`Sending command: ${msg.split('...')[0]}...`);
    
    // 3. Simulate Success after delay
    setTimeout(() => {
        // Show Generic Success Modal
        const successModal = new bootstrap.Modal(document.getElementById('genericSuccessModal'));
        document.getElementById('successMessageText').textContent = msg;
        successModal.show();
    }, delay);
};

// Refresh Fleet List Animation
window.refreshFleetStatus = function(btn) {
    const icon = btn.querySelector('i');
    icon.classList.add('spin-anim'); // Add CSS rotation
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Updating...`;
    
    setTimeout(() => {
        icon.classList.remove('spin-anim');
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refresh`;
        showToast("Device telemetry updated.");
    }, 2000);
};

// ==========================================
// PROJECT SECTION LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smart Auto-Save Slider Logic
    const slider = document.getElementById('savePercent');
    const output = document.getElementById('percentVal');
    
    if (slider && output) {
        slider.addEventListener('input', function() {
            output.textContent = this.value + "%";
            // Visual feedback: Bold text if value is high
            if(this.value > 5) {
                output.classList.add('text-success');
            } else {
                output.classList.remove('text-success');
            }
        });
    }
});

// 2. Helper for "Quick Add" Buttons (+5k, +10k)
window.setVal = function(amount) {
    document.getElementById('fundAmount').value = amount;
};

// 3. Handle "Add Funds" (Real-time UI Update)
window.handleAddFunds = function(event) {
    event.preventDefault();
    
    const amountInput = document.getElementById('fundAmount');
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    // --- Simulation Logic ---
    // In a real app, these values come from the backend.
    // Here we grab the current text, strip the 'N' and ',', and calculate.
    
    const currentSavedEl = document.getElementById('projectSavedAmount');
    const progressBar = document.getElementById('projectProgressBar');
    
    // Parse current value (e.g., "N200,000" -> 200000)
    let currentSaved = parseFloat(currentSavedEl.innerText.replace(/[^0-9.-]+/g,""));
    const targetAmount = 500000; // Fixed target for demo
    
    // Calculate new totals
    let newTotal = currentSaved + amount;
    let newPercentage = (newTotal / targetAmount) * 100;
    
    // Cap at 100%
    if(newPercentage > 100) newPercentage = 100;

    // --- Update DOM ---
    currentSavedEl.innerText = 'N' + newTotal.toLocaleString();
    progressBar.style.width = newPercentage + '%';
    progressBar.innerText = Math.round(newPercentage) + '% Funded';
    
    // Change color if complete
    if (newPercentage >= 100) {
        progressBar.classList.remove('bg-success');
        progressBar.classList.add('bg-warning', 'text-dark');
        progressBar.innerText = "100% COMPLETED!";
        showToast("🎉 Congratulations! Project Fully Funded.");
    } else {
        showToast(`Success! N${amount.toLocaleString()} added to project.`);
    }

    // Close Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFundsModal'));
    modal.hide();
    
    // Reset Form
    event.target.reset();
};

// 4. Handle "Add Task" (Dynamic List Insertion)
window.handleAddTask = function(event) {
    event.preventDefault();
    
    const taskName = document.getElementById('taskNameInput').value;
    const taskCost = parseFloat(document.getElementById('taskCostInput').value).toLocaleString();
    const priority = document.getElementById('taskPriority').value; // Ensure your HTML select has this ID
    
    // Determine Badge Style
    let badgeHtml = '';
    if (priority === 'High') {
        badgeHtml = `<span class="badge bg-danger-subtle text-danger ms-2" style="font-size: 0.6rem;">HIGH PRIORITY</span>`;
    } else if (priority === 'Low') {
        badgeHtml = `<span class="badge bg-secondary-subtle text-secondary ms-2" style="font-size: 0.6rem;">LOW</span>`;
    }

    // Create New Task HTML
    const newTaskHTML = `
        <div class="list-group-item bg-transparent border-0 d-flex justify-content-between align-items-center px-0 py-2 border-bottom border-dashed fade-in">
            <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input border-secondary">
                <span>${taskName}</span>
                ${badgeHtml}
            </div>
            <span class="fw-bold text-dark">N${taskCost}</span>
        </div>
    `;

    // Insert at the top of the list (after the header)
    const taskList = document.getElementById('taskListArea');
    taskList.insertAdjacentHTML('afterbegin', newTaskHTML);

    // Close Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();

    // Show Feedback
    showToast(`Task "${taskName}" added to breakdown.`);
    
    // Reset Form
    event.target.reset();
};

// ==========================================
// 9. SETTINGS SECTION LOGIC
// ==========================================

// Switch Tabs inside Settings
window.openSettingTab = function(tabName, btnElement) {
    // 1. Hide all setting panes
    document.querySelectorAll('.setting-pane').forEach(pane => {
        pane.classList.add('d-none');
    });
    
    // 2. Show target pane
    const target = document.getElementById('tab-' + tabName);
    if(target) {
        target.classList.remove('d-none');
        target.classList.add('fade-in');
    }

    // 3. Update active state
    document.querySelectorAll('.settings-tab-link').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('text-primary');
    });
    btnElement.classList.add('active');
};

// Handle Form Save (Simulation)
window.handleSettingsSave = function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    btn.innerText = "Saving...";
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        showToast("Business profile updated successfully.");
    }, 1500);
};

// Document Upload Simulation
window.triggerDocUpload = function() {
    document.getElementById('docUpload').click();
};

window.handleDocSelected = function(input) {
    if(input.files && input.files[0]) {
        const fileName = input.files[0].name;
        showToast(`Uploading ${fileName}...`);
        setTimeout(() => {
            showToast("Document uploaded! Pending verification.");
        }, 2000);
    }
};

// ==========================================
// 1. CREDIT AI GENERATOR LOGIC
// ==========================================
function simulateGenerateCreditProfile() {
    const initialState = document.getElementById('aiInitialState');
    const loadingState = document.getElementById('aiLoadingState');
    const resultState = document.getElementById('aiResultState');
    const loadingText = document.getElementById('aiLoadingText');

    initialState.classList.add('d-none');
    loadingState.classList.remove('d-none');

    // Sequence
    setTimeout(() => loadingText.textContent = "Scanning Transaction History...", 800);
    setTimeout(() => loadingText.textContent = "Integrating Health Modules...", 1800);
    setTimeout(() => loadingText.textContent = "Calculating Growth Potential...", 2800);

    setTimeout(() => {
        loadingState.classList.add('d-none');
        resultState.classList.remove('d-none');
        resultState.classList.add('fade-in');
        
        animateValue("creditScore", 0, 785, 1500);
        
        // Initialize Default Language Views
        renderSchool('en', null);
        renderLiteracy();
    }, 3800);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// ==========================================
// 2. MERCHANT GROWTH SIMULATOR
// ==========================================
function runAdvancedSimulation() {
    const project = document.getElementById('simProject').value;
    const goal = document.getElementById('simGoal').value;
    const resultBox = document.getElementById('simulationResult');
    const resultText = document.getElementById('simText');
    
    resultBox.classList.remove('d-none');
    resultText.innerHTML = '<span class="spinner-border spinner-border-sm text-info"></span> AI calculating...';

    setTimeout(() => {
        let prediction = "";
        
        if (project === 'new_stock') {
             prediction = `Restocking now with a <strong>${goal}%</strong> sales target is projected to increase monthly profit by <strong>N45,000</strong>.`;
        } else if (project === 'renovation') {
             prediction = `Renovating attracts more customers. Projected foot traffic increase: <strong>${Number(goal) + 15}%</strong>.`;
        } else {
             prediction = `Marketing campaigns targeting <strong>${goal}%</strong> growth usually yield a 3x ROI within 60 days.`;
        }
        
        resultText.innerHTML = prediction;
    }, 1000);
}

// ==========================================
// 3. LOAN & BIOMETRICS
// ==========================================
function selectLoan(amountString) {
    const modalEl = document.getElementById('loanModal');
    if(modalEl) {
        document.getElementById('loanStep1').classList.remove('d-none');
        document.getElementById('loanStep2').classList.add('d-none');
        document.getElementById('loanPrincipal').textContent = 'N' + amountString;
        
        let rawAmount = parseFloat(amountString.replace(/,/g, '')); 
        let repayment = rawAmount + (rawAmount * 0.05); 
        document.getElementById('loanRepayment').textContent = 'N' + repayment.toLocaleString();

        const myModal = new bootstrap.Modal(modalEl);
        myModal.show();
    }
}

function initiateLoanBiometrics() {
    document.getElementById('loanStep1').classList.add('d-none');
    document.getElementById('loanStep2').classList.remove('d-none');
    
    const statusText = document.getElementById('loanScanText');
    const icon = document.getElementById('loanScanIcon');

    setTimeout(() => {
        statusText.textContent = "Verifying Identity...";
        statusText.className = "text-info small fw-bold";
        icon.className = "bi bi-fingerprint text-info fs-1";
        icon.style.opacity = "1";
    }, 1500);

    setTimeout(() => {
        statusText.textContent = "Signature Confirmed!";
        statusText.className = "text-success small fw-bold";
        icon.className = "bi bi-check-circle-fill text-success fs-1";
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('loanModal'));
            modal.hide();
        }, 1000);
    }, 3000);
}

// ==========================================
// 4. HEALTH PLANNER (SDG 3)
// ==========================================
function calculateHealthPlan() {
    const issueSelect = document.getElementById('healthIssue');
    const days = parseInt(document.getElementById('healthFreq').value);
    
    // Get cost from value map
    const costs = { 'Malaria': 10000, 'Typhoid': 15000, 'Checkup': 5000, 'Family': 50000 };
    const totalCost = costs[issueSelect.value];
    const dailySave = Math.ceil(totalCost / days);

    document.getElementById('healthResult').classList.remove('d-none');
    document.getElementById('healthName').textContent = issueSelect.options[issueSelect.selectedIndex].text;
    document.getElementById('healthDaily').textContent = "N" + dailySave.toLocaleString();
}

// ==========================================
// 5. BUSINESS SCHOOL DATA & LOGIC (SDG 4)
// ==========================================
const schoolData = {
    en: { free: ["Managing Daily Cashflow", "Customer Retention 101", "Separating Personal Money", "Basic Inventory Keeping"], paid: ["Advanced Tax & Compliance", "Scaling to Locations"] },
    pidgin: { free: ["How to Hold Your Money Well", "Make Customer Come Back", "Personal Money vs Shop Money", "Checking Your Market Stock"], paid: ["Tax Wahala & Government", "Opening Shop for Other Side"] },
    yoruba: { free: ["Isakoso Owo Ojoojumọ", "Itọju Onibara", "Yiya Owo Ara si Owo Oja", "Itoju Ọja"], paid: ["Oye Nipa Owo-Ori", "Fifi Kun Awọn Ile Itaja"] },
    igbo: { free: ["Ijikwa Ego Kwa Ụbọchị", "Idebe Ndị Ahịa", "Ikewapụ Ego Onwe na Ego Ahịa", "Idebe Ihe Ahịa"], paid: ["Iwu Tax na Ụgwọ Gọọmenti", "Imeghe Alaka Ọhụrụ"] },
    hausa: { free: ["Kula da Kudin Shiga", "Tsare Abokan Ciniki", "Raba Kudin Kai da na Sana'a", "Kula da Kayayyaki"], paid: ["Biyan Haraji", "Bude Wasu Wuraren Sana'a"] }
};

function renderSchool(lang, btnElement) {
    // UI Update
    if(btnElement) {
        document.querySelectorAll('#langTabs .nav-link').forEach(b => b.classList.remove('active', 'bg-info', 'text-dark'));
        btnElement.classList.add('active', 'bg-info', 'text-dark');
    }

    const data = schoolData[lang];
    const container = document.getElementById('schoolContent');
    
    let html = `
        <h6 class="text-white-50 mb-3 text-uppercase small ls-1">Free Lessons (4)</h6>
        <div class="list-group list-group-flush mb-4 rounded overflow-hidden">`;
    
    data.free.forEach(title => {
        html += `
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                <span><i class="bi bi-play-circle text-warning me-2"></i> ${title}</span>
                <span class="badge bg-success">Free</span>
            </button>`;
    });

    html += `</div><h6 class="text-white-50 mb-3 text-uppercase small ls-1">Premium Masterclass (2)</h6>
             <div class="list-group list-group-flush rounded overflow-hidden">`;

    data.paid.forEach(title => {
        html += `
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center opacity-75">
                <span><i class="bi bi-lock-fill text-muted me-2"></i> ${title}</span>
                <span class="badge bg-warning text-dark">N1,000</span>
            </button>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// 6. LOAN LITERACY DATA & LOGIC (SDG 4)
// ==========================================
const literacyData = {
    terms: ["Principal", "Interest Rate", "Collateral", "Default", "Tenor", "Credit Score", "Disbursement", "Equity"],
    en: ["Original money borrowed.", "Fee charged for borrowing.", "Asset pledged as security.", "Failure to repay loan.", "Duration of the loan.", "Number showing trust level.", "Release of funds to you.", "Your own contribution."],
    pidgin: ["The main money you borrow.", "The extra money you go pay on top.", "Property you drop incase you no pay.", "If you fall hand, no pay.", "How long the loan go last.", "Score wey show if dem fit trust you.", "When dem send the money give you.", "The money wey come from your own pocket."],
    yoruba: ["Owo ti a ya.", "Ele lori owo.", "Dogo (Ohun idogo).", "Ikuna lati sanwo pada.", "Akoko yiya owo.", "Iwon igbẹkẹle fun yiya owo.", "Ifilọlẹ owo si apo rẹ.", "Owo ti o ni ninu iṣowo."],
    igbo: ["Ego isi a gbaziri.", "Ego nlele.", "Ihe eji ibe ego.", "Adighị akwụghachi ụgwọ.", "Oge eji akwụghachi ụgwọ.", "Akara ntụkwasị obi.", "Inye gị ego aka.", "Ego nke gị itinye."],
    hausa: ["Ainihin kudin bashi.", "Kudin ruwa.", "Jingina.", "Kasa biyan bashi.", "Lokacin biyan bashi.", "Maki na yarda.", "Sakin kudi zuwa gareka.", "Jarin kashin kai."]
};

function renderLiteracy() {
    const lang = document.getElementById('litLangSelect').value;
    const container = document.getElementById('loanTermsAccordion');
    const terms = literacyData.terms;
    const definitions = literacyData[lang];
    
    let html = '';
    terms.forEach((term, index) => {
        html += `
            <div class="accordion-item bg-dark border border-secondary text-white mb-2 rounded overflow-hidden">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed bg-transparent text-white shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#term${index}">
                        <i class="bi bi-book me-2 text-primary"></i> ${term}
                    </button>
                </h2>
                <div id="term${index}" class="accordion-collapse collapse" data-bs-parent="#loanTermsAccordion">
                    <div class="accordion-body text-white-50 small border-top border-secondary">
                        ${definitions[index]}
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;

}
// --- MERCHANT AI INTELLIGENCE (Added) ---
function simulateCreditGrowth() {
    const salesEl = document.getElementById('todaySalesValue');
    const sales = salesEl ? salesEl.innerText : "N0";
    
    // AI Calculation for Merchant Credit Score
    const scoreBoost = sales.includes('k') ? 15 : 5;
    alert("Credit AI: Based on today's performance, your credit limit will increase by " + scoreBoost + "% in 48 hours.");
}

function analyzeStaffEfficiency() {
    // Logic to calculate payroll vs sales (simulated)
    alert("AI Staff Insight: Staff performance is up 12% this week. Payroll is optimized for SDG 8 (Decent Work).");
}
/* ==========================================
   MERCHANTDB.JS - Merchant / Credit AI
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    checkInventoryRunway();
    initCreditPulse();
});

// --- 1. INVENTORY RUNWAY (Stock Prediction) ---
function checkInventoryRunway() {
    // Mock Data
    const stockLevel = 450; // Items
    const dailySalesRate = 58; // Items per day

    const daysLeft = Math.floor(stockLevel / dailySalesRate);
    
    if (daysLeft < 7) {
        const modalHtml = `
        <div class="modal fade" id="inventoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content border-danger">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">📉 Stock Alert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Critical Low:</strong> Based on current sales speed, your inventory will finish in <strong>${daysLeft} days</strong>.</p>
                        <p>FinCoach suggests restocking immediately to avoid revenue loss.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-dark" onclick="orderStock()">Order Now</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('inventoryModal')).show();
    }
}

// --- 2. LOAN WHAT-IF SIMULATOR ---
function calculateLoanImpact() {
    const loanAmount = document.getElementById('loan-slider').value;
    const profitDisplay = document.getElementById('loan-profit-display');

    // Logic: Every N100,000 loan yields estimated 20% growth in inventory turnover
    const estimatedGrowth = (loanAmount * 1.20).toLocaleString();
    const costOfLoan = (loanAmount * 1.05).toLocaleString(); // 5% Interest

    profitDisplay.innerHTML = `
        <div class="card bg-light p-3 mt-2">
            <div class="d-flex justify-content-between">
                <span>Loan Amount:</span> <strong>N${parseInt(loanAmount).toLocaleString()}</strong>
            </div>
            <div class="d-flex justify-content-between text-success">
                <span>Projected Revenue:</span> <strong>N${estimatedGrowth}</strong>
            </div>
            <hr>
            <div class="d-flex justify-content-between fw-bold">
                <span>Est. Net Profit:</span> <span>N${(loanAmount * 0.15).toLocaleString()}</span>
            </div>
        </div>
    `;
}

// Attach listener if element exists
const loanSlider = document.getElementById('loan-slider');
if(loanSlider) loanSlider.addEventListener('input', calculateLoanImpact);


// --- 3. DYNAMIC CREDIT SCORE (Visual Pulse) ---
function initCreditPulse() {
    // Simulate a sale happening
    window.recordSale = function() {
        let salesCount = parseInt(localStorage.getItem('salesCount')) || 0;
        salesCount++;
        localStorage.setItem('salesCount', salesCount);

        // Every 5 sales, boost score
        if (salesCount % 5 === 0) {
            boostCreditScore();
        }
    };
}

function boostCreditScore() {
    const scoreEl = document.getElementById('credit-score-text'); // The number text
    const badgeEl = document.getElementById('score-badge'); // The container
    
    let currentScore = parseInt(scoreEl.innerText);
    let newScore = currentScore + 2;

    // 1. Update Text
    scoreEl.innerText = newScore;
    
    // 2. Add Pulse Animation Class
    badgeEl.classList.add('pulse-animation-green'); // Assumes CSS definition
    
    // 3. Show Toast
    showToast(`🚀 Credit Score Upgraded! New Score: ${newScore}`, 'success');

    // Remove animation class after 1s
    setTimeout(() => {
        badgeEl.classList.remove('pulse-animation-green');
    }, 1000);
}

// Helper: Toast (Same structure)
function showToast(msg, type = 'success') { /* ... see pack.js implementation ... */ }
