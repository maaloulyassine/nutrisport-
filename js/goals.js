// ===== Goals and Weight Tracking with Integrated Calculator =====

let userGoal = null;
let weightHistory = [];
let chart = null;
let userProfile = null;

// Check authentication and load data
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    console.log('Goals page loaded, initializing...');
    
    loadData();
    loadProfile();
    displayGoalSummary();
    displayWeightHistory();
    displayStats();
    initChart();
    
    // Set today's date in update weight modal
    const weighInDateEl = document.getElementById('weighInDate');
    if (weighInDateEl) {
        weighInDateEl.valueAsDate = new Date();
    }
    
    // Form submissions
    const goalFormEl = document.getElementById('goalForm');
    const profileFormEl = document.getElementById('profileForm');
    
    if (goalFormEl) {
        console.log('Goal form found, attaching event listener');
        goalFormEl.addEventListener('submit', calculateAndValidateGoal);
    } else {
        console.error('Goal form not found!');
    }
    
    if (profileFormEl) {
        profileFormEl.addEventListener('input', updateBMIDisplay);
    }
    
    checkLogin();
});

// Load profile data
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const profileKey = `profile_${user.email}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        // Fill form with saved data
        document.getElementById('gender').value = userProfile.gender || '';
        document.getElementById('age').value = userProfile.age || '';
        document.getElementById('height').value = userProfile.height || '';
        document.getElementById('currentWeight').value = userProfile.currentWeight || '';
        document.getElementById('activityLevel').value = userProfile.activityLevel || '';
        updateBMIDisplay();
    }
}

// Update BMI display when profile form changes
function updateBMIDisplay() {
    const weight = parseFloat(document.getElementById('currentWeight').value);
    const height = parseFloat(document.getElementById('height').value);
    
    if (weight && height && height > 0) {
        const heightM = height / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        document.getElementById('currentBMI').textContent = bmi;
        document.getElementById('currentBMIDisplay').style.display = 'block';
    } else {
        document.getElementById('currentBMIDisplay').style.display = 'none';
    }
}

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel) {
    return bmr * parseFloat(activityLevel);
}

// Validate goal feasibility
function validateGoalFeasibility(currentWeight, targetWeight, durationDays) {
    const weightChange = Math.abs(targetWeight - currentWeight);
    const weeklyChange = (weightChange / durationDays) * 7;
    
    const messages = [];
    let isValid = true;
    let severity = 'success';
    
    // Règles de validation
    if (weightChange === 0) {
        messages.push({
            type: 'info',
            text: 'Aucun changement de poids souhaité. Objectif de maintien.'
        });
    } else if (targetWeight < currentWeight) {
        // Perte de poids
        if (weeklyChange > 1) {
            isValid = false;
            severity = 'danger';
            messages.push({
                type: 'danger',
                text: `⚠️ OBJECTIF DANGEREUX ! Vous voulez perdre ${weeklyChange.toFixed(1)} kg/semaine. La perte recommandée est de 0.5-1 kg/semaine.`
            });
            messages.push({
                type: 'warning',
                text: `Durée minimale recommandée : ${Math.ceil((weightChange / 1) * 7)} jours pour une perte saine.`
            });
        } else if (weeklyChange > 0.8) {
            severity = 'warning';
            messages.push({
                type: 'warning',
                text: `Objectif ambitieux mais réalisable : ${weeklyChange.toFixed(1)} kg/semaine.`
            });
        } else {
            messages.push({
                type: 'success',
                text: `✓ Objectif sain et réaliste : ${weeklyChange.toFixed(1)} kg/semaine.`
            });
        }
    } else {
        // Prise de poids
        if (weeklyChange > 0.5) {
            isValid = false;
            severity = 'danger';
            messages.push({
                type: 'danger',
                text: `⚠️ OBJECTIF TROP RAPIDE ! Vous voulez prendre ${weeklyChange.toFixed(1)} kg/semaine. La prise recommandée est de 0.25-0.5 kg/semaine.`
            });
        } else {
            messages.push({
                type: 'success',
                text: `✓ Objectif réaliste pour une prise de masse : ${weeklyChange.toFixed(1)} kg/semaine.`
            });
        }
    }
    
    return { isValid, severity, messages, weeklyChange };
}

// Calculate and validate goal
function calculateAndValidateGoal(e) {
    e.preventDefault();
    console.log('Calculate and validate goal called');
    
    // Get profile data
    const gender = document.getElementById('gender')?.value;
    const age = parseInt(document.getElementById('age')?.value);
    const height = parseFloat(document.getElementById('height')?.value);
    const currentWeight = parseFloat(document.getElementById('currentWeight')?.value);
    const activityLevel = document.getElementById('activityLevel')?.value;
    
    // Get goal data
    const targetWeight = parseFloat(document.getElementById('targetWeight')?.value);
    const targetDuration = parseInt(document.getElementById('targetDuration')?.value);
    
    console.log('Form values:', { gender, age, height, currentWeight, activityLevel, targetWeight, targetDuration });
    
    // Validation
    if (!gender || !age || !height || !currentWeight || !activityLevel || !targetWeight || !targetDuration) {
        showValidationMessage('Veuillez remplir tous les champs', 'danger');
        console.error('Missing required fields');
        return;
    }
    
    console.log('All fields validated, calculating...');
    
    // Validate goal feasibility
    const validation = validateGoalFeasibility(currentWeight, targetWeight, targetDuration);
    console.log('Validation result:', validation);
    
    // Display validation message
    const validationDiv = document.getElementById('validationMessage');
    if (validationDiv) {
        validationDiv.className = `alert alert-${validation.severity}`;
        validationDiv.innerHTML = validation.messages.map(msg => 
            `<div><strong>${msg.text}</strong></div>`
        ).join('');
        validationDiv.classList.remove('d-none');
    }
    
    if (!validation.isValid) {
        console.warn('Goal not valid, stopping here');
        return; // Ne pas sauvegarder si l'objectif est dangereux
    }
    
    console.log('Goal is valid, calculating nutritional needs...');
    
    // Calculate nutritional needs
    const bmr = calculateBMR(currentWeight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    
    // Calculate calorie adjustment for goal
    const weightChange = targetWeight - currentWeight;
    const totalCalorieChange = weightChange * 7700; // 1 kg ≈ 7700 kcal
    const dailyCalorieAdjustment = totalCalorieChange / targetDuration;
    const targetCalories = Math.round(tdee + dailyCalorieAdjustment);
    
    console.log('Calculations:', { bmr, tdee, targetCalories });
    
    // Calculate macros (example distribution)
    const proteinCalories = targetCalories * 0.30;
    const carbsCalories = targetCalories * 0.40;
    const fatsCalories = targetCalories * 0.30;
    
    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatsGrams = Math.round(fatsCalories / 9);
    
    // Save profile
    userProfile = { gender, age, height, currentWeight, activityLevel };
    const user = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`profile_${user.email}`, JSON.stringify(userProfile));
    console.log('Profile saved');
    
    // Save goal with calculations
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDuration);
    
    userGoal = {
        targetWeight,
        targetDuration,
        targetDate: targetDate.toISOString().split('T')[0],
        startWeight: currentWeight,
        startDate: new Date().toISOString().split('T')[0],
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
        macros: {
            protein: { grams: proteinGrams, calories: Math.round(proteinCalories) },
            carbs: { grams: carbsGrams, calories: Math.round(carbsCalories) },
            fats: { grams: fatsGrams, calories: Math.round(fatsCalories) }
        },
        weeklyChange: validation.weeklyChange,
        created: Date.now()
    };
    
    localStorage.setItem(`goal_${user.email}`, JSON.stringify(userGoal));
    console.log('Goal saved:', userGoal);
    
    // Update weight history
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = weightHistory.find(w => w.date === today);
    if (!existingEntry) {
        const heightM = height / 100;
        const bmi = (currentWeight / (heightM * heightM)).toFixed(1);
        weightHistory.push({
            date: today,
            weight: currentWeight,
            height,
            bmi,
            notes: 'Objectif défini'
        });
        weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveWeightHistory();
        console.log('Weight history updated');
    }
    
    // Display results
    displayCalculationResults();
    displayGoalSummary();
    displayStats();
    updateChart();
    
    showToast('✅ Objectif calculé et enregistré ! Le journal est maintenant à jour.', 'success');
    console.log('All done!');
}

// Display calculation results
function displayCalculationResults() {
    if (!userGoal) return;
    
    const resultsCard = document.getElementById('resultsCard');
    if (resultsCard) {
        resultsCard.style.display = 'block';
    }
    
    const bmrEl = document.getElementById('bmrValue');
    const tdeeEl = document.getElementById('tdeeValue');
    
    if (bmrEl) bmrEl.textContent = `${userGoal.bmr || 0} kcal`;
    if (tdeeEl) tdeeEl.textContent = `${userGoal.targetCalories || 0} kcal`;
    
    // Safe access to macros with defaults
    const proteinGrams = userGoal.macros?.protein?.grams || 0;
    const proteinCalories = userGoal.macros?.protein?.calories || 0;
    const carbsGrams = userGoal.macros?.carbs?.grams || 0;
    const carbsCalories = userGoal.macros?.carbs?.calories || 0;
    const fatsGrams = userGoal.macros?.fats?.grams || 0;
    const fatsCalories = userGoal.macros?.fats?.calories || 0;
    
    const proteinGramsEl = document.getElementById('proteinGrams');
    const proteinCaloriesEl = document.getElementById('proteinCalories');
    const carbsGramsEl = document.getElementById('carbsGrams');
    const carbsCaloriesEl = document.getElementById('carbsCalories');
    const fatsGramsEl = document.getElementById('fatsGrams');
    const fatsCaloriesEl = document.getElementById('fatsCalories');
    
    if (proteinGramsEl) proteinGramsEl.textContent = `${proteinGrams} g`;
    if (proteinCaloriesEl) proteinCaloriesEl.textContent = `${proteinCalories} kcal`;
    if (carbsGramsEl) carbsGramsEl.textContent = `${carbsGrams} g`;
    if (carbsCaloriesEl) carbsCaloriesEl.textContent = `${carbsCalories} kcal`;
    if (fatsGramsEl) fatsGramsEl.textContent = `${fatsGrams} g`;
    if (fatsCaloriesEl) fatsCaloriesEl.textContent = `${fatsCalories} kcal`;
    
    const weightDiff = Math.abs((userGoal.targetWeight || 0) - (userGoal.startWeight || 0));
    const goalType = (userGoal.targetWeight || 0) < (userGoal.startWeight || 0) ? 'perdre' : 'gagner';
    
    const weightDiffEl = document.getElementById('weightDifference');
    const timelineDaysEl = document.getElementById('timelineDays');
    const weeklyChangeEl = document.getElementById('weeklyChange');
    const targetDateEl = document.getElementById('targetDateDisplay');
    
    if (weightDiffEl) weightDiffEl.textContent = `${weightDiff.toFixed(1)} (${goalType})`;
    if (timelineDaysEl) timelineDaysEl.textContent = userGoal.targetDuration || 0;
    if (weeklyChangeEl) weeklyChangeEl.textContent = (userGoal.weeklyChange || 0).toFixed(2);
    if (targetDateEl && userGoal.targetDate) {
        targetDateEl.textContent = new Date(userGoal.targetDate).toLocaleDateString('fr-FR');
    }
}

function showValidationMessage(message, type) {
    const validationDiv = document.getElementById('validationMessage');
    validationDiv.className = `alert alert-${type}`;
    validationDiv.textContent = message;
    validationDiv.classList.remove('d-none');
}

// Load all data from localStorage
function loadData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // Load goal
    const goalKey = `goal_${user.email}`;
    const savedGoal = localStorage.getItem(goalKey);
    
    if (savedGoal) {
        try {
            userGoal = JSON.parse(savedGoal);
            
            // Validate goal structure - if macros is missing, recalculate
            if (userGoal && !userGoal.macros && userGoal.targetCalories) {
                console.log('Old goal format detected, updating structure...');
                const targetCalories = userGoal.targetCalories;
                
                const proteinCalories = targetCalories * 0.30;
                const carbsCalories = targetCalories * 0.40;
                const fatsCalories = targetCalories * 0.30;
                
                userGoal.macros = {
                    protein: { 
                        grams: Math.round(proteinCalories / 4), 
                        calories: Math.round(proteinCalories) 
                    },
                    carbs: { 
                        grams: Math.round(carbsCalories / 4), 
                        calories: Math.round(carbsCalories) 
                    },
                    fats: { 
                        grams: Math.round(fatsCalories / 9), 
                        calories: Math.round(fatsCalories) 
                    }
                };
                
                // Save updated goal
                localStorage.setItem(goalKey, JSON.stringify(userGoal));
                console.log('Goal structure updated with macros');
            }
        } catch (error) {
            console.error('Error loading goal:', error);
            userGoal = null;
        }
    } else {
        userGoal = null;
    }
    
    // Load weight history
    const historyKey = `weightHistory_${user.email}`;
    const savedHistory = localStorage.getItem(historyKey);
    weightHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Display calculation results if goal exists
    if (userGoal) {
        displayCalculationResults();
    }
}

// Save weight history
function saveWeightHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const historyKey = `weightHistory_${user.email}`;
    localStorage.setItem(historyKey, JSON.stringify(weightHistory));
}

// Save weigh-in
function saveWeighIn() {
    const date = document.getElementById('weighInDate').value;
    const weight = parseFloat(document.getElementById('weighInWeight').value);
    const notes = document.getElementById('weighInNotes').value;
    
    if (!date || !weight) {
        alert('Veuillez remplir tous les champs requis');
        return;
    }
    
    // Get height from user's profile
    let height = 170; // default
    if (userProfile && userProfile.height) {
        height = userProfile.height;
    }
    
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    
    const weighIn = {
        date,
        weight,
        height,
        bmi,
        notes,
        timestamp: Date.now()
    };
    
    // Check if entry for this date exists
    const existingIndex = weightHistory.findIndex(w => w.date === date);
    if (existingIndex >= 0) {
        weightHistory[existingIndex] = weighIn;
    } else {
        weightHistory.push(weighIn);
    }
    
    // Sort by date
    weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    saveWeightHistory();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('updateWeightModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('updateWeightForm').reset();
    document.getElementById('weighInDate').valueAsDate = new Date();
    
    // Refresh display
    displayGoalSummary();
    displayWeightHistory();
    displayStats();
    updateChart();
    
    showToast('Pesée enregistrée avec succès !', 'success');
}

// Display goal summary
function displayGoalSummary() {
    const summaryDiv = document.getElementById('goalSummary');
    
    if (!userGoal || weightHistory.length === 0) {
        summaryDiv.innerHTML = `
            <i class="fas fa-target fa-3x text-muted mb-3"></i>
            <p class="text-muted">Aucun objectif défini. Créez votre premier objectif pour commencer !</p>
        `;
        return;
    }
    
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    const weightDiff = userGoal.targetWeight - currentWeight;
    const totalChange = userGoal.targetWeight - userGoal.startWeight;
    const progress = totalChange !== 0 ? ((userGoal.startWeight - currentWeight) / totalChange) * 100 : 0;
    
    const today = new Date();
    const targetDate = new Date(userGoal.targetDate);
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    
    const goalIcons = {
        'loss': '<i class="fas fa-arrow-down text-danger"></i>',
        'gain': '<i class="fas fa-arrow-up text-success"></i>',
        'maintain': '<i class="fas fa-equals text-primary"></i>'
    };
    
    summaryDiv.innerHTML = `
        <div class="row text-center">
            <div class="col-md-3">
                <h4>${goalIcons[userGoal.goalType]}</h4>
                <h3 class="text-primary">${userGoal.targetWeight} kg</h3>
                <small class="text-muted">Objectif</small>
            </div>
            <div class="col-md-3">
                <h4><i class="fas fa-calendar-alt text-info"></i></h4>
                <h3 class="text-info">${daysRemaining}</h3>
                <small class="text-muted">Jours restants</small>
            </div>
            <div class="col-md-3">
                <h4><i class="fas fa-balance-scale text-warning"></i></h4>
                <h3 class="text-warning">${Math.abs(weightDiff).toFixed(1)} kg</h3>
                <small class="text-muted">À ${weightDiff > 0 ? 'gagner' : 'perdre'}</small>
            </div>
            <div class="col-md-3">
                <h4><i class="fas fa-chart-line text-success"></i></h4>
                <h3 class="text-success">${Math.max(0, Math.min(100, progress)).toFixed(0)}%</h3>
                <small class="text-muted">Progression</small>
            </div>
        </div>
        <div class="mt-4">
            <div class="progress" style="height: 25px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${Math.max(0, Math.min(100, progress))}%">
                    ${Math.max(0, Math.min(100, progress)).toFixed(0)}%
                </div>
            </div>
        </div>
    `;
}

// Display weight history table
function displayWeightHistory() {
    const tbody = document.getElementById('weightHistoryTable');
    
    if (weightHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucune pesée enregistrée</td></tr>';
        return;
    }
    
    let html = '';
    const reversed = [...weightHistory].reverse();
    
    reversed.forEach((entry, index) => {
        const date = new Date(entry.date);
        const prevWeight = index < reversed.length - 1 ? reversed[index + 1].weight : entry.weight;
        const change = entry.weight - prevWeight;
        const changeText = change !== 0 ? `${change > 0 ? '+' : ''}${change.toFixed(1)} kg` : '--';
        const changeColor = change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-muted';
        
        const bmiColor = entry.bmi < 18.5 ? 'info' : entry.bmi < 25 ? 'success' : entry.bmi < 30 ? 'warning' : 'danger';
        
        html += `
            <tr>
                <td>${date.toLocaleDateString('fr-FR')}</td>
                <td><strong>${entry.weight} kg</strong></td>
                <td><span class="badge bg-${bmiColor}">${entry.bmi}</span></td>
                <td class="${changeColor}">${changeText}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteWeighIn('${entry.date}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Delete weigh-in
function deleteWeighIn(date) {
    if (!confirm('Supprimer cette pesée ?')) return;
    
    weightHistory = weightHistory.filter(w => w.date !== date);
    saveWeightHistory();
    
    displayCurrentStatus();
    displayGoalSummary();
    displayWeightHistory();
    displayStats();
    updateChart();
    
    showToast('Pesée supprimée', 'info');
}

// Display statistics
function displayStats() {
    if (weightHistory.length === 0) {
        document.getElementById('daysStreak').textContent = '0';
        document.getElementById('totalLoss').textContent = '0 kg';
        document.getElementById('totalDays').textContent = '0';
        document.getElementById('progressPercent').textContent = '0%';
        return;
    }
    
    // Total days
    const firstDate = new Date(weightHistory[0].date);
    const lastDate = new Date(weightHistory[weightHistory.length - 1].date);
    const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('totalDays').textContent = totalDays;
    
    // Total weight change
    const firstWeight = weightHistory[0].weight;
    const lastWeight = weightHistory[weightHistory.length - 1].weight;
    const totalChange = lastWeight - firstWeight;
    document.getElementById('totalLoss').textContent = `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg`;
    
    // Calculate streak (days with consecutive entries)
    let streak = 1;
    for (let i = weightHistory.length - 1; i > 0; i--) {
        const current = new Date(weightHistory[i].date);
        const previous = new Date(weightHistory[i - 1].date);
        const daysDiff = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Allow up to 7 days gap
            streak++;
        } else {
            break;
        }
    }
    document.getElementById('daysStreak').textContent = streak;
    
    // Progress percentage
    if (userGoal) {
        const progress = ((userGoal.startWeight - lastWeight) / (userGoal.startWeight - userGoal.targetWeight)) * 100;
        document.getElementById('progressPercent').textContent = Math.max(0, Math.min(100, progress)).toFixed(0) + '%';
    } else {
        document.getElementById('progressPercent').textContent = '0%';
    }
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Poids (kg)',
                data: [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Poids: ' + context.parsed.y + ' kg';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                }
            }
        }
    });
    
    updateChart();
}

// Update chart with current data
function updateChart() {
    if (!chart) return;
    
    const labels = weightHistory.map(w => {
        const date = new Date(w.date);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });
    
    const data = weightHistory.map(w => w.weight);
    
    // Add goal line if exists
    const datasets = [{
        label: 'Poids (kg)',
        data: data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
    }];
    
    if (userGoal) {
        datasets.push({
            label: 'Objectif',
            data: Array(data.length).fill(userGoal.targetWeight),
            borderColor: 'rgb(34, 197, 94)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
        });
    }
    
    chart.data.labels = labels;
    chart.data.datasets = datasets;
    chart.update();
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
