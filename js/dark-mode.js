// ===== Dark Mode Toggle System =====

let darkMode = false;

// Initialize dark mode
function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    darkMode = saved === 'true';
    
    if (darkMode) {
        enableDarkMode();
    }
    
    // Add toggle button to all pages
    addDarkModeToggle();
}

// Enable dark mode
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    darkMode = true;
    localStorage.setItem('darkMode', 'true');
    updateDarkModeIcon();
}

// Disable dark mode
function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    darkMode = false;
    localStorage.setItem('darkMode', 'false');
    updateDarkModeIcon();
}

// Toggle dark mode
function toggleDarkMode() {
    if (darkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Update icon
function updateDarkModeIcon() {
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Add toggle button
function addDarkModeToggle() {
    const navbar = document.querySelector('.navbar .container');
    if (!navbar || document.getElementById('darkModeToggle')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'darkModeToggle';
    toggleBtn.className = 'btn btn-dark-mode';
    toggleBtn.innerHTML = `<i class="fas fa-${darkMode ? 'sun' : 'moon'}"></i>`;
    toggleBtn.onclick = toggleDarkMode;
    toggleBtn.title = 'Changer de thème';
    
    // Insert before navbar-toggler or at end
    const toggler = navbar.querySelector('.navbar-toggler');
    if (toggler) {
        toggler.parentNode.insertBefore(toggleBtn, toggler);
    } else {
        navbar.appendChild(toggleBtn);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', initDarkMode);

// Export for external use
window.darkModeSystem = {
    init: initDarkMode,
    toggle: toggleDarkMode,
    enable: enableDarkMode,
    disable: disableDarkMode,
    isEnabled: () => darkMode
};
