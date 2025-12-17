document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Toggle Physical vs Online Fields ---
    const radioPhysical = document.getElementById('typePhysical');
    const radioOnline = document.getElementById('typeOnline');
    
    const fieldShopPic = document.getElementById('field-shop-pic');
    const fieldOnlineLink = document.getElementById('field-online-link');

    function toggleFields() {
        if (radioPhysical.checked) {
            // Show Physical, Hide Online
            fieldShopPic.classList.remove('d-none');
            fieldOnlineLink.classList.add('d-none');
            
            // Set Requirement attributes (Optional for strict validation)
            fieldShopPic.querySelector('input').setAttribute('required', 'required');
            fieldOnlineLink.querySelector('input').removeAttribute('required');
        } else {
            // Show Online, Hide Physical
            fieldShopPic.classList.add('d-none');
            fieldOnlineLink.classList.remove('d-none');
            
            // Set Requirement attributes
            fieldShopPic.querySelector('input').removeAttribute('required');
            fieldOnlineLink.querySelector('input').setAttribute('required', 'required');
        }
    }

    // Event Listeners for Radios
    radioPhysical.addEventListener('change', toggleFields);
    radioOnline.addEventListener('change', toggleFields);

    // --- 2. Handle Form Submission ---
    const form = document.getElementById('merchantForm');
    const successModal = new bootstrap.Modal(document.getElementById('merchantSuccessModal'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate API call / processing
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;

        setTimeout(() => {
            // Show Success Modal
            successModal.show();
            
            // Reset button (in case they close modal and want to resubmit)
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            
            // Optional: form.reset();
        }, 1500);
    });

});