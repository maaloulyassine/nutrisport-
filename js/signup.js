// ===== Signup Form Validation & Handling =====

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Password strength indicator
    passwordInput.addEventListener('input', function() {
        const strengthDiv = document.getElementById('passwordStrength');
        const password = this.value;
        let strength = 0;

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        strengthDiv.className = 'password-strength mt-2';
        
        if (password.length === 0) {
            strengthDiv.style.width = '0%';
        } else if (strength <= 1) {
            strengthDiv.classList.add('password-weak');
            strengthDiv.textContent = 'Faible';
        } else if (strength <= 2) {
            strengthDiv.classList.add('password-medium');
            strengthDiv.textContent = 'Moyen';
        } else {
            strengthDiv.classList.add('password-strong');
            strengthDiv.textContent = 'Fort';
        }
    });

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Remove previous validation states
        const inputs = this.querySelectorAll('.form-control, .form-check-input');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        // Check if form is valid
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            
            // Mark invalid fields
            inputs.forEach(input => {
                if (!input.validity.valid) {
                    input.classList.add('is-invalid');
                } else {
                    input.classList.add('is-valid');
                }
            });
            
            showMessage('Veuillez corriger les erreurs dans le formulaire.', 'danger');
            return;
        }

        // Check password confirmation
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.classList.add('is-invalid');
            showMessage('Les mots de passe ne correspondent pas.', 'danger');
            return;
        }

        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: passwordInput.value,
            age: document.getElementById('age').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            sport: document.getElementById('sport').value,
            registrationDate: new Date().toISOString()
        };

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(user => user.email === formData.email)) {
            showMessage('Un compte existe déjà avec cet email.', 'danger');
            document.getElementById('email').classList.add('is-invalid');
            return;
        }

        // Save user to localStorage
        users.push(formData);
        localStorage.setItem('users', JSON.stringify(users));

        // Set current user
        localStorage.setItem('currentUser', JSON.stringify(formData));

        // Show success message
        showMessage('Inscription réussie ! Redirection en cours...', 'success');

        // Mark all fields as valid
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        });

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });

    // Real-time email validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        } else if (email) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });

    // Helper function to show messages
    function showMessage(message, type) {
        const messageDiv = document.getElementById('formMessage');
        messageDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
