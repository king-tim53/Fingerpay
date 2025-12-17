// --- Navigation & Tabs ---
function showForm(form) {
    document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

    if (form === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelector('.tab:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
        document.querySelector('.tab:nth-child(2)').classList.add('active');
    }
}

function goBack() {
    window.location.href = "index2.html"; // Adjust if necessary
}

function redirectToPow() {
    window.location.href = "pack.html";
}

// --- UX Features ---

// 1. Password Visibility Toggle
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('bi-eye-slash', 'bi-eye');
        icon.style.color = 'var(--color-secondary)';
    } else {
        input.type = "password";
        icon.classList.replace('bi-eye', 'bi-eye-slash');
        icon.style.color = '';
    }
}

// 2. Password Strength Meter
function checkStrength(password) {
    const bar = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');
    let strength = 0;

    if (password.length > 5) strength += 1; // Length
    if (password.match(/[A-Z]/)) strength += 1; // Capital
    if (password.match(/[0-9]/)) strength += 1; // Number
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1; // Symbol

    switch (strength) {
        case 0: bar.style.width = '0%'; text.innerHTML = ''; break;
        case 1: bar.style.width = '25%'; bar.style.backgroundColor = 'red'; text.innerHTML = 'Weak'; break;
        case 2: bar.style.width = '50%'; bar.style.backgroundColor = 'orange'; text.innerHTML = 'Fair'; break;
        case 3: bar.style.width = '75%'; bar.style.backgroundColor = '#FFD700'; text.innerHTML = 'Good'; break;
        case 4: bar.style.width = '100%'; bar.style.backgroundColor = '#00C853'; text.innerHTML = 'Strong'; break;
    }
}

// 3. OTP Generator with Toast
let otpTimerInterval;

function generateOTP() {
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const toast = document.getElementById('toast');
    
    // Show Toast
    toast.textContent = `Your OTP is: ${otpCode}`;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 4000);

    // Auto-fill for UX (optional, but good for demo)
    document.getElementById('otp-input').value = otpCode;

    // Start Timer inside the form
    const timerDisplay = document.getElementById("otp-timer");
    let timeLeft = 60;
    
    clearInterval(otpTimerInterval);
    otpTimerInterval = setInterval(() => {
        timerDisplay.textContent = `Expires in ${timeLeft}s`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(otpTimerInterval);
            timerDisplay.textContent = "Code expired";
            timerDisplay.style.color = "red";
        } else {
            timerDisplay.style.color = "var(--color-muted)";
        }
    }, 1000);
}

// 4. Biometric Login Simulation
function fingerprintLogin() {
    const overlay = document.getElementById('fingerprint-scan');
    const icon = overlay.querySelector('.scan-icon');
    const text = overlay.querySelector('.scan-text');

    overlay.style.display = 'flex';
    text.textContent = "Place finger on sensor...";
    
    setTimeout(() => {
        text.textContent = "Scanning...";
        icon.style.color = "var(--color-primary)";
    }, 1000);

    setTimeout(() => {
        text.textContent = "Verifying...";
    }, 2500);

    setTimeout(() => {
        overlay.style.display = 'none';
        showSuccess('Login Successful', 'Identity verified via fingerprint.');
    }, 3500);
}

// --- Success Handling ---
function showSuccess(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-msg').textContent = message;
    document.getElementById('success-modal').style.display = 'flex';
}

// Form Listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccess('Welcome Back', 'You have logged in successfully.');
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccess('Account Created', 'Your registration is complete.');
});