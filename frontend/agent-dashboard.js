/**
 * ==========================================
 * AGENT DASHBOARD CONTROLLER (FIXED)
 * Features: Dashboard, FinAgent AI, Settings, Navigation
 * ==========================================
 */

// ==========================================
// 1. GLOBAL NAVIGATION & UI LOGIC (Must be at the top)
// ==========================================

// FIX: Global Navigation Handler
window.showSection = function(sectionId, linkElement) {
    console.log("Navigating to:", sectionId);

    // 1. Hide all content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('d-none');
        // Remove active animation class if exists to reset
        sec.classList.remove('fade-in'); 
    });

    // 2. Show target section
    // Handles naming mismatch (e.g. HTML might pass 'finagent' but ID is 'finagent-section')
    const targetId = sectionId.endsWith('-section') ? sectionId : `${sectionId}-section`;
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
        targetSection.classList.remove('d-none');
        setTimeout(() => targetSection.classList.add('fade-in'), 10);
    } else {
        console.error(`Section ID '${targetId}' not found.`);
    }

    // 3. Update Sidebar Active State
    document.querySelectorAll('#sidebarNav .nav-link').forEach(nav => nav.classList.remove('active'));
    if (linkElement) linkElement.classList.add('active');

    // 4. Update Header Title
    const titles = {
        'dashboard': 'Agent Overview',
        'registration': 'Customer Registration',
        'merchant': 'Merchant Onboarding',
        'earnings': 'Wallet & Commissions',
        'finagent': 'FinAgent AI',
        'reports': 'Issue Reports',
        'settings': 'Account Settings'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[sectionId] || 'Dashboard';

    // 5. Close Mobile Sidebar
    if (window.innerWidth < 992) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
};

// Global Toast Notification Helper
window.showToast = function(msg, isError = false) {
    let toastEl = document.getElementById('liveToast');
    let toastBody = document.getElementById('toastMessage');

    if (!toastEl) {
        // Fallback create toast if missing
        toastEl = document.createElement('div');
        toastEl.className = `toast position-fixed bottom-0 end-0 m-3 align-items-center text-white bg-${isError ? 'danger' : 'success'} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
        document.body.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        return;
    }

    if (toastBody) toastBody.textContent = msg;
    
    // Toggle color
    toastEl.classList.remove('bg-danger', 'bg-dark', 'bg-success');
    toastEl.classList.add(isError ? 'bg-danger' : 'bg-dark');
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
};

// ==========================================
// 2. INITIALIZATION (On Page Load)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Set Date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // 2. Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // 3. Load Data (API Simulation)
    if (typeof loadDashboardData === 'function') {
        await loadDashboardData();
    }
});

// ==========================================
// 3. DASHBOARD DATA LOADING (Simulation)
// ==========================================
async function loadDashboardData() {
    try {
        showLoading();

        // Simulate API call delay
        await new Promise(r => setTimeout(r, 800));

        // Mock Data
        const data = {
            stats: {
                totalRegistrations: 142,
                monthlyRegistrations: 28,
                totalEarnings: 450000,
                monthlyEarnings: 85000,
                balance: 24500,
                liquidityBalance: 150000
            },
            chartData: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                registrations: [5, 12, 8, 15, 20, 10, 3],
                earnings: [2500, 6000, 4000, 7500, 10000, 5000, 1500]
            }
        };

        updateDashboardStats(data);
        initializeChart(data);
        hideLoading();

    } catch (error) {
        console.error('Failed to load dashboard:', error);
        hideLoading();
        // Fallback for demo
        updateDashboardStats({ stats: { totalRegistrations: 0, monthlyRegistrations: 0, totalEarnings: 0 }});
    }
}

function updateDashboardStats(data) {
    if (data && data.stats) {
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.textContent = val;
        };

        setText('totalRegistrations', data.stats.totalRegistrations);
        setText('monthlyRegistrations', data.stats.monthlyRegistrations);
        setText('totalEarnings', `₦${(data.stats.totalEarnings).toLocaleString()}`);
        setText('monthlyEarnings', `₦${(data.stats.monthlyEarnings).toLocaleString()}`);
        setText('balance', `₦${(data.stats.balance || 0).toLocaleString()}`);
        setText('liquidityBalance', `₦${(data.stats.liquidityBalance || 0).toLocaleString()}`);
    }
}

function initializeChart(data) {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') return;

    const chartData = data?.chartData || {};
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Registrations',
                    data: chartData.registrations || [], 
                    backgroundColor: '#0A7A5E',
                    borderRadius: 4,
                },
                {
                    label: 'Earnings (₦)',
                    data: chartData.earnings || [],
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

function showLoading() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) loader.classList.remove('d-none');
}

function hideLoading() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) loader.classList.add('d-none');
}

// ==========================================
// 4. AUTH & SETTINGS LOGIC
// ==========================================

// Logout Function
window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear local storage if needed
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
        
        // Redirect to agent dashboard (login page in reality, but per request: agent-dashboard.html)
        // NOTE: User requested redirect to agent-dashboard.html on logout (Logic seems circular but following instruction)
        // Ideally should be 'agent-login.html' or 'log.html'
        window.location.href = 'agent-dashboard.html'; 
    }
};

// Settings Tabs
window.openSettingTab = function(tabName, btnElement) {
    document.querySelectorAll('.setting-pane').forEach(pane => pane.classList.add('d-none'));
    
    const target = document.getElementById('tab-' + tabName);
    if(target) target.classList.remove('d-none');

    document.querySelectorAll('#settingsTabs .list-group-item').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
};

// Save Settings
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

// KYC Upload
window.triggerFileUpload = function() {
    document.getElementById('kycUpload').click();
};

window.handleFileSelected = function(input) {
    if(input.files && input.files[0]) {
        showToast(`Uploading ${input.files[0].name}...`);
        setTimeout(() => {
            showToast("Document uploaded! Pending verification.");
            const badge = document.getElementById('kycBadge');
            if(badge) {
                badge.className = "badge bg-info text-dark ms-auto";
                badge.textContent = "Verifying...";
            }
        }, 2000);
    }
};

// Kill Switch
window.confirmKillSwitch = function() {
    new bootstrap.Modal(document.getElementById('killSwitchModal')).show();
};

window.finalizeKillSwitch = function() {
    bootstrap.Modal.getInstance(document.getElementById('killSwitchModal')).hide();
    alert("ACCOUNT FROZEN. Redirecting to secure login...");
    window.location.href = "agenpp.html";
};


// ==========================================
// 5. FINAGENT AI 2.0 (INTEGRATED)
// ==========================================

// Daily Summary
let summaryModalInstance; 
window.summarizeDay = function() {
    const el = document.getElementById('summaryModal');
    if(el) {
        summaryModalInstance = new bootstrap.Modal(el);
        summaryModalInstance.show();
        const dot = document.getElementById('stressDot');
        if(dot) dot.classList.add('d-none');
    }
};

window.requestFloatFromSummary = function() {
    if(summaryModalInstance) summaryModalInstance.hide();
    const floatEl = document.getElementById('requestFloatModal');
    if(floatEl) new bootstrap.Modal(floatEl).show();
};

window.handleFloatRequest = function(event) {
    event.preventDefault();
    const amount = document.getElementById('floatAmount').value;
    if(amount) {
        const floatEl = document.getElementById('requestFloatModal');
        bootstrap.Modal.getInstance(floatEl)?.hide();
        showToast(`Float request for N${amount} sent!`);
    }
};

/**
 * ==========================================
 * FINAGENT AI: UNIFIED POLYGLOT COMMUNICATOR
 * Combines Mode Switching + Rich Translation Dictionary
 * ==========================================
 */

// 1. STATE MANAGEMENT
let currentPolyMode = 'loan'; // Default mode

// 2. RICH CONTENT DATABASE (Education Scripts)
// These keys match the <select id="eduTopic"> values in your HTML
const polyglotData = {
    'interest': {
        'English': "Our interest rate is 4.5% monthly. For example, if you borrow N10,000 today, you will pay back N10,450 in 30 days. There are no hidden fees.",
        'Pidgin': "Oga/Madam, the interest na just 4.5% every month. If you collect N10k now, you go pay back N10,450 when month end. No mago-mago anywhere.",
        'Hausa': "Kudin ruwa shine 4.5% kowane wata. Idan ka ranta N10,000, zaka biya N10,450 nan da kwana 30. Babu wani caji na boye.",
        'Yoruba': "Ele wa jẹ 4.5% loṣooṣu. Ti o ba ya N10,000, iwọ yoo san N10,450 pada ni ọgbọn ọjọ. Ko si owo pamọ.",
        'Igbo': "Mmasị anyị bụ 4.5% kwa ọnwa. Ọ bụrụ na ị gbaziri N10,000, ị ga-akwụghachi N10,450 n'ime ụbọchị 30. Enweghị ụgwọ zoro ezo."
    },
    'fraud': {
        'English': "Security Warning: Do not share your 4-digit PIN with anyone, not even bank staff. Cover the keypad when typing. If you see a camera, report it.",
        'Pidgin': "Abeg shine your eyes! No give anybody your PIN number, even if na bank manager ask you. Cover your hand well when you dey press PIN.",
        'Hausa': "Gargadi: Kada ka baiwa kowa lambar sirrinka (PIN). Kare maballin lokacin dannawa. Idan kaga kyamara, ka kai kara.",
        'Yoruba': "Ikilọ Abo: Maṣe pin PIN rẹ pẹlu ẹnikẹni, paapaa oṣiṣẹ banki. Bo bọtini nigba titẹ. Ti o ba ri kamẹra, jabọ rẹ.",
        'Igbo': "Ịdọ aka ná ntị nchekwa: ekekọrịtala onye ọ bụla PIN gị. Kpuchie ahụigodo mgbe ị na-ede ihe."
    },
    'app': {
        'English': "Download the FingerPay App to track transactions instantly. You can print receipts via Bluetooth and check your daily profit without waiting for SMS.",
        'Pidgin': "Download the FingerPay App make you dey see transaction sharp-sharp. You fit print receipt connect Bluetooth printer. No need to wait for SMS.",
        'Hausa': "Sauke manhajar FingerPay don ganin hada-hadar kudi nan take. Zaka iya fitar da rasit ta Bluetooth kuma ka duba ribar ka.",
        'Yoruba': "Ṣe igbasilẹ ohun elo FingerPay lati tọpa awọn iṣowo lẹsẹkẹsẹ. O le tẹ awọn iwe-ẹri nipasẹ Bluetooth ki o ṣayẹwo ere ojoojumọ rẹ.",
        'Igbo': "Budata ngwa FingerPay ka ị soro azụmahịa ozugbo. Ị nwere ike ibipụta akwụkwọ nnata site na Bluetooth."
    }
};

// 3. UI SWITCHING LOGIC
window.switchPolyMode = function(mode, btn) {
    currentPolyMode = mode;
    
    // Update Tabs
    document.querySelectorAll('#polyglotTabs .nav-link').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');

    // Toggle Input Sections
    if(mode === 'loan') {
        document.getElementById('loanInputs').classList.remove('d-none');
        document.getElementById('eduInputs').classList.add('d-none');
    } else {
        document.getElementById('loanInputs').classList.add('d-none');
        document.getElementById('eduInputs').classList.remove('d-none');
    }
};

// 4. GENERATION LOGIC (The Brain)
window.runPolyglotGen = function() {
    // Elements
    const output = document.getElementById('polyOutput');
    const status = document.getElementById('polyStatus');
    const lang = document.getElementById('targetLanguage').value;
    
    // UI Update (Thinking State)
    status.textContent = `Translating to ${lang}...`;
    status.className = "badge bg-warning text-dark";
    output.innerHTML = `<span class="spinner-border spinner-border-sm text-warning"></span> AI Processing...`;

    let text = "";

    // === LOGIC BRANCH: LOAN MODE ===
    if (currentPolyMode === 'loan') {
        const merchId = document.getElementById('loanMerchId')?.value || "MER-001";
        const score = document.getElementById('loanScore')?.value || "700";
        
        // Dynamic Loan Templates
        if(lang === 'English') {
            text = `LOAN OFFER FOR ${merchId}:\nCongratulations! With a credit score of ${score}, you qualify for N50,000.\nInterest: 4.5% Monthly.\nRepay: N52,250.`;
        } else if(lang === 'Pidgin') {
            text = `SPECIAL OFFER FOR ${merchId}:\nOga/Madam, your score na ${score}, e bam! We fit give you N50k sharp-sharp.\nJust 4.5% interest. You go pay N52,250 back.`;
        } else if(lang === 'Hausa') {
            text = `TAYIN BASHI GA ${merchId}:\nBarka! Da maki ${score}, ka cancanci N50,000.\nKudin ruwa: 4.5% a wata.\nJimlar biya: N52,250.`;
        } else if(lang === 'Yoruba') {
            text = `ÌFUNNI AWIN FUN ${merchId}:\nOriire! Pẹlu aami ${score}, o ye fun N50,000.\nEle: 4.5% Oṣooṣu.\nSan pada: N52,250.`;
        } else if(lang === 'Igbo') {
            text = `ONYINYE EGO BIRI ${merchId}:\nEkele! Site na akara ${score}, ị tozuru oke maka N50,000.\nMmasị: 4.5% Kwa ọnwa.\nKwụọ ụgwọ: N52,250.`;
        }
    } 
    // === LOGIC BRANCH: EDUCATION MODE ===
    else {
        const topic = document.getElementById('eduTopic').value; // interest, fraud, app
        
        // Fetch from Database
        if(polyglotData[topic] && polyglotData[topic][lang]) {
            text = polyglotData[topic][lang];
        } else {
            text = `[${lang}] Script for ${topic} is being generated. Please explain terms manually.`;
        }
    }

    // === TYPEWRITER EFFECT ===
    setTimeout(() => {
        output.textContent = ""; // Clear loader
        let i = 0;
        const speed = 20; // ms per character

        const interval = setInterval(() => {
            if (i < text.length) {
                // Handle newlines for better formatting
                const char = text.charAt(i);
                if(char === '\n') {
                     output.appendChild(document.createElement('br'));
                } else {
                     output.append(char);
                }
                i++;
            } else {
                clearInterval(interval);
                status.textContent = "Generated Successfully";
                status.className = "badge bg-success";
            }
        }, speed);
    }, 500); // Slight delay for realism
};

// 5. HELPER FUNCTIONS
window.sendToMerchant = function() {
    // In a real app, this would trigger an API call to the merchant's device
    showToast("Message sent to Merchant App Terminal!");
};

window.copyPolyText = function() {
    const text = document.getElementById('polyOutput').innerText; // Use innerText to get newlines
    navigator.clipboard.writeText(text).then(() => {
        showToast("Script copied to clipboard!");
    }).catch(err => {
        showToast("Failed to copy", true);
    });
};
// Route Optimizer
window.optimizeRoute = function() {
    const list = document.getElementById('routeList');
    list.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-danger spinner-border-sm"></div> Analyzing Traffic...</div>`;
    
    setTimeout(() => {
        list.innerHTML = `
            <div class="list-group-item d-flex justify-content-between align-items-center mb-2 shadow-sm">
                <div><strong>1. Mama Nkechi</strong> (15 mins)</div>
                <span class="badge bg-success">Best Route</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center shadow-sm">
                <div><strong>2. Olu Motors</strong> (30 mins)</div>
                <span class="badge bg-warning text-dark">Traffic</span>
            </div>
        `;
        showToast("Route Optimized.");
    }, 1500);
};

// Incident Reporter
window.generateIncidentReport = function() {
    const merch = document.getElementById('incidentMerchId').value;
    const desc = document.getElementById('incidentInput').value;
    if(!merch || !desc) return showToast("Enter details", true);
    
    document.getElementById('incidentForm').classList.add('d-none');
    document.getElementById('ticketResult').classList.remove('d-none');
    document.getElementById('ticketText').innerText = `TICKET #${Math.floor(Math.random()*9000)}\nMERCH: ${merch}\nISSUE: ${desc}\nSTATUS: OPEN`;
};

window.editTicket = function() {
    document.getElementById('ticketResult').classList.add('d-none');
    document.getElementById('incidentForm').classList.remove('d-none');
};

window.copyTicket = function() {
    navigator.clipboard.writeText(document.getElementById('ticketText').innerText)
        .then(() => showToast('Copied!'));
};

window.addTicketNote = function() {
    const note = prompt('Add a note:');
    if (note) {
        document.getElementById('ticketText').innerText += `\n\nNOTE: ${note}`;
        showToast('Note added');
    }
};

// Micro Training (SDG 4)
window.startMicroModule = function(type) {
    const modal = new bootstrap.Modal(document.getElementById('microTrainModal'));
    const title = document.getElementById('trainTitle');
    const desc = document.getElementById('trainDesc');
    
    if(type === 'fraud') {
        title.innerText = "Fraud Detection 101";
        desc.innerText = "Learn to spot skimmers in 3 minutes.";
    } else if (type === 'sales') {
        title.innerText = "Upselling Skills";
        desc.innerText = "How to convince merchants to take Growth Loans.";
    } else {
        title.innerText = "Stress Management";
        desc.innerText = "Breathing techniques for high-traffic days.";
    }
    
    modal.show();
};
