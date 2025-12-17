 

  // Simple script to handle form submission simulation
  document.getElementById('agentForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const modal = new bootstrap.Modal(document.getElementById('agentSuccessModal'));
      modal.show();
  });
