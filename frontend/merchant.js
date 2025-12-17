document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Toggle Physical vs Online Fields ---
  const radioPhysical = document.getElementById("typePhysical");
  const radioOnline = document.getElementById("typeOnline");

  const fieldShopPic = document.getElementById("field-shop-pic");
  const fieldOnlineLink = document.getElementById("field-online-link");

  function toggleFields() {
    if (radioPhysical.checked) {
      // Show Physical, Hide Online
      fieldShopPic.classList.remove("d-none");
      fieldOnlineLink.classList.add("d-none");

      // Set Requirement attributes (Optional for strict validation)
      fieldShopPic.querySelector("input").setAttribute("required", "required");
      fieldOnlineLink.querySelector("input").removeAttribute("required");
    } else {
      // Show Online, Hide Physical
      fieldShopPic.classList.add("d-none");
      fieldOnlineLink.classList.remove("d-none");

      // Set Requirement attributes
      fieldShopPic.querySelector("input").removeAttribute("required");
      fieldOnlineLink
        .querySelector("input")
        .setAttribute("required", "required");
    }
  }

  // Event Listeners for Radios
  radioPhysical.addEventListener("change", toggleFields);
  radioOnline.addEventListener("change", toggleFields);

  // --- 2. Handle Form Submission with API Integration ---
  const form = document.getElementById("merchantForm");
  const successModal = new bootstrap.Modal(
    document.getElementById("merchantSuccessModal")
  );

  // Helper function to show error
  function showError(message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-danger alert-dismissible fade show";
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    form.insertBefore(alertDiv, form.firstChild);
    form.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    submitBtn.disabled = true;

    try {
      // Get form data
      const formData = new FormData(form);

      // Prepare merchant registration data
      const merchantData = {
        name: formData.get("businessName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        businessName: formData.get("businessName"),
        businessType: formData.get("businessType"),
        address: formData.get("address"),
        location: {
          state: formData.get("state"),
          lga: formData.get("lga") || formData.get("city"),
          address: formData.get("address"),
        },
        idType: formData.get("idType"),
        idNumber: formData.get("idNumber"),
        cacNumber: formData.get("cacNumber") || undefined,
      };

      // Add business type specific fields
      if (radioPhysical.checked) {
        merchantData.shopPhoto = formData.get("shopPhoto") || undefined;
      } else {
        merchantData.onlineLink = formData.get("onlineLink") || undefined;
      }

      // Call merchant registration API
      const response = await FingerPayAPI.merchant.register(merchantData);

      // Store auth token if provided
      if (response.token) {
        FingerPayAPI.auth.setToken(response.token, true);
        localStorage.setItem("userType", "merchant");
        localStorage.setItem(
          "userId",
          response.merchant?.id || response.data?.id
        );
        localStorage.setItem(
          "userName",
          response.merchant?.name || response.data?.name
        );
      }

      // Show Success Modal
      successModal.show();

      // Redirect to merchant dashboard after modal is closed
      document.getElementById("merchantSuccessModal").addEventListener(
        "hidden.bs.modal",
        function () {
          window.location.href = "merchantDB.html";
        },
        { once: true }
      );
    } catch (error) {
      console.error("Merchant registration error:", error);
      showError(
        error.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      // Reset button
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });
});
