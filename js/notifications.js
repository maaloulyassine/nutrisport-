// ===== Notification & Reminder System =====

let notificationPermission = false;
let reminderSettings = {
    waterReminder: false,
    mealReminder: false,
    weighInReminder: false,
    waterInterval: 2, // hours
    mealTimes: ['08:00', '12:00', '15:00', '19:00'], // breakfast, lunch, snack, dinner
    weighInDay: 1 // Monday
};

// Initialize notification system
function initNotifications() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications');
        return;
    }

    // Check current permission
    if (Notification.permission === 'granted') {
        notificationPermission = true;
    } else if (Notification.permission !== 'denied') {
        // Request permission
        Notification.requestPermission().then(permission => {
            notificationPermission = (permission === 'granted');
        });
    }
    
    // Load saved settings
    loadReminderSettings();
    
    // Setup reminder intervals
    setupReminders();
}

// Load reminder settings from localStorage
function loadReminderSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const saved = localStorage.getItem(`reminderSettings_${user.email}`);
    if (saved) {
        reminderSettings = JSON.parse(saved);
    }
}

// Save reminder settings
function saveReminderSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    localStorage.setItem(`reminderSettings_${user.email}`, JSON.stringify(reminderSettings));
}

// Setup reminder intervals
function setupReminders() {
    // Water reminder
    if (reminderSettings.waterReminder) {
        setInterval(() => {
            sendNotification(
                '💧 Hydratation',
                'N\'oubliez pas de boire un verre d\'eau !',
                'water'
            );
        }, reminderSettings.waterInterval * 60 * 60 * 1000);
    }
    
    // Meal reminders
    if (reminderSettings.mealReminder) {
        checkMealReminders();
        setInterval(checkMealReminders, 60000); // Check every minute
    }
    
    // Weigh-in reminder
    if (reminderSettings.weighInReminder) {
        checkWeighInReminder();
        setInterval(checkWeighInReminder, 3600000); // Check every hour
    }
}

// Check if it's time for meal reminder
function checkMealReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    reminderSettings.mealTimes.forEach((time, index) => {
        if (currentTime === time) {
            const meals = ['petit-déjeuner', 'déjeuner', 'collation', 'dîner'];
            sendNotification(
                `🍽️ ${meals[index].charAt(0).toUpperCase() + meals[index].slice(1)}`,
                `C'est l'heure de votre ${meals[index]} !`,
                'meal'
            );
        }
    });
}

// Check if it's time for weigh-in reminder
function checkWeighInReminder() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    // Check every Monday at 8 AM (or configured day)
    if (dayOfWeek === reminderSettings.weighInDay && hour === 8) {
        const lastReminder = localStorage.getItem('lastWeighInReminder');
        const today = now.toISOString().split('T')[0];
        
        // Only send once per day
        if (lastReminder !== today) {
            sendNotification(
                '⚖️ Pesée Hebdomadaire',
                'N\'oubliez pas de vous peser aujourd\'hui !',
                'weighin'
            );
            localStorage.setItem('lastWeighInReminder', today);
        }
    }
}

// Send notification
function sendNotification(title, body, type) {
    // Show browser notification if permitted
    if (notificationPermission) {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏋️</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏋️</text></svg>',
            tag: type,
            requireInteraction: false
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
    
    // Always show in-app toast
    showInAppNotification(title, body, type);
}

// Show in-app notification (toast)
function showInAppNotification(title, body, type) {
    const icons = {
        water: '💧',
        meal: '🍽️',
        weighin: '⚖️',
        general: '🔔'
    };
    
    const toastHtml = `
        <div class="toast align-items-center text-white bg-primary border-0 position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999; min-width: 300px;">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${icons[type] || icons.general} ${title}</strong><br>
                    ${body}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.querySelector('.toast:last-child');
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    
    // Play notification sound (optional)
    playNotificationSound();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Play notification sound
function playNotificationSound() {
    // Create audio element for notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjCH0fPTgjMGHm7A7+OZTA4PVqzn77BdGgs+ltv0xHAjBSuBzvLZijYIGmi+7OafTwwOUKXh8LdkGwY5kdTz03crBCV2x/DckD8KE1+z6OqnVRMLRp/f8r1uIAYug9Dz1IMzBh1tv+7imUsMEFWs5++wXRsLPpba9MNvJAUqgs7y2Yo3CBdpu+7mnk4QDVKm4e+2ZBkGOZHT8tN2KwQld8vw3Y9AChNfs+jqp1QTCkSf3/O9byAGLoPR89WDMgYcbL/u4pJLEBBVq+bvsF0cCz6W2vXDbSMGKoLO89mJOAgXaLzu5p5OEA1RpuHvtmYaBTmQ0/PTdisEJnfL8N2PQREZT7Pk6qhTEwlEnt/zvW4fByyD0fPWgjIGHGy/7uKRSxESU6vm7q9dHAs+l9v0w24iBiqBz/PZiTcIF2e77OaeTxENUabh77ZlGgU5j9Pz03YqBCV3y/DdjkAQE1m05+unVBQJQ5/e8r1uHwYsg9Hz1oIyBhtrvO/jkUsREFOr5O6vXRwLPJbb9cNvJAUrgM/y2Ik3CBhnu+3mnUwODVGl4e+1ZRoGOY/T8tN2LAUldsrw3ZBAEBNZtOjrp1QTCkOf3vK9bR8GLILh89Z/MgYcbLzv45FKDw9SqeHvr10bCzyV2/XEcSQFLYDP89iHNgYXZrvt5p1NEAxRpuDvtGQaBjmO0/LTdysEJnfL8N2QQA8TV7Pn6qhTGQpEnt/yu28gBSyD0PPWgjMHHGu98OSSTRAOUqnh8K9dGws9ltr1w3AjBS2Bz/LYhzYGF2a67eaeTBEMUabh77RkGgY5jtTy03YrBCZ3y/DdkD8QE1ez5+qnUxkKQ57f8rpwHwUsg9Dz1oExBxxqvfDjkkwQDlGq4fCvXhoKPZba9cNwIwUtgM/y2Ic2BhdmvO3mnkwQC1Gn4e+0YxsGOY7T8tN2KwQmd8rw3Y8/DxNXsufqp1MZCkKe3/K6cB8FLIPR89aDMQYba73v45JMEAxRqeDwr10aCj2W2vXDbyMFLYDP8tiHNwgXZrzt5p5MEAxRp+HutWQaBjmO0/LTdSsFJnbK8dyPPw8TVrLn6qhTGApCnt/yuW8gBSuD0PPWgjIGG2u87+OTTBEMUarg8K9dGgs9ldr1w3AjBS+Az/PYiDcIF2a77OaeTBELUafh7rRkGwU5jdPz03YrBCZ3y/Dej0APE1ex6OqoUxgKQp7f8rtwIAUsg9Dz1oIxBxtrvO7ikUwQC1Go4e+vXRsLPpXb9cNvJAUvgdDy2Ig2CBdmu+3mnkwQDFGn4e60ZBsGOY7U8tN2KwUmdsvw3I8/DxJXsefqp1MYCkOe3/K7cCEFL4PQ89aAMgccarzw45JMEQxRqOHvr10bCz6V2/XEcSMFL4HP8tiHNggXZbvt5p1MDAxRp+HvtGUaBzmO0/LUdysEJnbK8NyPQA8SV7Hn6qhTGApDnt/yu3AhBSyD0PPVgjMHG2u97+STTBAMUKnj8K5dGws9ldv1w3EjBiyBz/LYhzcFF2a67eadSw0MTRNG05pN');
    audio.volume = 0.3;
    audio.play().catch(() => {
        // Ignore errors if sound can't play
    });
}

// Toggle reminder setting
function toggleReminder(type) {
    switch(type) {
        case 'water':
            reminderSettings.waterReminder = !reminderSettings.waterReminder;
            break;
        case 'meal':
            reminderSettings.mealReminder = !reminderSettings.mealReminder;
            break;
        case 'weighin':
            reminderSettings.weighInReminder = !reminderSettings.weighInReminder;
            break;
    }
    
    saveReminderSettings();
    setupReminders();
}

// Update reminder settings
function updateReminderSettings(settings) {
    reminderSettings = { ...reminderSettings, ...settings };
    saveReminderSettings();
    setupReminders();
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            notificationPermission = (permission === 'granted');
            if (notificationPermission) {
                showInAppNotification(
                    'Notifications activées',
                    'Vous recevrez maintenant des rappels pour vos repas et objectifs',
                    'general'
                );
            }
        });
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNotifications,
        sendNotification,
        toggleReminder,
        updateReminderSettings,
        requestNotificationPermission
    };
}
