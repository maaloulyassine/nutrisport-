// ===== Food Diary Management with Smart Water Notifications =====

let currentDate = new Date().toISOString().split('T')[0];
let foodDiary = {};
let waterIntake = {};
let waterReminderInterval = null;
let waterGoalGlasses = 8;
let waterGoalMl = 2000;

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    console.log('Food diary loaded');

    // Load data from localStorage
    loadFoodDiary();
    loadWaterIntake();
    calculateWaterGoal(); // Calculate based on weight
    
    // Set today's date
    document.getElementById('diaryDate').value = currentDate;
    document.getElementById('diaryDate').addEventListener('change', function() {
        currentDate = this.value;
        displayDailyMeals();
        displayDailySummary();
        displayWaterIntake();
    });

    // Load user's daily goals from goals page
    loadDailyGoals();
    
    // Display initial data
    displayDailyMeals();
    displayDailySummary();
    displayWaterIntake();
    
    // Start water reminder system
    startWaterReminderSystem();
    
    // Listen for storage changes (when goals are updated from another page)
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.includes('goal_')) {
            console.log('Goal updated, reloading...');
            loadDailyGoals();
            displayDailySummary();
        }
    });
    
    // Also check periodically for goal updates (for same-tab updates)
    setInterval(function() {
        loadDailyGoals();
    }, 2000); // Check every 2 seconds
    
    // Update navigation
    checkLogin();
});

// Calculate water goal based on user's weight
function calculateWaterGoal() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const profileKey = `profile_${user.email}`;
    const profile = localStorage.getItem(profileKey);
    
    if (profile) {
        const userData = JSON.parse(profile);
        if (userData.currentWeight) {
            // Recommandation: 35ml par kg de poids corporel
            waterGoalMl = Math.round(userData.currentWeight * 35);
            waterGoalGlasses = Math.ceil(waterGoalMl / 250); // 1 verre = 250ml
            
            document.getElementById('waterGoal').textContent = waterGoalGlasses;
            document.getElementById('waterGoalVolume').textContent = waterGoalMl;
        }
    }
}

// Start water reminder system
function startWaterReminderSystem() {
    // Calculate interval based on waking hours (assuming 16 hours awake)
    const wakingHours = 16;
    const reminderIntervalMinutes = Math.round((wakingHours * 60) / waterGoalGlasses);
    
    // Check every minute if it's time for a reminder
    waterReminderInterval = setInterval(() => {
        checkWaterReminder(reminderIntervalMinutes);
    }, 60000); // Check every minute
    
    // Initial check
    checkWaterReminder(reminderIntervalMinutes);
}

// Check if it's time for water reminder
function checkWaterReminder(intervalMinutes) {
    const todayIntake = waterIntake[currentDate] || { glasses: 0, lastDrink: null, reminders: [] };
    
    // If user hasn't reached their goal
    if (todayIntake.glasses < waterGoalGlasses) {
        const now = new Date();
        const lastDrink = todayIntake.lastDrink ? new Date(todayIntake.lastDrink) : null;
        
        // If no drink yet today, or enough time has passed
        if (!lastDrink || (now - lastDrink) / 1000 / 60 >= intervalMinutes) {
            showWaterNotification();
            updateNextReminderDisplay(intervalMinutes);
        } else {
            updateNextReminderDisplay(intervalMinutes, lastDrink);
        }
    } else {
        hideWaterNotification();
    }
}

// Show water notification
function showWaterNotification() {
    const notificationEl = document.getElementById('waterNotification');
    const textEl = document.getElementById('waterNotificationText');
    
    const messages = [
        "Il est temps de boire un verre d'eau ! 💧",
        "N'oubliez pas de vous hydrater ! 🥤",
        "Votre corps a besoin d'eau maintenant ! 💦",
        "C'est l'heure de votre hydratation ! 🌊",
        "Pause hydratation recommandée ! 💧"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    textEl.textContent = randomMessage;
    notificationEl.classList.remove('d-none');
    
    // Play notification sound (optional)
    playNotificationSound();
}

// Hide water notification
function hideWaterNotification() {
    const notificationEl = document.getElementById('waterNotification');
    notificationEl.classList.add('d-none');
}

// Update next reminder display
function updateNextReminderDisplay(intervalMinutes, lastDrink = null) {
    const reminderEl = document.getElementById('nextWaterReminder');
    const timeEl = document.getElementById('nextReminderTime');
    
    const todayIntake = waterIntake[currentDate] || { glasses: 0 };
    
    if (todayIntake.glasses >= waterGoalGlasses) {
        reminderEl.style.display = 'none';
        return;
    }
    
    const nextTime = new Date();
    if (lastDrink) {
        nextTime.setTime(lastDrink.getTime() + intervalMinutes * 60000);
    } else {
        nextTime.setTime(nextTime.getTime() + intervalMinutes * 60000);
    }
    
    timeEl.textContent = nextTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    reminderEl.style.display = 'block';
}

// Play notification sound (simple beep)
function playNotificationSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Audio not supported, silent fail
    }
}

// Add water glass
function addWaterGlass() {
    if (!waterIntake[currentDate]) {
        waterIntake[currentDate] = { glasses: 0, lastDrink: null, history: [] };
    }
    
    waterIntake[currentDate].glasses++;
    waterIntake[currentDate].lastDrink = new Date().toISOString();
    waterIntake[currentDate].history.push({
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    });
    
    saveWaterIntake();
    displayWaterIntake();
    hideWaterNotification();
    
    // Show encouragement
    if (waterIntake[currentDate].glasses >= waterGoalGlasses) {
        showToast('🎉 Bravo ! Objectif d\'hydratation atteint !', 'success');
    } else {
        showToast('💧 Verre ajouté ! Continuez !', 'success');
    }
}

// Reset water for current day
function resetWater() {
    if (confirm('Réinitialiser l\'hydratation pour aujourd\'hui ?')) {
        waterIntake[currentDate] = { glasses: 0, lastDrink: null, history: [] };
        saveWaterIntake();
        displayWaterIntake();
    }
}

// Display water intake
function displayWaterIntake() {
    const todayIntake = waterIntake[currentDate] || { glasses: 0 };
    const glassesCount = todayIntake.glasses || 0;
    const volumeMl = glassesCount * 250;
    
    document.getElementById('waterGlasses').textContent = glassesCount;
    document.getElementById('waterVolume').textContent = volumeMl;
    
    // Update reminder display
    if (glassesCount < waterGoalGlasses) {
        const wakingHours = 16;
        const intervalMinutes = Math.round((wakingHours * 60) / waterGoalGlasses);
        updateNextReminderDisplay(intervalMinutes, todayIntake.lastDrink ? new Date(todayIntake.lastDrink) : null);
    } else {
        document.getElementById('nextWaterReminder').style.display = 'none';
        hideWaterNotification();
    }
}

// Load food diary from localStorage
function loadFoodDiary() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const key = `foodDiary_${user.email}`;
    const saved = localStorage.getItem(key);
    foodDiary = saved ? JSON.parse(saved) : {};
}

// Save food diary to localStorage
function saveFoodDiary() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const key = `foodDiary_${user.email}`;
    localStorage.setItem(key, JSON.stringify(foodDiary));
}

// Load water intake from localStorage
function loadWaterIntake() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const key = `waterIntake_${user.email}`;
    const saved = localStorage.getItem(key);
    waterIntake = saved ? JSON.parse(saved) : {};
}

// Save water intake to localStorage
function saveWaterIntake() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const key = `waterIntake_${user.email}`;
    localStorage.setItem(key, JSON.stringify(waterIntake));
}

// Load daily goals from goals page
function loadDailyGoals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const goalKey = `goal_${user.email}`;
    const savedGoal = localStorage.getItem(goalKey);
    
    if (savedGoal) {
        try {
            const goal = JSON.parse(savedGoal);
            const caloriesGoalEl = document.getElementById('caloriesGoal');
            const proteinsGoalEl = document.getElementById('proteinsGoal');
            const carbsGoalEl = document.getElementById('carbsGoal');
            const fatsGoalEl = document.getElementById('fatsGoal');
            
            // Use default values if macros don't exist (old data format)
            const targetCalories = goal.targetCalories || 2000;
            const proteinGrams = goal.macros?.protein?.grams || Math.round((targetCalories * 0.30) / 4);
            const carbsGrams = goal.macros?.carbs?.grams || Math.round((targetCalories * 0.40) / 4);
            const fatsGrams = goal.macros?.fats?.grams || Math.round((targetCalories * 0.30) / 9);
            
            if (caloriesGoalEl) caloriesGoalEl.textContent = targetCalories;
            if (proteinsGoalEl) proteinsGoalEl.textContent = proteinGrams;
            if (carbsGoalEl) carbsGoalEl.textContent = carbsGrams;
            if (fatsGoalEl) fatsGoalEl.textContent = fatsGrams;
            
            console.log('Daily goals loaded:', {
                calories: targetCalories,
                proteins: proteinGrams,
                carbs: carbsGrams,
                fats: fatsGrams
            });
        } catch (error) {
            console.error('Error loading daily goals:', error);
            setDefaultGoals();
        }
    } else {
        console.log('No goal found, using defaults');
        setDefaultGoals();
    }
}

// Set default goals if no goal exists
function setDefaultGoals() {
    const caloriesGoalEl = document.getElementById('caloriesGoal');
    const proteinsGoalEl = document.getElementById('proteinsGoal');
    const carbsGoalEl = document.getElementById('carbsGoal');
    const fatsGoalEl = document.getElementById('fatsGoal');
    
    if (caloriesGoalEl) caloriesGoalEl.textContent = '2000';
    if (proteinsGoalEl) proteinsGoalEl.textContent = '150';
    if (carbsGoalEl) carbsGoalEl.textContent = '200';
    if (fatsGoalEl) fatsGoalEl.textContent = '67';
}

// Save meal
function saveMeal() {
    const category = document.getElementById('mealCategory').value;
    const name = document.getElementById('mealName').value;
    const calories = parseFloat(document.getElementById('mealCalories').value);
    const quantity = parseFloat(document.getElementById('mealQuantity').value);
    const proteins = parseFloat(document.getElementById('mealProteins').value);
    const carbs = parseFloat(document.getElementById('mealCarbs').value);
    const fats = parseFloat(document.getElementById('mealFats').value);

    if (!name || !calories) {
        alert('Veuillez remplir tous les champs requis');
        return;
    }

    const meal = {
        id: Date.now(),
        category,
        name,
        calories,
        quantity,
        proteins,
        carbs,
        fats,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    // Initialize date entry if needed
    if (!foodDiary[currentDate]) {
        foodDiary[currentDate] = [];
    }

    foodDiary[currentDate].push(meal);
    saveFoodDiary();

    // Reset form
    document.getElementById('addMealForm').reset();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addMealModal'));
    modal.hide();

    // Refresh display
    displayDailyMeals();
    displayDailySummary();

    // Show success message
    showToast('Repas ajouté avec succès !', 'success');
}

// Display meals for current date
function displayDailyMeals() {
    const meals = foodDiary[currentDate] || [];
    
    // Clear all categories
    ['breakfast', 'lunch', 'snack', 'dinner'].forEach(category => {
        const container = document.getElementById(`${category}Meals`);
        const categoryMeals = meals.filter(m => m.category === category);
        
        if (categoryMeals.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mb-0">Aucun repas ajouté</p>';
        } else {
            container.innerHTML = categoryMeals.map(meal => `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div>
                        <strong>${meal.name}</strong>
                        <small class="text-muted d-block">${meal.quantity}g • ${meal.time}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary">${meal.calories} kcal</span>
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteMeal(${meal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    });
}

// Display daily summary
function displayDailySummary() {
    const meals = foodDiary[currentDate] || [];
    
    const totals = meals.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.proteins += meal.proteins;
        acc.carbs += meal.carbs;
        acc.fats += meal.fats;
        return acc;
    }, { calories: 0, proteins: 0, carbs: 0, fats: 0 });

    document.getElementById('dailyCalories').textContent = Math.round(totals.calories);
    document.getElementById('dailyProteins').textContent = Math.round(totals.proteins) + 'g';
    document.getElementById('dailyCarbs').textContent = Math.round(totals.carbs) + 'g';
    document.getElementById('dailyFats').textContent = Math.round(totals.fats) + 'g';

    // Update progress bars
    updateProgressBar('calories', totals.calories);
    updateProgressBar('proteins', totals.proteins);
    updateProgressBar('carbs', totals.carbs);
    updateProgressBar('fats', totals.fats);
}

// Update progress bar
function updateProgressBar(type, current) {
    const goal = parseFloat(document.getElementById(`${type}Goal`).textContent);
    const percentage = Math.min((current / goal) * 100, 100);
    
    document.getElementById(`${type}Progress`).textContent = Math.round(current);
    document.getElementById(`${type}Bar`).style.width = percentage + '%';
    
    // Change color based on percentage
    const bar = document.getElementById(`${type}Bar`);
    if (percentage > 100) {
        bar.classList.remove('bg-primary', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success');
        bar.classList.add('bg-danger');
    }
}

// Delete meal
function deleteMeal(mealId) {
    if (!confirm('Supprimer ce repas ?')) return;
    
    const meals = foodDiary[currentDate] || [];
    foodDiary[currentDate] = meals.filter(m => m.id !== mealId);
    saveFoodDiary();
    
    displayDailyMeals();
    displayDailySummary();
    showToast('Repas supprimé', 'info');
}

// Show toast notification
function showToast(message, type) {
    // Create toast element
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3" role="alert" style="z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.querySelector('.toast:last-child');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
