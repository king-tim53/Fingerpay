/**
 * ==========================================
 * MASTER JAVASCRIPT FILE - CORRECTED
 * Includes: Navigation, Dashboard, Credit AI,
 * FinAgent, and FinCoach AI.
 * ==========================================
 */

// --- 1. GLOBAL NAVIGATION LOGIC ---
// Attached to window to fix "showSection is not defined"
window.showSection = function(sectionName) {
    // List of all possible sections
    const allSections = [
        'section-dashboard',
        'section-vault',
        'section-history',
        'section-cards',
        'section-finger',
        'section-fincoach'
    ];

    // Section mapping
    const sectionMap = {
        'dashboard': 'section-dashboard',
        'vault': 'section-vault',
        'history': 'section-history',
        'cards': 'section-cards',
        'finger': 'section-finger',
        'fincoach': 'section-fincoach'
    };

    // Hide all sections
    allSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('d-none');
            el.classList.remove('fade-in');
        }
    });

    // Determine target ID
    const targetId = sectionMap[sectionName] || 'section-dashboard';

    // Show Target
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.remove('d-none');
        setTimeout(() => targetElement.classList.add('fade-in'), 50);
        // Removed scrollIntoView to prevent jumping on mobile
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-link');
        const clickAttr = link.getAttribute('onclick');
        if (clickAttr && clickAttr.includes(sectionName)) {
            link.classList.add('active-link');
        }
    });
};

// --- 1B. API INTEGRATION ---
async function loadCustomerDashboard() {
    try {
        // Check if API is available
        if (typeof FingerPayAPI === 'undefined') {
            console.warn('FingerPayAPI is not defined. Skipping API calls.');
            return;
        }

        // Get customer profile
        const profileResponse = await FingerPayAPI.customer.getProfile();
        const customer = profileResponse.data;

        // Update greeting with actual name
        const greetEl = document.getElementById('greeting-msg');
        const hour = new Date().getHours();
        let greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
        if (greetEl) {
            greetEl.textContent = `${greeting}, ${customer.firstName}`;
        }

        // Update balance
        const balanceEl = document.getElementById('balanceValue');
        if (balanceEl) {
            balanceEl.textContent = `₦${(customer.balance || 0).toLocaleString()}`;
        }

        // Update vault balance
        const vaultEl = document.getElementById('vaultBalance');
        if (vaultEl) {
            vaultEl.textContent = `₦${(customer.vaultBalance || 0).toLocaleString()}`;
        }

        // --- FIX: Removed illegal optional chaining assignment (?.) ---
        const nameEl = document.getElementById('customerName');
        if (nameEl) nameEl.textContent = `${customer.firstName} ${customer.lastName}`;

        const emailEl = document.getElementById('customerEmail');
        if (emailEl) emailEl.textContent = customer.email || '';

        const phoneEl = document.getElementById('customerPhone');
        if (phoneEl) phoneEl.textContent = customer.phone || '';

        const fidEl = document.getElementById('customerFID');
        if (fidEl) fidEl.textContent = customer.fingerId || 'N/A';
        // -----------------------------------------------------------

        // Get transaction history
        const transactionsResponse = await FingerPayAPI.customer.getTransactions();
        if (transactionsResponse.data && transactionsResponse.data.length > 0) {
            updateTransactionHistory(transactionsResponse.data);
        }

        console.log('Customer dashboard loaded successfully');
    } catch (error) {
        console.error('Failed to load customer dashboard:', error);
        if (error.status === 401) {
            alert('Session expired. Please login again.');
            if (typeof FingerPayAPI !== 'undefined') FingerPayAPI.auth.logout();
            window.location.href = 'index.html';
        } else {
            console.log('Dashboard load error: ' + (error.message || 'Unknown error'));
        }
    }
}

function updateTransactionHistory(transactions) {
    const tableBody = document.querySelector('#transactionHistory tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    transactions.slice(0, 10).forEach(txn => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><small class="text-muted">${new Date(txn.createdAt).toLocaleDateString()}</small></td>
            <td><strong>${txn.type || 'Transaction'}</strong></td>
            <td><span class="badge ${txn.status === 'completed' ? 'bg-success' : txn.status === 'pending' ? 'bg-warning' : 'bg-danger'}">${txn.status}</span></td>
            <td class="text-end"><strong>₦${txn.amount.toLocaleString()}</strong></td>
        `;
        tableBody.appendChild(row);
    });
}

// Global Logout function
window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        if (typeof FingerPayAPI !== 'undefined') FingerPayAPI.auth.logout();
        window.location.href = 'index.html';
    }
};

// --- 2. GLOBAL UTILITIES (Helpers) ---
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        const toastEl = document.getElementById('liveToast');
        if (toastEl) new bootstrap.Toast(toastEl).show();
        else alert("Copied to clipboard!");
    }).catch(err => alert("Failed to copy text."));
};

window.saveConfig = (element) => {
    const originalBorder = element.style.borderColor;
    element.style.borderColor = '#198754';
    setTimeout(() => element.style.borderColor = originalBorder, 500);
};

// --- 3. DOM CONTENT LOADED (Runs when page is ready) ---
document.addEventListener('DOMContentLoaded', async () => {

    // Check authentication if API exists
    if (typeof FingerPayAPI !== 'undefined') {
        if (!FingerPayAPI.auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Check user type
        const userType = localStorage.getItem('userType');
        if (userType !== 'customer') {
            alert('Access denied. This dashboard is for customers only.');
            FingerPayAPI.auth.logout();
            window.location.href = 'index.html';
            return;
        }
        
        // Load customer data
        await loadCustomerDashboard();
    }

    // A. Greeting & Time
    const updateTime = () => {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

        const hour = now.getHours();
        let greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
        const greetEl = document.getElementById('greeting-msg');
        // Fallback static greeting if API hasn't loaded yet
        if (greetEl && greetEl.textContent === 'Hello, User') greetEl.textContent = `${greeting}, User`;
    };
    updateTime();

    // B. Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => sidebar.classList.toggle('toggled'));
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => sidebar.classList.toggle('toggled'));
    }

    // C. Balance Toggle
    const balanceEl = document.getElementById('balanceValue');
    const toggleIcon = document.getElementById('toggleBalance');
    if (balanceEl && toggleIcon) {
        let isHidden = false;
        let actualBalance = balanceEl.textContent; 
        
        // Observer to catch API updates to balance
        const observer = new MutationObserver(() => {
            if(!isHidden) actualBalance = balanceEl.textContent;
        });
        observer.observe(balanceEl, { childList: true });

        toggleIcon.addEventListener('click', () => {
            isHidden = !isHidden;
            if(isHidden) {
                actualBalance = balanceEl.textContent; // Store current before hiding
                balanceEl.textContent = '****';
            } else {
                balanceEl.textContent = actualBalance;
            }
            toggleIcon.classList.replace(isHidden ? 'fa-eye' : 'fa-eye-slash', isHidden ? 'fa-eye-slash' : 'fa-eye');
        });
    }

    // D. Chart.js Config (Safe check)
    const ctx = document.getElementById('spendingChart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Spend',
                    data: [15000, 22000, 5000, 8500, 12000, 45000, 18000],
                    borderColor: '#00C853',
                    backgroundColor: 'rgba(0, 200, 83, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    // E. FingerVault Logic (Withdrawal & Interest)
    const depositInput = document.getElementById('depositAmount');
    if (depositInput) {
        depositInput.addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            const interest = (amount * 0.12) / 12;
            const preview = document.getElementById('interestPreview');
            if(preview) preview.textContent = amount > 0 ? `+N${interest.toFixed(2)} (est. monthly)` : `+N0.00`;
        });
    }

    // F. Logout Logic
    const logoutBtn = document.getElementById('confirmLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }
});

// Vault Auth Logic (Global)
window.initiateVaultAuth = () => {
    const amountEl = document.getElementById('withdrawAmount');
    if (!amountEl || !amountEl.value) return alert("Please enter an amount.");
    const amount = amountEl.value;

    const step1 = document.getElementById('withdrawStep1');
    const step2 = document.getElementById('withdrawStep2');
    if(step1) step1.classList.add('d-none');
    if(step2) step2.classList.remove('d-none');

    const statusText = document.getElementById('scanStatusText');
    const scannerBox = document.querySelector('.bio-scanner-container');

    if(statusText) statusText.textContent = "Place Ring Finger on Sensor...";
    setTimeout(() => {
        if(statusText) {
            statusText.textContent = "Scanning Biometric ID...";
            statusText.classList.add('text-warning');
        }
    }, 1000);

    setTimeout(() => {
        if(scannerBox) scannerBox.classList.add('success');
        if(statusText) {
            statusText.innerHTML = '<i class="fas fa-check-circle me-1"></i> Match Confirmed';
            statusText.className = 'text-success fw-bold small';
        }

        setTimeout(() => {
            const modalEl = document.getElementById('vaultWithdrawModal');
            if(modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            alert(`Success! N${amount} moved to wallet.`);

            // Reset
            if(step1) step1.classList.remove('d-none');
            if(step2) step2.classList.add('d-none');
            if(scannerBox) scannerBox.classList.remove('success');
        }, 1500);
    }, 3000);
};

// ==========================================
// 4. FINCOACH AI LOGIC (Chatbot)
// ==========================================
let chatState = 'idle';
const chatHistory = document.getElementById('mainChatHistory');
const chatInput = document.getElementById('mainChatInput');

window.handleMainEnter = (e) => {
    if (e.key === 'Enter') sendMainChat();
};

window.sendMainChat = () => {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    chatInput.value = '';

    const typingId = showTyping();
    setTimeout(() => {
        removeTyping(typingId);
        processAiResponse(text.toLowerCase());
    }, 800);
};

// --- FIX: Check if modal exists before calling .show() ---
window.triggerAiCommand = (commandCode) => {
    let userText = "";
    if (commandCode === '1') userText = "Start Jargon Buster";
    else if (commandCode === '2') userText = "Sort my Salary";
    else if (commandCode === 'health') userText = "Plan Health Fund";
    else if (commandCode === 'story') userText = "Tell me a Finance Story";
    else if (commandCode === 'bill') userText = "Explain Medical Bill";
    else if (commandCode === 'sim') userText = "Simulate Savings";

    addChatMessage(userText, 'user');
    const typingId = showTyping();

    setTimeout(() => {
        removeTyping(typingId);
        if (commandCode === '1') processAiResponse('1');
        else if (commandCode === '2') processAiResponse('2');
        else if (commandCode === 'health') {
            const el = document.getElementById('healthPlanModal');
            if(el) new bootstrap.Modal(el).show();
        }
        else if (commandCode === 'story') tellStory();
        else if (commandCode === 'bill') explainBill();
        else if (commandCode === 'sim') {
            const el = document.getElementById('savingsSimModal');
            if(el) new bootstrap.Modal(el).show();
        }
    }, 600);
};

function processAiResponse(input) {
    let response = "";
    if (['hi', 'hello', 'hey', 'menu'].includes(input)) {
        response = `<strong>🤖 FinCoach Menu:</strong><br>Use buttons on left or type:<br>1️⃣ Jargon Buster<br>2️⃣ Salary Sorter<br>3️⃣ Impulse Control`;
        chatState = 'idle';
    } else if (input === '1' || input.includes('jargon')) {
        response = `<strong>🌐 Select Language:</strong><br>A. Yoruba 🦁<br>B. Hausa 🐎<br>C. Igbo 🦅<br>D. Pidgin 🇳🇬`;
        chatState = 'language';
    } else if (input === '2' || input.includes('salary')) {
        response = `<strong>💸 Salary Sorter:</strong><br>Inflow detected. <button class="btn btn-sm btn-success mt-2" onclick="const sm=document.getElementById('salaryModal'); if(sm) new bootstrap.Modal(sm).show()">Open Splitter</button>`;
    } else if (chatState === 'language') {
        if (input === 'a') response = "<strong>E ka aaro!</strong> (Yoruba Mode Active)";
        else if (input === 'b') response = "<strong>Sannu!</strong> (Hausa Mode Active)";
        else if (input === 'c') response = "<strong>Ndeewo!</strong> (Igbo Mode Active)";
        else if (input === 'd') response = "<strong>How far!</strong> (Pidgin Mode Active)";
        else response = "Type A, B, C or D.";
        chatState = 'idle';
    } else {
        response = "I didn't catch that. Try saying <strong>'Menu'</strong>.";
    }
    addChatMessage(response, 'bot');
}

// FinCoach Helpers
function tellStory() {
    const stories = ["<strong>📖 Tortoise & Interest:</strong><br>Tortoise saved N100 daily. Hare bought carrots. Tortoise is now rich. Be like Tortoise.", "<strong>📖 Market Secret:</strong><br>Mama Nkechi separated shop money from house money. She got a loan. Be wise."];
    addChatMessage(stories[Math.floor(Math.random() * stories.length)], 'bot');
}

function explainBill() {
    addChatMessage(`<strong>🩺 Bill Analysis:</strong><br>Consultation: N5,000<br>Drugs: N15,000<br>Total: N20,000. Use Health Fund?`, 'bot');
}

window.calculateHealthFund = () => {
    const expenses = document.getElementById('healthExpenses').value;
    const factor = document.getElementById('healthDependents').value;
    if (!expenses) return;
    const target = (expenses * 6) * factor;
    
    const modalEl = document.getElementById('healthPlanModal');
    if(modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    
    addChatMessage(`<strong>🚑 Target Fund:</strong><br><h3 class="text-danger">N${target.toLocaleString()}</h3>Save N${(target / 12).toLocaleString()}/mo.`, 'bot');
};

window.runSavingsSim = () => {
    const amount = document.getElementById('simAmount').value;
    const days = document.getElementById('simDuration').value;
    if (!amount) return;
    const total = amount * days;
    const interest = total * 0.10;
    
    const modalEl = document.getElementById('savingsSimModal');
    if(modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    
    addChatMessage(`<strong>📈 Projection:</strong><br>Saved: N${total.toLocaleString()}<br>Interest: N${interest.toLocaleString()}<br><strong>Total: N${(total + interest).toLocaleString()}</strong>`, 'bot');
};

function addChatMessage(html, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type} fade-in`;
    msgDiv.innerHTML = `<div class="message-content">${html}</div>`;
    if (chatHistory) {
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

function showTyping() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message bot';
    div.innerHTML = '<div class="message-content">...</div>';
    if (chatHistory) {
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

window.clearChat = () => {
    if (chatHistory) chatHistory.innerHTML = '';
    processAiResponse('hi');
};
