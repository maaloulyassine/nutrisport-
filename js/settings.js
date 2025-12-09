// ===== Settings Page Logic =====

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize
    loadSettings();
    checkNotificationStatus();
    initNotifications();
    checkLogin();
});

// Load saved settings
function loadSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const saved = localStorage.getItem(`reminderSettings_${user.email}`);
    
    if (saved) {
        const settings = JSON.parse(saved);
        
        // Update toggles
        document.getElementById('waterReminderToggle').checked = settings.waterReminder;
        document.getElementById('mealReminderToggle').checked = settings.mealReminder;
        document.getElementById('weighInReminderToggle').checked = settings.weighInReminder;
        
        // Update settings panels
        toggleSettingsPanel('water', settings.waterReminder);
        toggleSettingsPanel('meal', settings.mealReminder);
        toggleSettingsPanel('weighin', settings.weighInReminder);
        
        // Update values
        if (settings.waterInterval) {
            document.getElementById('waterInterval').value = settings.waterInterval;
        }
        if (settings.mealTimes) {
            document.getElementById('breakfastTime').value = settings.mealTimes[0] || '08:00';
            document.getElementById('lunchTime').value = settings.mealTimes[1] || '12:00';
            document.getElementById('snackTime').value = settings.mealTimes[2] || '15:00';
            document.getElementById('dinnerTime').value = settings.mealTimes[3] || '19:00';
        }
        if (settings.weighInDay !== undefined) {
            document.getElementById('weighInDay').value = settings.weighInDay;
        }
    }
}

// Check notification permission status
function checkNotificationStatus() {
    const statusElement = document.getElementById('notificationStatus');
    
    if (!('Notification' in window)) {
        statusElement.textContent = 'Statut: Non supporté par ce navigateur';
        statusElement.className = 'text-danger';
    } else if (Notification.permission === 'granted') {
        statusElement.textContent = 'Statut: Activé ✓';
        statusElement.className = 'text-success';
    } else if (Notification.permission === 'denied') {
        statusElement.textContent = 'Statut: Bloqué - Veuillez autoriser dans les paramètres du navigateur';
        statusElement.className = 'text-danger';
    } else {
        statusElement.textContent = 'Statut: Non activé';
        statusElement.className = 'text-warning';
    }
}

// Toggle settings panel visibility
function toggleSettingsPanel(type, show) {
    const panel = document.getElementById(`${type}ReminderSettings`);
    if (panel) {
        panel.style.display = show ? 'block' : 'none';
    }
}

// Toggle reminder and show/hide settings
function toggleReminder(type) {
    const toggle = document.getElementById(`${type}ReminderToggle`);
    const isEnabled = toggle.checked;
    
    toggleSettingsPanel(type, isEnabled);
    
    // Update reminder settings using notifications.js function
    if (typeof window.toggleReminder === 'function') {
        window.toggleReminder(type);
    }
    
    showToast(`Rappel ${type === 'water' ? 'd\'hydratation' : type === 'meal' ? 'de repas' : 'de pesée'} ${isEnabled ? 'activé' : 'désactivé'}`, 'success');
}

// Update water interval
function updateWaterInterval() {
    const interval = parseInt(document.getElementById('waterInterval').value);
    
    if (typeof window.updateReminderSettings === 'function') {
        window.updateReminderSettings({ waterInterval: interval });
    }
    
    showToast(`Rappel d'eau configuré toutes les ${interval} heures`, 'success');
}

// Save meal times
function saveMealTimes() {
    const mealTimes = [
        document.getElementById('breakfastTime').value,
        document.getElementById('lunchTime').value,
        document.getElementById('snackTime').value,
        document.getElementById('dinnerTime').value
    ];
    
    if (typeof window.updateReminderSettings === 'function') {
        window.updateReminderSettings({ mealTimes: mealTimes });
    }
    
    showToast('Horaires des repas enregistrés', 'success');
}

// Update weigh-in day
function updateWeighInDay() {
    const day = parseInt(document.getElementById('weighInDay').value);
    
    if (typeof window.updateReminderSettings === 'function') {
        window.updateReminderSettings({ weighInDay: day });
    }
    
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    showToast(`Rappel de pesée configuré pour ${days[day]}`, 'success');
}

// Request notification permission
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Les notifications ne sont pas supportées par votre navigateur');
        return;
    }

    if (Notification.permission === 'granted') {
        showToast('Les notifications sont déjà activées', 'info');
        return;
    }

    Notification.requestPermission().then(permission => {
        checkNotificationStatus();
        
        if (permission === 'granted') {
            showToast('Notifications activées avec succès !', 'success');
            
            // Send test notification
            new Notification('NutriSport', {
                body: 'Les notifications sont maintenant activées !',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏋️</text></svg>'
            });
        } else {
            showToast('Les notifications ont été refusées', 'warning');
        }
    });
}

// Test notification
function testNotification() {
    if (typeof window.sendNotification === 'function') {
        window.sendNotification(
            '🎉 Notification Test',
            'Ceci est une notification de test. Tout fonctionne correctement !',
            'general'
        );
    } else {
        showToast('🔔 Notification de test envoyée !', 'primary');
    }
}

// Show toast notification
function showToast(message, type) {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3" role="alert" style="z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.querySelector('.toast:last-child');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
