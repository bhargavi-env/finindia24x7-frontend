
// Local development: API runs on port 5000.
// Change this to your deployed backend URL after deployment.
const API_BASE_URL = 'http://localhost:5000';

const form = document.getElementById('leadForm');
const statusEl = document.getElementById('formStatus');
const submitButton = form.querySelector('button[type="submit"]');

// ------------------------------------
// 1. Toast Notification Function
// ------------------------------------

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast || !toastMessage || !toastIcon) {
    console.error('Toast HTML elements are missing.');
    return;
  }

  // Set notification message
  toastMessage.textContent = message;

  // Set success or error icon
  toastIcon.textContent = type === 'success' ? '✓' : '✕';

  // Apply notification type
  toast.className = `toast ${type} show`;

  // Clear previous timer
  clearTimeout(window.toastTimer);

  // Automatically hide after 4 seconds
  window.toastTimer = setTimeout(() => {
    hideToast();
  }, 4000);
}

// ------------------------------------
// 2. Hide Toast Function
// ------------------------------------

function hideToast() {
  const toast = document.getElementById('toast');

  if (toast) {
    toast.classList.remove('show');
  }
}

// ------------------------------------
// 3. Existing Website Functionality
// ------------------------------------

document.getElementById('year').textContent =
  new Date().getFullYear();

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});

document.querySelectorAll('#mainNav a').forEach(link =>
  link.addEventListener('click', () => {
    document.getElementById('mainNav').classList.remove('open');
  })
);

document.querySelectorAll('[data-product]').forEach(link =>
  link.addEventListener('click', () => {
    form.elements.productType.value = link.dataset.product;
  })
);

// ------------------------------------
// 4. Customer Enquiry Form Submission
// ------------------------------------

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  statusEl.textContent = '';
  statusEl.className = 'form-status';

  if (!form.reportValidity()) return;

  const data = new FormData(form);

  const payload = {
    fullName: data.get('fullName').trim(),
    phone: data.get('phone').trim(),
    email: data.get('email').trim(),
    productType: data.get('productType'),
    monthlyIncome: data.get('monthlyIncome'),
    city: data.get('city').trim(),
    message: data.get('message').trim(),
    consent: data.get('consent') === 'on'
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting…';

  try {
    const response = await fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Submission failed.');
    }

    // SUCCESS TOAST
    showToast(
      `${result.message} Reference: #${result.leadId}`,
      'success'
    );

    // Clear form after successful submission
    form.reset();

  } catch (error) {

    console.error('Enquiry submission error:', error);

    // ERROR TOAST
    showToast(
      error.message.includes('Failed to fetch')
        ? 'Could not reach the server. Please try again.'
        : error.message,
      'error'
    );

  } finally {

    // Enable submit button again
    submitButton.disabled = false;
    submitButton.innerHTML = 'Submit enquiry <span>→</span>';

  }
});
