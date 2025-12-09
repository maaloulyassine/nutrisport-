// ===== Main JavaScript for NutriSport =====

// Check if user is logged in
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Redirect to goals if user is already logged in and tries to access login/signup pages
        if (currentPage === 'login.html' || currentPage === 'signup.html') {
            window.location.href = 'goals.html';
            return;
        }
        
        displayWelcomeMessage(user.fullName);
        updateNavigation(true, user.fullName);
    } else {
        // Redirect to login if not logged in and trying to access protected pages
        const protectedPages = ['goals.html', 'food-diary.html', 'settings.html', 'dashboard.html', 'chatbot.html', 'meal-plan.html'];
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return;
        }
        
        updateNavigation(false);
    }
}

// Display welcome message for logged in user
function displayWelcomeMessage(userName) {
    const welcomeDiv = document.getElementById('welcomeMessage');
    if (welcomeDiv) {
        welcomeDiv.innerHTML = `
            <i class="fas fa-user-circle"></i> 
            Bienvenue, <strong>${userName}</strong> !
        `;
        welcomeDiv.style.display = 'inline-block';
        welcomeDiv.style.cursor = 'pointer';
        welcomeDiv.title = 'Accéder à mes objectifs';
        
        // Add click event to redirect to goals
        welcomeDiv.addEventListener('click', function() {
            window.location.href = 'goals.html';
        });
    }
    
    // Update CTA buttons on homepage for logged-in users
    const ctaButton = document.getElementById('ctaButton');
    const secondaryButton = document.getElementById('secondaryButton');
    
    if (ctaButton && secondaryButton) {
        ctaButton.href = 'goals.html';
        ctaButton.innerHTML = '<i class="fas fa-bullseye"></i> Mes Objectifs';
        
        secondaryButton.href = 'food-diary.html';
        secondaryButton.innerHTML = '<i class="fas fa-utensils"></i> Mon Journal';
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all feature cards and stat items
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    
    const elements = document.querySelectorAll('.feature-card, .stat-item');
    elements.forEach(el => observer.observe(el));
});

// Update navigation based on login status
function updateNavigation(isLoggedIn, userName = '') {
    const navbarNav = document.querySelector('#mainNav');
    if (!navbarNav) return;

    // Get current page
    const currentPage = window.location.pathname.split('/').pop();

    if (isLoggedIn) {
        // Navigation for logged-in users - simplified structure
        navbarNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" href="index.html">Accueil</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'dashboard.html' ? 'active' : ''}" href="dashboard.html">
                    <i class="fas fa-chart-line"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'goals.html' ? 'active' : ''}" href="goals.html">
                    <i class="fas fa-bullseye"></i> Objectifs
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'food-diary.html' ? 'active' : ''}" href="food-diary.html">
                    <i class="fas fa-utensils"></i> Journal
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'meal-plan.html' ? 'active' : ''}" href="meal-plan.html">
                    <i class="fas fa-calendar-week"></i> Plan Repas
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'chatbot.html' ? 'active' : ''}" href="chatbot.html">
                    <i class="fas fa-robot"></i> Assistant IA
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'settings.html' ? 'active' : ''}" href="settings.html">
                    <i class="fas fa-cog"></i> Paramètres
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="logout(); return false;">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </a>
            </li>
        `;
    } else {
        // Navigation for non-logged users
        navbarNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" href="index.html">Accueil</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'login.html' ? 'active' : ''}" href="login.html">Connexion</a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn-signup ${currentPage === 'signup.html' ? 'active' : ''}" href="signup.html">Inscription</a>
            </li>
        `;
    }
}

// Logout function
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}
