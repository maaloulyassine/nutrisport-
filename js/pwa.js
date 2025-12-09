// ===== PWA Installation & Service Worker Registration =====

let deferredPrompt;
let swRegistration = null;

// Initialize PWA
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
                swRegistration = registration;
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
    
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    // Handle successful installation
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        deferredPrompt = null;
        hideInstallButton();
    });
}

// Show install button
function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwaInstallBtn';
    installBtn.className = 'btn btn-pwa-install';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
    installBtn.onclick = promptInstall;
    
    document.body.appendChild(installBtn);
}

// Hide install button
function hideInstallButton() {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.remove();
}

// Prompt installation
async function promptInstall() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    hideInstallButton();
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
        <div class="pwa-update-content">
            <i class="fas fa-sync-alt"></i>
            <span>Nouvelle version disponible !</span>
            <button onclick="window.pwaMethods.updateApp()">Mettre à jour</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Update app
function updateApp() {
    if (!swRegistration || !swRegistration.waiting) return;
    
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
}

// Check if running as PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

// Export methods
window.pwaMethods = {
    init: initPWA,
    install: promptInstall,
    update: updateApp,
    isInstalled: isRunningAsPWA,
    requestNotifications: requestNotificationPermission
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', initPWA);
