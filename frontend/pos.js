// POS OPERATING SYSTEM SIMULATION

// --- VARIABLES ---
let currentAmount = "";
let transactionType = "Purchase";
let audioBeep = document.getElementById('beepKey');
let audioSuccess = document.getElementById('beepSuccess');
let audioPrint = document.getElementById('printSound');

// --- NAVIGATION ---
function navigate(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    // Show target
    document.getElementById(viewId).classList.add('active');
    playSound(audioBeep);
}

// --- CLOCK ---
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}, 1000);

// --- UNLOCK / POWER ---
function unlockTerminal() {
    navigate('viewHome');
}
function lockTerminal() {
    navigate('viewLock');
}

// --- KEYPAD LOGIC ---
function startTransaction(type) {
    transactionType = type;
    document.getElementById('transTypeTitle').innerText = type;
    currentAmount = "";
    updateAmountDisplay();
    navigate('viewKeypad');
}

function addNum(num) {
    if (currentAmount.length < 9) {
        currentAmount += num;
        updateAmountDisplay();
        playSound(audioBeep);
    }
}

function clearNum() {
    currentAmount = "";
    updateAmountDisplay();
    playSound(audioBeep);
}

function updateAmountDisplay() {
    // Format with commas
    let val = parseFloat(currentAmount) || 0;
    document.getElementById('amountText').innerText = val.toLocaleString("en-US", {minimumFractionDigits: 2});
}

// --- PROCESSING FLOW ---
function proceedToScan() {
    if(currentAmount === "" || parseFloat(currentAmount) === 0) return;
    navigate('viewScan');
    
    // Simulate Hardware Light Up
    const sensor = document.getElementById('physicalSensor');
    sensor.classList.add('active');
    
    // Wait for physical click on sensor (User interaction)
    document.getElementById('scanInstruction').innerText = "Tap Sensor Below";
}

// Triggered when user clicks the PHYSICAL sensor div
function triggerSensorAction() {
    const currentView = document.querySelector('.view.active').id;
    
    if (currentView === 'viewScan') {
        // Stop sensor glow
        document.getElementById('physicalSensor').classList.remove('active');
        document.getElementById('scanInstruction').innerText = "Processing...";
        document.getElementById('scanIcon').classList.add('text-success');
        
        // Simulate Network Delay
        setTimeout(() => {
            navigate('viewSuccess');
            playSound(audioSuccess);
        }, 2000);
    } 
    else if (currentView === 'viewRegister') {
        // Handle Reg Step 3 capture (Implemented in Reg logic)
        captureFingerprint();
    }
}

// --- RECEIPT PRINTING ---
function printReceiptAnim() {
    playSound(audioPrint);
    
    // Update Receipt Data
    document.querySelector('.r-total').innerText = "N" + parseFloat(currentAmount).toLocaleString();
    
    // Slide Animation
    const receipt = document.getElementById('paperReceipt');
    receipt.style.top = "-250px"; // Slide UP out of printer slot
    
    setTimeout(() => {
        // Reset after animation
        setTimeout(() => {
            receipt.style.transition = 'none';
            receipt.style.top = "30px"; // Back inside
            setTimeout(() => receipt.style.transition = 'top 2s ease-out', 100);
        }, 3000);
        
        navigate('viewHome');
    }, 2500);
}

// --- REGISTRATION WIZARD ---
function openRegisterMenu() {
    navigate('viewRegister');
    showRegStep(1);
}

function showRegStep(step) {
    document.querySelectorAll('.reg-step').forEach(el => el.classList.remove('active'));
    document.getElementById('regStep' + step).classList.add('active');
}

function nextRegStep(step) {
    showRegStep(step);
    playSound(audioBeep);
}

function capturePhoto() {
    const viewFinder = document.querySelector('.camera-viewfinder');
    viewFinder.innerHTML = '<i class="bi bi-check-circle-fill text-success display-1"></i><p>Photo Taken</p>';
    setTimeout(() => {
        nextRegStep(3);
    }, 1000);
}

function completeRegistration() {
    // Light up sensor for capture
    document.getElementById('physicalSensor').classList.add('active');
    document.querySelector('.finger-guide p').innerText = "Tap Sensor Now...";
}

function captureFingerprint() {
    const bar = document.getElementById('regProgress');
    let width = 0;
    const interval = setInterval(() => {
        width += 5;
        bar.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            document.getElementById('physicalSensor').classList.remove('active');
            alert("Registration Complete! FID Generated.");
            navigate('viewHome');
        }
    }, 50);
}

// --- UTILITIES ---
function openUtilities() {
    alert("Opens Data/Airtime Menu (Demo)");
}

function checkBalance() {
    alert("Wallet Balance: N450,200.00");
}

function showHistory() {
    alert("Shows last 10 Transactions");
}

function playSound(audioEl) {
    audioEl.currentTime = 0;
    audioEl.play().catch(e => console.log("Audio play blocked"));
}