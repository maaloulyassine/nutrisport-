// ===== PWA Installation & Service Worker Registration =====

let deferredPrompt;
let swRegistration = null;
let installButtonShown = false;

// Initialize PWA
function initPWA() {
    // Register service worker - detect correct path
    if ('serviceWorker' in navigator) {
        // Determine the correct path based on current location
        const swPath = window.location.pathname.includes('/html/') 
            ? '../service-worker.js' 
            : './service-worker.js';
        
        navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
            .then(registration => {
                console.log('Service Worker registered:', registration);
                swRegistration = registration;
                
                // Force check for updates immediately
                registration.update();
                
                // Check for updates every 30 seconds
                setInterval(() => {
                    registration.update();
                }, 30000);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Auto-update immediately
                            if (newWorker.state === 'installed') {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
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
        // Update button if already shown
        updateInstallButtonState();
    });
    
    // Handle successful installation
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        deferredPrompt = null;
        hideInstallButton();
        // Save installation state
        localStorage.setItem('pwaInstalled', 'true');
    });
    
    // Always show install button if not running as PWA and not already installed
    if (!isRunningAsPWA() && !localStorage.getItem('pwaInstalled')) {
        showInstallButton();
    }
}

// Show install button - always visible on all pages
function showInstallButton() {
    // Don't create duplicate buttons
    if (document.getElementById('pwaInstallBtn')) {
        updateInstallButtonState();
        return;
    }
    
    installButtonShown = true;
    
    const installBtn = document.createElement('button');
    installBtn.id = 'pwaInstallBtn';
    installBtn.className = 'btn btn-pwa-install';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
    installBtn.onclick = handleInstallClick;
    
    document.body.appendChild(installBtn);
}

// Update button state based on whether prompt is available
function updateInstallButtonState() {
    const btn = document.getElementById('pwaInstallBtn');
    if (!btn) return;
    
    // Always keep the same text and style
    btn.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
}

// Handle install button click
function handleInstallClick() {
    if (deferredPrompt) {
        promptInstall();
    } else {
        showInstallInstructions();
    }
}

// Show installation instructions modal
function showInstallInstructions() {
    // Remove existing modal if any
    const existingModal = document.getElementById('pwaInstallModal');
    if (existingModal) existingModal.remove();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
        instructions = `
            <div class="install-step">
                <span class="step-number">1</span>
                <span>Appuyez sur <i class="fas fa-share-square"></i> (Partager)</span>
            </div>
            <div class="install-step">
                <span class="step-number">2</span>
                <span>Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></span>
            </div>
            <div class="install-step">
                <span class="step-number">3</span>
                <span>Appuyez sur <strong>"Ajouter"</strong></span>
            </div>
        `;
    } else if (isAndroid) {
        instructions = `
            <div class="install-step">
                <span class="step-number">1</span>
                <span>Appuyez sur <i class="fas fa-ellipsis-v"></i> (Menu)</span>
            </div>
            <div class="install-step">
                <span class="step-number">2</span>
                <span>Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></span>
            </div>
            <div class="install-step">
                <span class="step-number">3</span>
                <span>Confirmez l'installation</span>
            </div>
        `;
    } else {
        instructions = `
            <div class="install-step">
                <span class="step-number">1</span>
                <span>Cliquez sur <i class="fas fa-plus-circle"></i> dans la barre d'adresse</span>
            </div>
            <div class="install-step">
                <span class="step-number">2</span>
                <span>Ou allez dans le menu <i class="fas fa-ellipsis-v"></i> et sélectionnez <strong>"Installer NutriSport"</strong></span>
            </div>
            <div class="install-step">
                <span class="step-number">3</span>
                <span>Confirmez l'installation</span>
            </div>
        `;
    }
    
    const modal = document.createElement('div');
    modal.id = 'pwaInstallModal';
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-install-modal-content">
            <div class="pwa-install-modal-header">
                <h4><i class="fas fa-mobile-alt text-primary"></i> Installer NutriSport</h4>
                <button class="pwa-modal-close" onclick="closePwaModal()">&times;</button>
            </div>
            <div class="pwa-install-modal-body">
                <p class="text-muted mb-3">Installez l'application pour un accès rapide et une utilisation hors ligne !</p>
                <div class="install-benefits mb-4">
                    <div class="benefit"><i class="fas fa-bolt text-warning"></i> Accès rapide</div>
                    <div class="benefit"><i class="fas fa-wifi-slash text-info"></i> Fonctionne hors ligne</div>
                    <div class="benefit"><i class="fas fa-bell text-danger"></i> Notifications</div>
                </div>
                <h6 class="mb-3">Comment installer :</h6>
                ${instructions}
            </div>
            <div class="pwa-install-modal-footer">
                <button class="btn btn-secondary" onclick="closePwaModal()">Fermer</button>
                <button class="btn btn-outline-primary" onclick="dismissInstallButton()">
                    <i class="fas fa-times"></i> Ne plus afficher
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show with animation
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePwaModal();
    });
}

// Close PWA modal
function closePwaModal() {
    const modal = document.getElementById('pwaInstallModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Dismiss install button permanently
function dismissInstallButton() {
    localStorage.setItem('pwaInstalled', 'true');
    closePwaModal();
    hideInstallButton();
}

// Make functions globally available
window.closePwaModal = closePwaModal;
window.dismissInstallButton = dismissInstallButton;

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
