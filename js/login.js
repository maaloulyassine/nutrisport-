// ===== Login Form Validation & Handling =====

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePasswordBtn = document.getElementById('toggleLoginPassword');

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

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Remove previous validation states
        const inputs = this.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        // Check if form is valid
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            
            inputs.forEach(input => {
                if (!input.validity.valid) {
                    input.classList.add('is-invalid');
                }
            });
            
            showMessage('Veuillez remplir tous les champs correctement.', 'danger');
            return;
        }

        const email = document.getElementById('loginEmail').value;
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Demo account check
        if (email === 'demo@nutrisport.com' && password === 'demo1234') {
            const demoUser = {
                fullName: 'Utilisateur Démo',
                email: email,
                age: 25,
                gender: 'male',
                sport: 'musculation'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(demoUser));
            showMessage('Connexion réussie ! Bienvenue ' + demoUser.fullName, 'success');
            
            setTimeout(() => {
                window.location.href = 'goals.html';
            }, 1500);
            return;
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Login successful
            inputs.forEach(input => {
                input.classList.add('is-valid');
            });

            // Save current user
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', email);
            } else {
                localStorage.removeItem('rememberMe');
            }

            showMessage('Connexion réussie ! Bienvenue ' + user.fullName, 'success');
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'goals.html';
            }, 1500);
        } else {
            // Login failed
            document.getElementById('loginEmail').classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
            
            showMessage('Email ou mot de passe incorrect. Essayez le compte démo ci-dessous.', 'danger');
        }
    });

    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberMe');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

    // Helper function to show messages
    function showMessage(message, type) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Real-time email validation
    document.getElementById('loginEmail').addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        } else if (email) {
            this.classList.remove('is-invalid');
        }
    });
});
