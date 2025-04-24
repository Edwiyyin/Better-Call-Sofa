document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');
    const registerLink = document.querySelector('.register-link a');

    // Add register link handler
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.innerHTML = type === 'password' ? 
                '<i class="far fa-eye"></i>' : 
                '<i class="far fa-eye-slash"></i>';
                
            // Show popup message
            showPopup(type === 'password' ? 'Password hidden' : 'Password visible');
        });
    }

    // Form validation and submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Basic validation
            if (!emailInput.value || !passwordInput.value) {
                showError('Please fill in all fields');
                return;
            }

            if (!isValidEmail(emailInput.value)) {
                showError('Please enter a valid email address');
                return;
            }

            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                submitBtn.disabled = true;

                // Simulate API call (replace with actual API endpoint)
                await new Promise(resolve => setTimeout(resolve, 1000));

                // For demo, create a user object
                const userData = {
                    email: emailInput.value,
                    isLoggedIn: true
                };
                
                // Store user session if remember me is checked or always for demo
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem('userEmail', emailInput.value);
                }
                
                // Store the user object
                localStorage.setItem('user', JSON.stringify(userData));

                // Redirect to home page or dashboard
                window.location.href = '/';
            } catch (error) {
                showError('Login failed. Please try again.');
                // Reset button state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Social login handlers
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            // Demo implementation
            showPopup('Google login demo');
            
            // Create demo user
            const demoUser = {
                email: 'google.user@example.com',
                isLoggedIn: true
            };
            localStorage.setItem('user', JSON.stringify(demoUser));
            
            // Redirect after a delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            // Demo implementation
            showPopup('Facebook login demo');
            
            // Create demo user
            const demoUser = {
                email: 'facebook.user@example.com',
                isLoggedIn: true
            };
            localStorage.setItem('user', JSON.stringify(demoUser));
            
            // Redirect after a delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        });
    }

    // Helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.querySelector('.error-message');
        if (!errorElement && loginForm) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            loginForm.insertBefore(errorElement, loginForm.firstChild);
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';

            // Hide error after 3 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    }
    
    // Show popup message
    function showPopup(message) {
        // Create popup element if it doesn't exist
        let popupElement = document.querySelector('.password-popup');
        if (!popupElement) {
            popupElement = document.createElement('div');
            popupElement.className = 'password-popup';
            document.body.appendChild(popupElement);
        }

        popupElement.textContent = message;
        popupElement.style.display = 'block';
        popupElement.style.opacity = '1';

        // Hide popup after 1.5 seconds
        setTimeout(() => {
            popupElement.style.opacity = '0';
            setTimeout(() => {
                popupElement.style.display = 'none';
            }, 300);
        }, 1500);
    }

    // Check for stored email
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && emailInput) {
        emailInput.value = storedEmail;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
        // If on login page, redirect to home
        if (window.location.pathname.includes('login.html')) {
            window.location.href = '/';
        }
    }
});