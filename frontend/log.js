// --- Navigation & Tabs ---
function showForm(form) {
  document
    .querySelectorAll(".auth-form")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((el) => el.classList.remove("active"));

  if (form === "login") {
    document.getElementById("login-form").classList.add("active");
    document.querySelector(".tab:nth-child(1)").classList.add("active");
  } else {
    document.getElementById("register-form").classList.add("active");
    document.querySelector(".tab:nth-child(2)").classList.add("active");
  }
}

function goBack() {
  window.location.href = "index.html"; // Adjust if necessary
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
    icon.classList.replace("bi-eye-slash", "bi-eye");
    icon.style.color = "var(--color-secondary)";
  } else {
    input.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
    icon.style.color = "";
  }
}

// 2. Password Strength Meter
function checkStrength(password) {
  const bar = document.getElementById("strength-bar");
  const text = document.getElementById("strength-text");
  let strength = 0;

  if (password.length > 5) strength += 1; // Length
  if (password.match(/[A-Z]/)) strength += 1; // Capital
  if (password.match(/[0-9]/)) strength += 1; // Number
  if (password.match(/[^a-zA-Z0-9]/)) strength += 1; // Symbol

  switch (strength) {
    case 0:
      bar.style.width = "0%";
      text.innerHTML = "";
      break;
    case 1:
      bar.style.width = "25%";
      bar.style.backgroundColor = "red";
      text.innerHTML = "Weak";
      break;
    case 2:
      bar.style.width = "50%";
      bar.style.backgroundColor = "orange";
      text.innerHTML = "Fair";
      break;
    case 3:
      bar.style.width = "75%";
      bar.style.backgroundColor = "#FFD700";
      text.innerHTML = "Good";
      break;
    case 4:
      bar.style.width = "100%";
      bar.style.backgroundColor = "#00C853";
      text.innerHTML = "Strong";
      break;
  }
}

// 3. OTP Generator with Toast
let otpTimerInterval;

function generateOTP() {
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const toast = document.getElementById("toast");

  // Show Toast
  toast.textContent = `Your OTP is: ${otpCode}`;
  toast.className = "toast show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 4000);

  // Auto-fill for UX (optional, but good for demo)
  document.getElementById("otp-input").value = otpCode;

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

// 4. Biometric Login Simulation (Updated with Fix)
function fingerprintLogin() {
  const overlay = document.getElementById("fingerprint-scan");
  const icon = overlay.querySelector(".scan-icon");
  const text = overlay.querySelector(".scan-text");

  overlay.style.display = "flex";
  text.textContent = "Place finger on sensor...";

  setTimeout(() => {
    text.textContent = "Scanning...";
    icon.style.color = "var(--color-primary)";
  }, 1000);

  setTimeout(() => {
    text.textContent = "Verifying...";
  }, 2500);

  setTimeout(() => {
    overlay.style.display = "none";

    // --- FIX: SAVE SESSION DATA ---
    // We must save this so pack.html knows you are logged in
    
    // 1. Save Fake Token
    if (typeof FingerPayAPI !== 'undefined' && FingerPayAPI.auth) {
        FingerPayAPI.auth.setToken("bio-simulation-token-12345", true);
    } else {
        localStorage.setItem("authToken", "bio-simulation-token-12345");
    }

    // 2. Save User Details (Defaulting to customer/pack.html access)
    localStorage.setItem("userType", "customer");
    localStorage.setItem("userId", "bio-user-01"); 
    localStorage.setItem("userName", "Biometric User");

    showSuccess("Login Successful", "Identity verified via fingerprint.");
  }, 3500);
}

// --- Success Handling ---
function showSuccess(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-msg").textContent = message;
  document.getElementById("success-modal").style.display = "flex";
}

// --- API Integration ---

// Helper function to show loading state
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "Processing...";
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

// Helper function to show error
function showError(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show error";
  toast.style.backgroundColor = "#dc3545";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
    toast.style.backgroundColor = "";
  }, 4000);
}

// Determine user type based on current page or form context
function getUserType() {
  // Check if we're on agent, merchant, or customer login
  const url = window.location.pathname;
  if (url.includes("agent")) return "agent";
  if (url.includes("merchant")) return "merchant";
  return "customer"; // default
}

// Form Listeners
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const formData = new FormData(e.target);
    const userType = getUserType();
    const credentials = {
      email: formData.get("email") || formData.get("username"),
      password: formData.get("password"),
    };

    // Add phone if it exists
    if (formData.get("phone")) {
      credentials.phone = formData.get("phone");
    }

    let response;
    // Call appropriate API based on user type
    if (userType === "agent") {
      response = await FingerPayAPI.agent.login(credentials);
    } else if (userType === "merchant") {
      response = await FingerPayAPI.merchant.login(credentials);
    } else {
      response = await FingerPayAPI.customer.login(credentials);
    }

    // Store auth token and user info
    FingerPayAPI.auth.setToken(response.token, true);
    localStorage.setItem("userType", userType);
    localStorage.setItem("userId", response.user?.id || response.data?.id);
    localStorage.setItem(
      "userName",
      response.user?.name || response.data?.name
    );

    showSuccess(
      "Welcome Back",
      `You have logged in successfully as ${userType}.`
    );

    // Redirect based on user type after 2 seconds
    setTimeout(() => {
      if (userType === "agent") {
        window.location.href = "agentDB.html";
      } else if (userType === "merchant") {
        window.location.href = "merchantDB.html";
      } else {
        window.location.href = "pack.html";
      }
    }, 2000);
  } catch (error) {
    console.error("Login error:", error);
    showError(error.message || "Login failed. Please check your credentials.");
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    try {
      const formData = new FormData(e.target);
      const userType = getUserType();
      
      // Validate full name (must have at least 2 words)
      const fullName = formData.get("name") || formData.get("fullname");
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        showError("Please enter your full name (first name and last name)");
        setButtonLoading(submitBtn, false);
        return;
      }
      
      // Split name into first and last name
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" "); // Join remaining parts as last name
      
      const registrationData = {
        firstName: firstName,
        lastName: lastName,
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
      };

      // Add additional fields based on form
      if (formData.get("businessName")) {
        registrationData.businessName = formData.get("businessName");
      }
      if (formData.get("address")) {
        registrationData.address = formData.get("address");
      }
      if (formData.get("location")) {
        registrationData.location = formData.get("location");
      }

      let response;
      // Call appropriate API based on user type
      if (userType === "agent") {
        response = await FingerPayAPI.agent.register(registrationData);
      } else if (userType === "merchant") {
        response = await FingerPayAPI.merchant.register(registrationData);
      } else {
        response = await FingerPayAPI.customer.register(registrationData);
      }

      // Auto-login after registration
      if (response.token) {
        FingerPayAPI.auth.setToken(response.token, true);
        localStorage.setItem("userType", userType);
        localStorage.setItem("userId", response.user?.id || response.data?.id);
      }

      showSuccess(
        "Account Created",
        "Your registration is complete. Redirecting..."
      );

      // Redirect based on user type after 2 seconds
      setTimeout(() => {
        if (userType === "agent") {
          window.location.href = "agentDB.html";
        } else if (userType === "merchant") {
          window.location.href = "merchantDB.html";
        } else {
          window.location.href = "pack.html";
        }
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      showError(error.message || "Registration failed. Please try again.");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
