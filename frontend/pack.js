 /**
 * ==========================================
 * MASTER JAVASCRIPT FILE
 * Includes: Navigation, Dashboard, Credit AI,
 * FinAgent, and FinCoach AI.
 * ==========================================
 */

// --- 1. GLOBAL NAVIGATION LOGIC (Must be at the top) ---
function showSection(sectionName) {
    // List of all possible sections (corrected IDs)
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
        setTimeout(() => targetElement.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-link');
        if(link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionName)) {
            link.classList.add('active-link');
        }
    });
}

// --- 1B. API INTEGRATION ---
async function loadCustomerDashboard() {
    try {
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

        // Update profile information
        document.getElementById('customerName')?.textContent = `${customer.firstName} ${customer.lastName}`;
        document.getElementById('customerEmail')?.textContent = customer.email || '';
        document.getElementById('customerPhone')?.textContent = customer.phone || '';
        document.getElementById('customerFID')?.textContent = customer.fingerId || 'N/A';

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
            FingerPayAPI.auth.logout();
            window.location.href = 'index.html';
        } else {
            alert('Failed to load dashboard data: ' + (error.message || 'Please try again'));
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

// Logout function
window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        FingerPayAPI.auth.logout();
        window.location.href = 'index.html';
    }
};

// --- 2. GLOBAL UTILITIES (Helpers) ---
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        // Simple alert fallback if toast doesn't exist
        const toastEl = document.getElementById('liveToast');
        if(toastEl) new bootstrap.Toast(toastEl).show();
        else alert("Copied to clipboard!");
    });
};

window.saveConfig = (element) => {
    const originalBorder = element.style.borderColor;
    element.style.borderColor = '#198754';
    setTimeout(() => element.style.borderColor = originalBorder, 500);
};

// --- 3. DOM CONTENT LOADED (Runs when page is ready) ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // Check authentication
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

    // Load customer data from API
    await loadCustomerDashboard();
    
    // A. Greeting & Time
    const updateTime = () => {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        if(dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        
        const hour = now.getHours();
        let greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
        const greetEl = document.getElementById('greeting-msg');
        if(greetEl) greetEl.textContent = `${greeting}, Jane`;
    };
    updateTime();

    // B. Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    if(sidebar) {
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => sidebar.classList.toggle('toggled'));
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => sidebar.classList.toggle('toggled'));
    }

    // C. Balance Toggle
    const balanceEl = document.getElementById('balanceValue');
    const toggleIcon = document.getElementById('toggleBalance');
    if(balanceEl && toggleIcon) {
        const actualBalance = balanceEl.textContent;
        let isHidden = false;
        toggleIcon.addEventListener('click', () => {
            isHidden = !isHidden;
            balanceEl.textContent = isHidden ? '****' : actualBalance;
            toggleIcon.classList.replace(isHidden ? 'fa-eye' : 'fa-eye-slash', isHidden ? 'fa-eye-slash' : 'fa-eye');
        });
    }

    // D. Chart.js Config
    const ctx = document.getElementById('spendingChart');
    if (ctx) {
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
            document.getElementById('interestPreview').textContent = amount > 0 ? `+N${interest.toFixed(2)} (est. monthly)` : `+N0.00`;
        });
    }

    window.initiateVaultAuth = () => {
        const amount = document.getElementById('withdrawAmount').value;
        if (!amount) return alert("Please enter an amount.");

        document.getElementById('withdrawStep1').classList.add('d-none');
        document.getElementById('withdrawStep2').classList.remove('d-none');
        
        const statusText = document.getElementById('scanStatusText');
        const scannerBox = document.querySelector('.bio-scanner-container');

        statusText.textContent = "Place Ring Finger on Sensor...";
        setTimeout(() => {
            statusText.textContent = "Scanning Biometric ID...";
            statusText.classList.add('text-warning');
        }, 1000);

        setTimeout(() => {
            scannerBox?.classList.add('success');
            statusText.innerHTML = '<i class="fas fa-check-circle me-1"></i> Match Confirmed';
            statusText.className = 'text-success fw-bold small';
            
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('vaultWithdrawModal'));
                if(modal) modal.hide();
                alert(`Success! N${amount} moved to wallet.`); // Simplified success for brevity
                
                // Reset
                document.getElementById('withdrawStep1').classList.remove('d-none');
                document.getElementById('withdrawStep2').classList.add('d-none');
                scannerBox?.classList.remove('success');
            }, 1500);
        }, 3000);
    };

    // F. Logout Logic
    const logoutBtn = document.getElementById('confirmLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }
});

// ==========================================
// 4. FINCOACH AI LOGIC (Chatbot)
// ==========================================
let chatState = 'idle'; 
const chatHistory = document.getElementById('mainChatHistory');
const chatInput = document.getElementById('mainChatInput');

function handleMainEnter(e) {
    if (e.key === 'Enter') sendMainChat();
}

function sendMainChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    chatInput.value = '';

    const typingId = showTyping();
    setTimeout(() => {
        removeTyping(typingId);
        processAiResponse(text.toLowerCase());
    }, 800);
}

function triggerAiCommand(commandCode) {
    let userText = "";
    if(commandCode === '1') userText = "Start Jargon Buster";
    else if(commandCode === '2') userText = "Sort my Salary";
    else if(commandCode === 'health') userText = "Plan Health Fund";
    else if(commandCode === 'story') userText = "Tell me a Finance Story";
    else if(commandCode === 'bill') userText = "Explain Medical Bill";
    else if(commandCode === 'sim') userText = "Simulate Savings";

    addChatMessage(userText, 'user');
    const typingId = showTyping();

    setTimeout(() => {
        removeTyping(typingId);
        if(commandCode === '1') processAiResponse('1');
        else if(commandCode === '2') processAiResponse('2');
        else if(commandCode === 'health') new bootstrap.Modal(document.getElementById('healthPlanModal')).show();
        else if(commandCode === 'story') tellStory();
        else if(commandCode === 'bill') explainBill();
        else if(commandCode === 'sim') new bootstrap.Modal(document.getElementById('savingsSimModal')).show();
    }, 600);
}

function processAiResponse(input) {
    let response = "";
    if (['hi', 'hello', 'hey', 'menu'].includes(input)) {
        response = `<strong>🤖 FinCoach Menu:</strong><br>Use buttons on left or type:<br>1️⃣ Jargon Buster<br>2️⃣ Salary Sorter<br>3️⃣ Impulse Control`;
        chatState = 'idle';
    } 
    else if (input === '1' || input.includes('jargon')) {
        response = `<strong>🌐 Select Language:</strong><br>A. Yoruba 🦁<br>B. Hausa 🐎<br>C. Igbo 🦅<br>D. Pidgin 🇳🇬`;
        chatState = 'language';
    } 
    else if (input === '2' || input.includes('salary')) {
        response = `<strong>💸 Salary Sorter:</strong><br>Inflow detected. <button class="btn btn-sm btn-success mt-2" onclick="new bootstrap.Modal(document.getElementById('salaryModal')).show()">Open Splitter</button>`;
    }
    else if (chatState === 'language') {
        if (input === 'a') response = "<strong>E ka aaro!</strong> (Yoruba Mode Active)";
        else if (input === 'b') response = "<strong>Sannu!</strong> (Hausa Mode Active)";
        else if (input === 'c') response = "<strong>Ndeewo!</strong> (Igbo Mode Active)";
        else if (input === 'd') response = "<strong>How far!</strong> (Pidgin Mode Active)";
        else response = "Type A, B, C or D.";
        chatState = 'idle';
    }
    else {
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

function calculateHealthFund() {
    const expenses = document.getElementById('healthExpenses').value;
    const factor = document.getElementById('healthDependents').value;
    if(!expenses) return;
    const target = (expenses * 6) * factor;
    bootstrap.Modal.getInstance(document.getElementById('healthPlanModal')).hide();
    addChatMessage(`<strong>🚑 Target Fund:</strong><br><h3 class="text-danger">N${target.toLocaleString()}</h3>Save N${(target/12).toLocaleString()}/mo.`, 'bot');
}

function runSavingsSim() {
    const amount = document.getElementById('simAmount').value;
    const days = document.getElementById('simDuration').value;
    if(!amount) return;
    const total = amount * days;
    const interest = total * 0.10;
    bootstrap.Modal.getInstance(document.getElementById('savingsSimModal')).hide();
    addChatMessage(`<strong>📈 Projection:</strong><br>Saved: N${total.toLocaleString()}<br>Interest: N${interest.toLocaleString()}<br><strong>Total: N${(total+interest).toLocaleString()}</strong>`, 'bot');
}

function addChatMessage(html, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type} fade-in`;
    msgDiv.innerHTML = `<div class="message-content">${html}</div>`;
    if(chatHistory) {
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

function showTyping() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message bot';
    div.innerHTML = '<div class="message-content">...</div>'; // Simplified dots
    if(chatHistory) {
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}

function clearChat() {
    if(chatHistory) chatHistory.innerHTML = '';
    processAiResponse('hi');
}

function executeAiAction(msg) {
    document.querySelectorAll('.modal.show').forEach(m => bootstrap.Modal.getInstance(m).hide());
    addChatMessage(`✅ ${msg}`, 'bot');
}

// ==========================================
// 5. CREDIT AI & FINAGENT AI LOGIC
// ==========================================

// Credit AI
function simulateGenerateCreditProfile() {
    document.getElementById('aiInitialState').classList.add('d-none');
    document.getElementById('aiLoadingState').classList.remove('d-none');
    setTimeout(() => {
        document.getElementById('aiLoadingState').classList.add('d-none');
        document.getElementById('aiResultState').classList.remove('d-none');
        document.getElementById('aiResultState').classList.add('fade-in');
    }, 3000);
}

function selectLoan(amt) {
    document.getElementById('loanPrincipal').textContent = 'N' + amt;
    new bootstrap.Modal(document.getElementById('loanModal')).show();
}

function initiateLoanBiometrics() {
    document.getElementById('loanStep1').classList.add('d-none');
    document.getElementById('loanStep2').classList.remove('d-none');
    setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('loanModal')).hide();
        alert("Loan Disbursed!");
    }, 3000);
}

function runAdvancedSimulation() {
    document.getElementById('simulationResult').classList.remove('d-none');
    document.getElementById('simText').textContent = "Based on new stock, profit will rise by 15%.";
}

// FinAgent AI
function summarizeDay() {
    new bootstrap.Modal(document.getElementById('summaryModal')).show();
}

function requestFloatFromSummary() {
    bootstrap.Modal.getInstance(document.getElementById('summaryModal')).hide();
    new bootstrap.Modal(document.getElementById('requestFloatModal')).show();
}

function handleFloatRequest(e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('requestFloatModal')).hide();
    alert("Float Request Sent!");
}

function optimizeRoute() {
    const list = document.getElementById('routeList');
    list.innerHTML = "Calculating...";
    setTimeout(() => {
        list.innerHTML = `<div class='list-group-item'>1. Market A (15 mins) <span class='badge bg-success'>Best</span></div>`;
    }, 1000);
}

function generateIncidentReport() {
    document.getElementById('incidentForm').classList.add('d-none');
    document.getElementById('ticketResult').classList.remove('d-none');
    document.getElementById('ticketText').textContent = "TICKET #99201: Printer Fault";

}
// --- CUSTOMER AI (FinCoach) ---
function processAiResponse(text) {
    // This looks at the ACTUAL balance showing on your pack.html page
    const currentBalance = document.getElementById('balanceValue').innerText;
    let response = "";

    if (text.toLowerCase().includes("balance") || text.toLowerCase().includes("money")) {
        response = `Your current balance is ${currentBalance}. FinCoach says: You are doing well, but try not to spend more than N2,000 today to stay on track!`;
    } 
    else if (text.toLowerCase().includes("vault") || text.toLowerCase().includes("save")) {
        response = "Your Ring-Finger Vault is currently locked. Would you like me to calculate how much more you need to reach your 1-Million Naira goal?";
    } 
    else {
        response = "I'm your FinCoach! You can ask me about your spending, how the Vault works, or to explain banking 'jargon' in Pidgin.";
    }

    addChatMessage(response, 'ai');
}

// ==========================================
// 6. FLOATING CHAT WINDOW (FINCOACH BUBBLE)
// ==========================================
function toggleChatWindow() {
    const chatWindow = document.getElementById('floatingChat');
    if (chatWindow) {
        chatWindow.classList.toggle('d-none');
        // Auto-focus on input when opening
        if (!chatWindow.classList.contains('d-none')) {
            const input = document.getElementById('coachInput');
            if (input) input.focus();
        }
    }
}

function sendCoachMessage() {
    const input = document.getElementById('coachInput');
    const messagesContainer = document.getElementById('coachMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'text-end mb-2';
    userMsg.innerHTML = `<span class="badge bg-primary">${message}</span>`;
    messagesContainer.appendChild(userMsg);

    // Clear input
    input.value = '';

    // Show typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'text-start mb-2 typing-indicator';
    typingMsg.innerHTML = `<span class="badge bg-secondary">FinCoach is typing...</span>`;
    messagesContainer.appendChild(typingMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
        typingMsg.remove();
        const aiMsg = document.createElement('div');
        aiMsg.className = 'text-start mb-2';
        aiMsg.innerHTML = `<span class="badge bg-success">Great question! Let me help you with that. Your spending looks good this week!</span>`;
        messagesContainer.appendChild(aiMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
}

// ==========================================
// 7. UTILITY FUNCTIONS
// ==========================================
function copyFID() {
    const fidElement = document.getElementById('customerFID');
    if (!fidElement) return;
    
    const fid = fidElement.textContent;
    navigator.clipboard.writeText(fid).then(() => {
        alert('FID copied to clipboard: ' + fid);
    }).catch(() => {
        alert('Failed to copy FID');
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
    }).catch(() => {
        alert('Failed to copy');
    });
}

function generateReceipt(name, amount, date) {
    alert(`Receipt Generated!\n\nPaid to: ${name}\nAmount: ₦${amount}\nDate: ${date}\n\nDownloading...`);
    // In production, this would generate a PDF or open a receipt page
}

function simulateAiAction(msg) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) modalInstance.hide();
    });
    
    setTimeout(() => {
        alert(msg);
    }, 300);
}

function switchTab(tabName, event) {
    if (event) event.preventDefault();
    
    // Remove active class from all tabs
    document.querySelectorAll('.list-group-item-action').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Hide all tab contents
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('d-none');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.remove('d-none');
    }
}
