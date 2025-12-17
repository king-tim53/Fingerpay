// Agent Registration with API Integration

// Helper function to show loading state
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || "Submit Application";
    button.disabled = false;
  }
}

// Helper function to show error
function showError(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-danger alert-dismissible fade show";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  const form = document.getElementById("agentForm");
  form.insertBefore(alertDiv, form.firstChild);

  // Scroll to top of form
  form.scrollIntoView({ behavior: "smooth", block: "start" });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Form submission handler
document
  .getElementById("agentForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    try {
      // Get form data
      const formData = new FormData(this);

      // Validate full name (must have at least 2 words)
      const fullName = formData.get("fullName");
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        showError("Please enter your full name (first name and last name)");
        setButtonLoading(submitBtn, false);
        return;
      }

      // Split name into first and last name
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" "); // Join remaining parts as last name

      // Prepare agent registration data
      const agentData = {
        firstName: firstName,
        lastName: lastName,
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        address: formData.get("address"),
        location: {
          state: formData.get("state"),
          lga: formData.get("lga"),
          address: formData.get("address"),
        },
        idType: formData.get("idType"),
        idNumber: formData.get("idNumber"),
        bvn: formData.get("bvn"),
        businessName: formData.get("businessName") || undefined,
      };

      // Call agent registration API
      const response = await FingerPayAPI.agent.register(agentData);

      // Store auth token if provided
      if (response.token) {
        FingerPayAPI.auth.setToken(response.token, true);
        localStorage.setItem("userType", "agent");
        localStorage.setItem("userId", response.agent?.id || response.data?.id);
        localStorage.setItem(
          "userName",
          response.agent?.name || response.data?.name
        );
      }

      // Show success modal
      const modal = new bootstrap.Modal(
        document.getElementById("agentSuccessModal")
      );
      modal.show();

      // Redirect to agent dashboard after modal is closed
      document.getElementById("agentSuccessModal").addEventListener(
        "hidden.bs.modal",
        function () {
          window.location.href = "agentDB.html";
        },
        { once: true }
      );
    } catch (error) {
      console.error("Agent registration error:", error);
      showError(
        error.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
