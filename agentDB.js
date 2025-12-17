document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Set Current Date
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);

    // 2. Dashboard Chart Configuration
    const ctx = document.getElementById('dashboardChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Registrations',
                        data: [12, 19, 3, 5, 2, 8, 10], 
                        backgroundColor: '#0A7A5E',
                        borderRadius: 4,
                    },
                    {
                        label: 'Earnings (x1000)',
                        data: [6, 9.5, 1.5, 2.5, 1, 4, 5],
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

    // 3. Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});

// ==========================================
// FUNCTIONS
// ==========================================

// A. Section Switcher
function showSection(sectionId, linkElement) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('d-none'));
    
    // Show target section
    document.getElementById(`${sectionId}-section`).classList.remove('d-none');
    
    // Update Active Link State
    document.querySelectorAll('#sidebarNav .nav-link').forEach(nav => nav.classList.remove('active'));
    linkElement.classList.add('active');

    // Update Header Title
    const titles = {
        'dashboard': 'Overview',
        'registration': 'Registration & Targets',
        'merchant': 'Merchant Management',
        'earnings': 'Wallet & Commissions',
        'reports': 'Issue Tracker & Reports',
        'settings': 'Account Settings' // Add this line
    };
    document.getElementById('pageTitle').textContent = titles[sectionId];

    // Close sidebar on mobile after click
    if(window.innerWidth < 992) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// B. Simulation for Actions (Modals)
function simulateAction(message, modalId) {
    // 1. Hide Modal
    const modalEl = document.querySelector(modalId);
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // 2. Show Toast Notification
    const toastEl = document.getElementById('liveToast');
    document.getElementById('toastMessage').textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// C. Logout Function
function logout() {
    window.location.href = 'agenpp.html';
}

// ==========================================
// 7. SETTINGS PAGE LOGIC
// ==========================================

// Switch Tabs within Settings Section
window.openSettingTab = function(tabName, btnElement) {
    // 1. Hide all panes
    document.querySelectorAll('.setting-pane').forEach(pane => {
        pane.classList.add('d-none');
    });
    
    // 2. Show target pane
    const target = document.getElementById('tab-' + tabName);
    if(target) target.classList.remove('d-none');

    // 3. Update Sidebar Active State
    document.querySelectorAll('#settingsTabs .list-group-item').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('text-gold'); // Optional styling
    });
    btnElement.classList.add('active');
};

// Generic Form Save Simulation
window.saveSettings = function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    btn.textContent = "Saving...";
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        showToast("Settings updated successfully.");
    }, 1500);
};

// KYC File Upload Simulation
window.triggerFileUpload = function() {
    document.getElementById('kycUpload').click();
};

window.handleFileSelected = function(input) {
    if(input.files && input.files[0]) {
        const fileName = input.files[0].name;
        showToast(`Uploading ${fileName}...`);
        
        // Simulate upload delay
        setTimeout(() => {
            showToast("Document uploaded! Pending verification.");
            // Update Badge visually
            const badge = document.getElementById('kycBadge');
            if(badge) {
                badge.className = "badge bg-info text-dark ms-auto";
                badge.textContent = "Verifying...";
            }
        }, 2000);
    }
};

// Kill Switch Logic
window.confirmKillSwitch = function() {
    const modal = new bootstrap.Modal(document.getElementById('killSwitchModal'));
    modal.show();
};

window.finalizeKillSwitch = function() {
    const modalEl = document.getElementById('killSwitchModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    
    // Redirect to login with error param
    alert("ACCOUNT FROZEN. Redirecting to secure login...");
    window.location.href = "agent-login.html";
};
/**
 * ==========================================
 * FINAGENT AI 2.0 - COMPLETE LOGIC
 * ==========================================
 */

// --- UTILS ---
function showToast(msg, isError = false) {
    // Requires a Bootstrap Toast element in your main layout or use alert fallback
    console.log(msg); // Placeholder
    // Create simple alert for demo if toast doesn't exist
    const alertDiv = document.createElement('div');
    alertDiv.className = `position-fixed bottom-0 end-0 p-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `<div class="toast show bg-${isError ? 'danger':'dark'} text-white"><div class="toast-body">${msg}</div></div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// --- 1. DAILY SUMMARY & STRESS ALERT ---
let summaryModalInstance; 
function summarizeDay() {
    const el = document.getElementById('summaryModal');
    if(el) {
        summaryModalInstance = new bootstrap.Modal(el);
        summaryModalInstance.show();
        // Remove the red notification dot once viewed
        const dot = document.getElementById('stressDot');
        if(dot) dot.classList.add('d-none');
    }
}

function requestFloatFromSummary() {
    if(summaryModalInstance) summaryModalInstance.hide();
    const floatEl = document.getElementById('requestFloatModal');
    if(floatEl) new bootstrap.Modal(floatEl).show();
}

function handleFloatRequest(event) {
    event.preventDefault();
    const amount = document.getElementById('floatAmount').value;
    if(amount) {
        const floatEl = document.getElementById('requestFloatModal');
        const modalInstance = bootstrap.Modal.getInstance(floatEl);
        if(modalInstance) modalInstance.hide();
        showToast(`Float request for N${amount} sent!`);
    }
}

// --- 2. POLYGLOT COMMUNICATOR (LOAN & EDU SCRIPTS) ---
let currentPolyMode = 'loan'; // 'loan' or 'edu'

function switchPolyMode(mode, btn) {
    currentPolyMode = mode;
    
    // Update Tabs
    document.querySelectorAll('#polyglotTabs .nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Toggle Inputs
    if(mode === 'loan') {
        document.getElementById('loanInputs').classList.remove('d-none');
        document.getElementById('eduInputs').classList.add('d-none');
    } else {
        document.getElementById('loanInputs').classList.add('d-none');
        document.getElementById('eduInputs').classList.remove('d-none');
    }
}

function runPolyglotGen() {
    const output = document.getElementById('polyOutput');
    const status = document.getElementById('polyStatus');
    const lang = document.getElementById('targetLanguage').value;
    
    status.textContent = `AI Translating to ${lang}...`;
    status.className = "badge bg-warning text-dark";
    output.textContent = "";

    let text = "";

    // GENERATION LOGIC
    if (currentPolyMode === 'loan') {
        const merchId = document.getElementById('loanMerchId').value || "M-X";
        const score = document.getElementById('loanScore').value || "700";
        
        // Loan Templates
        const loanDict = {
            'English': `LOAN AGREEMENT for ${merchId}\nCredit Score: ${score}\n\nWe agree to disburse funds. Repayment is bi-weekly with 4.5% interest.`,
            'Pidgin': `AGREEMENT PAPER (${merchId})\nYour Score: ${score}\n\nOga/Madam, we don agree to give you money. You go pay small small every 2 weeks. Interest na chicken change (4.5%).`,
            'Hausa': `YARJEJENIYAR BASHI (${merchId})\n\nMuna amincewa da ba da bashin. Za a biya da ruwa 4.5%.`,
            'Yoruba': `ADEHUN YIYA OWO (${merchId})\n\nA ti gba lati san owo naa. Ere jẹ 4.5% ni gbogbo ọsẹ meji.`,
            'Igbo': `NKWEKỌRỊTA EGO (${merchId})\n\nAnyị kwenyere inye gị ego a. Ị ga-akwụghachi ya na ọmụrụ nwa 4.5%.`
        };
        text = loanDict[lang] || loanDict['English'];

    } else {
        // Education Templates
        const topic = document.getElementById('eduTopic').value;
        const eduDict = {
            'English': {
                'fraud': "SCRIPT: 'Always cover your PIN. Do not share your password with anyone, even staff.'",
                'interest': "SCRIPT: 'The 4.5% interest is only on the money you use, not the total limit.'",
                'app': "SCRIPT: 'Click the blue button to check your balance instantly.'"
            },
            'Pidgin': {
                'fraud': "SCRIPT: 'Abeg, cover your PIN well well. No give anybody your password o, even if na me.'",
                'interest': "SCRIPT: 'The 4.5% interest na only for the money wey you touch, no be everything.'",
                'app': "SCRIPT: 'Press that blue button if you wan see how much remain inside your wallet.'"
            },
            'Hausa': {
                'fraud': "SCRIPT: 'Kada ka bayar da lambar sirri ga kowa. Kube lambar sirrin ka.'",
                'interest': "SCRIPT: 'Kudin ruwa na 4.5% yana kan kudin da kuka yi amfani da shi ne kawai.'",
                'app': "SCRIPT: 'Danna maballin blue don duba asusunka.'"
            },
             'Yoruba': {
                'fraud': "SCRIPT: 'Maṣe fi koodu PIN rẹ han ẹnikẹni. Dabobo rẹ nigbagbogbo.'",
                'interest': "SCRIPT: 'Ere 4.5% wa lori owo ti o lo nikan.'",
                'app': "SCRIPT: 'Tẹ bọtini bulu lati ṣayẹwo iye owo to ku.'"
            },
             'Igbo': {
                'fraud': "SCRIPT: 'Enyela onye ọbụla PIN gị. kpuchie ya mgbe niile.'",
                'interest': "SCRIPT: 'Ọmụrụ nwa 4.5% bụ naanị na ego i jiri rụọ ọrụ.'",
                'app': "SCRIPT: 'Pịa bọtịnụ na-acha anụnụ anụnụ ka ịhụ ego gị.'"
            }
        };
        // Fallback safely
        let topicObj = eduDict[lang] || eduDict['English'];
        text = topicObj[topic] || topicObj['fraud'];
    }

    // Typewriter Effect
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            output.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            status.textContent = "Generated";
            status.className = "badge bg-success";
        }
    }, 15);
}

function sendToMerchant() {
    showToast("Script sent to Merchant App Notification center!");
}
function copyPolyText() {
    const text = document.getElementById('polyOutput').textContent;
    navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
}

// --- 3. SMART ROUTE + CASH PREDICTION ---
function optimizeRoute() {
    const list = document.getElementById('routeList');
    list.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-danger spinner-border-sm"></div> Analyzing Traffic & Cash Needs...</div>`;
    
    setTimeout(() => {
        list.innerHTML = `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-start border-4 border-success mb-2 shadow-sm">
                <div>
                    <h6 class="mb-0 fw-bold">1. Mama Nkechi (Yaba)</h6>
                    <small class="text-muted"><i class="bi bi-car-front-fill me-1"></i>15 mins</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">Best Route</span>
                    <!-- FEATURE: Cash-Out Prediction -->
                    <span class="badge bg-warning text-dark d-block mt-1">Prepare N50k</span>
                </div>
            </div>
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-start border-4 border-info mb-2 shadow-sm">
                <div>
                    <h6 class="mb-0 fw-bold">2. Olu Motors (Surulere)</h6>
                    <small class="text-muted"><i class="bi bi-car-front-fill me-1"></i>30 mins</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-secondary">Next Stop</span>
                    <span class="badge bg-warning text-dark d-block mt-1">Prepare N120k</span>
                </div>
            </div>
        `;
        showToast("Route Optimized with Cash Predictions.");
    }, 1500);
}

// --- 4. INCIDENT REPORTER ---
function generateIncidentReport() {
    const merch = document.getElementById('incidentMerchId').value;
    const desc = document.getElementById('incidentInput').value;
    if(!merch || !desc) return showToast("Enter details", true);
    
    document.getElementById('incidentForm').classList.add('d-none');
    document.getElementById('ticketResult').classList.remove('d-none');
    document.getElementById('ticketText').innerText = `TICKET #${Math.floor(Math.random()*9000)}\nMERCH: ${merch}\nISSUE: ${desc}\nSTATUS: OPEN`;
}
function editTicket() {
    document.getElementById('ticketResult').classList.add('d-none');
    document.getElementById('incidentForm').classList.remove('d-none');
}

// --- 5. MICRO TRAINING (SDG 4) ---
function startMicroModule(type) {
    const modal = new bootstrap.Modal(document.getElementById('microTrainModal'));
    const title = document.getElementById('trainTitle');
    const desc = document.getElementById('trainDesc');
    
    if(type === 'fraud') {
        title.innerText = "Fraud Detection 101";
        desc.innerText = "Learn to spot skimmers and fake alerts in 3 minutes.";
    } else if (type === 'sales') {
        title.innerText = "Upselling Skills";
        desc.innerText = "How to convince merchants to take Growth Loans.";
    } else {
        title.innerText = "Stress Management";
        desc.innerText = "Breathing techniques for high-traffic days.";
    }
    
    modal.show();

}
// --- AGGREGATOR INTELLIGENCE (Added) ---
function predictCashOutDemand() {
    // AI predicts high demand based on registration numbers
    const regCount = parseInt(document.getElementById('totalRegValue')?.innerText || "0");
    const prediction = regCount > 30 ? "HIGH DEMAND" : "NORMAL";
    
    const toastMsg = "AI Alert: " + prediction + " cash-out demand expected at your cluster today.";
    showToast ? showToast(toastMsg) : alert(toastMsg); 
}

function recommendTraining() {
    // Recommends modules based on current Level
    const level = document.querySelector('.text-gold.font-heading')?.innerText || "AG-LV2";
    let rec = level.includes("PRO") ? "Advanced Conflict Resolution" : "Biometric Enrollment 101";
    
    alert("AI Learning Path: We recommend the '" + rec + "' module next.");
}
