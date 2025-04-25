// DOM Elements
const registerForm = document.getElementById('register-form');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');
const termsCheckbox = document.getElementById('terms');
const googleBtn = document.querySelector('.google-btn');
const facebookBtn = document.querySelector('.facebook-btn');
const strengthProgress = document.querySelector('.strength-progress');
const strengthText = document.querySelector('.strength-text span');

// Password visibility toggle
togglePasswordBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'far fa-eye';
    }
  });
});

// Password strength checker
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const strength = checkPasswordStrength(password);
  
  // Update strength bar
  strengthProgress.style.width = `${strength.score * 25}%`;
  
  // Update color based on strength
  if (strength.score === 0) {
    strengthProgress.style.backgroundColor = '#e74c3c';
    strengthText.textContent = 'Weak';
  } else if (strength.score === 1) {
    strengthProgress.style.backgroundColor = '#f39c12';
    strengthText.textContent = 'Fair';
  } else if (strength.score === 2) {
    strengthProgress.style.backgroundColor = '#f1c40f';
    strengthText.textContent = 'Good';
  } else if (strength.score === 3) {
    strengthProgress.style.backgroundColor = '#2ecc71';
    strengthText.textContent = 'Strong';
  } else if (strength.score === 4) {
    strengthProgress.style.backgroundColor = '#27ae60';
    strengthText.textContent = 'Very Strong';
  }
});

// Check password strength
function checkPasswordStrength(password) {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  
  // Contains number
  if (/\d/.test(password)) score++;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) score++;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) score++;
  
  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return {
    score: Math.min(score, 4),
    feedback: getPasswordFeedback(score)
  };
}

// Get password feedback
function getPasswordFeedback(score) {
  const feedback = [
    'Password is too weak. Add more characters and variety.',
    'Password is fair. Add more variety of characters.',
    'Password is good. Consider adding special characters.',
    'Password is strong. Good job!',
    'Password is very strong. Excellent!'
  ];
  
  return feedback[Math.min(score, 4)];
}

// Form submission
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Show loading state
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store user data in localStorage (for demo purposes)
    const userData = {
      fullname: fullnameInput.value,
      email: emailInput.value,
      isLoggedIn: true
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect to home page
    window.location.href = 'home.html';
  } catch (error) {
    showError('Registration failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Form validation
function validateForm() {
  let isValid = true;
  
  // Full name validation
  if (fullnameInput.value.trim() === '') {
    showError('Please enter your full name');
    isValid = false;
  }
  
  // Email validation
  if (!isValidEmail(emailInput.value)) {
    showError('Please enter a valid email address');
    isValid = false;
  }
  
  // Password validation
  if (passwordInput.value.length < 8) {
    showError('Password must be at least 8 characters long');
    isValid = false;
  }
  
  // Confirm password validation
  if (passwordInput.value !== confirmPasswordInput.value) {
    showError('Passwords do not match');
    isValid = false;
  }
  
  // Terms checkbox validation
  if (!termsCheckbox.checked) {
    showError('Please agree to the Terms of Service and Privacy Policy');
    isValid = false;
  }
  
  return isValid;
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showError(message) {
  // Create error element if it doesn't exist
  let errorElement = document.querySelector('.error-message');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    registerForm.insertBefore(errorElement, registerForm.firstChild);
  }
  
  errorElement.textContent = message;
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    errorElement.textContent = '';
  }, 3000);
}

// Social login buttons
googleBtn.addEventListener('click', () => {
  // TODO: Implement Google OAuth
  console.log('Google login clicked');
});

facebookBtn.addEventListener('click', () => {
  // TODO: Implement Facebook OAuth
  console.log('Facebook login clicked');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.isLoggedIn) {
    window.location.href = 'home.html';
  }
}); 