// ===== PWA Installation & Service Worker Registration =====

let deferredPrompt;
let swRegistration = null;

// Initialize PWA
function initPWA() {
    // Register service worker - detect correct path
    if ('serviceWorker' in navigator) {
        // Determine the correct path based on current location
        const swPath = window.location.pathname.includes('/html/') 
            ? '../service-worker.js' 
            : './service-worker.js';
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('Service Worker registered:', registration);
                swRegistration = registration;
                
                // Force check for updates immediately
                registration.update();
                
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
            
        // Listen for controller change and reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
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

// Update app - force reload with cache clear
function updateApp() {
    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    // Tell waiting service worker to take over
    if (swRegistration && swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Force reload from server
    window.location.reload(true);
}

// Force update - clears everything
function forceUpdate() {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.unregister();
            });
        });
    }
    
    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    // Reload after a short delay
    setTimeout(() => {
        window.location.reload(true);
    }, 500);
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
    forceUpdate: forceUpdate,
    isInstalled: isRunningAsPWA,
    requestNotifications: requestNotificationPermission
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', initPWA);
