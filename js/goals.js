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

// ===== CONSTANTES SCIENTIFIQUES =====
const SCIENCE = {
    // 1 kg de graisse = 7700 kcal (consensus scientifique)
    KCAL_PER_KG_FAT: 7700,
    
    // Perte de poids saine : 0.5-1% du poids corporel par semaine (ACSM guidelines)
    MAX_WEEKLY_LOSS_PERCENT: 1.0,    // Maximum absolu
    SAFE_WEEKLY_LOSS_PERCENT: 0.75,  // Recommandé
    MIN_WEEKLY_LOSS_PERCENT: 0.5,    // Minimum efficace
    
    // Prise de masse : 0.25-0.5% du poids par semaine (pour minimiser gain de gras)
    MAX_WEEKLY_GAIN_PERCENT: 0.5,
    SAFE_WEEKLY_GAIN_PERCENT: 0.25,
    
    // Déficit calorique (NIH, NHLBI guidelines)
    MAX_DAILY_DEFICIT: 1000,         // Maximum 1000 kcal/jour de déficit
    MIN_DAILY_DEFICIT: 250,          // Minimum pour voir des résultats
    MAX_DEFICIT_PERCENT: 25,         // Maximum 25% sous TDEE
    
    // Calories minimales (pour éviter mode famine et perte musculaire)
    MIN_CALORIES_MALE: 1500,         // Minimum pour hommes
    MIN_CALORIES_FEMALE: 1200,       // Minimum pour femmes
    
    // Surplus calorique pour prise de masse
    MAX_DAILY_SURPLUS: 500,          // Maximum 500 kcal/jour surplus
    SAFE_DAILY_SURPLUS: 300,         // Recommandé pour limiter gain de gras
    
    // Limites biologiques
    MAX_REALISTIC_WEEKLY_LOSS: 1.5,  // Même pour obèses, pas plus
    MIN_HEALTHY_BMI: 18.5,
    MAX_HEALTHY_BMI: 25
};

// Estimer le pourcentage de graisse corporelle (formule US Navy simplifiée)
function estimateBodyFatPercent(weight, height, age, gender) {
    // Formule approximative basée sur IMC (moins précise mais sans mesures)
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Formule Deurenberg (1991) - estimation via IMC
    if (gender === 'male') {
        return (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
        return (1.20 * bmi) + (0.23 * age) - 5.4;
    }
}

// Calculer la masse maigre et grasse
function calculateBodyComposition(weight, bodyFatPercent) {
    const fatMass = weight * (bodyFatPercent / 100);
    const leanMass = weight - fatMass;
    return { fatMass, leanMass, bodyFatPercent };
}

// Validate goal with SCIENTIFIC calculations
function validateGoalFeasibility(currentWeight, targetWeight, durationDays, gender = 'male', age = 30, height = 170, activityLevel = 1.55) {
    const weightChange = targetWeight - currentWeight;
    const absWeightChange = Math.abs(weightChange);
    const durationWeeks = durationDays / 7;
    const weeklyChange = absWeightChange / durationWeeks;
    
    console.log('=== VALIDATION SCIENTIFIQUE ===');
    console.log('Poids actuel:', currentWeight, 'kg');
    console.log('Poids cible:', targetWeight, 'kg');
    console.log('Changement:', weightChange, 'kg en', durationDays, 'jours');
    console.log('Changement hebdo:', weeklyChange.toFixed(2), 'kg/semaine');
    
    const messages = [];
    let isValid = true;
    let severity = 'success';
    let recommendedDuration = null;
    let safeCalories = null;
    
    // Calculs de base
    const bmr = calculateBMR(currentWeight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const bodyFatPercent = estimateBodyFatPercent(currentWeight, height, age, gender);
    const { fatMass, leanMass } = calculateBodyComposition(currentWeight, bodyFatPercent);
    
    // IMC cible
    const heightM = height / 100;
    const targetBMI = targetWeight / (heightM * heightM);
    const currentBMI = currentWeight / (heightM * heightM);
    
    // ===== OBJECTIF DE MAINTIEN =====
    if (absWeightChange === 0 || absWeightChange < 0.5) {
        messages.push({
            type: 'info',
            text: '🎯 Objectif de maintien du poids actuel.'
        });
        messages.push({
            type: 'info',
            text: `📊 Vos besoins quotidiens : ${Math.round(tdee)} kcal/jour`
        });
        return { isValid: true, severity: 'info', messages, weeklyChange: 0, safeCalories: Math.round(tdee) };
    }
    
    // ===== PERTE DE POIDS =====
    if (weightChange < 0) {
        // Calculer le max sûr basé sur le % du poids corporel
        const maxWeeklyLoss = (currentWeight * SCIENCE.MAX_WEEKLY_LOSS_PERCENT) / 100;
        const safeWeeklyLoss = (currentWeight * SCIENCE.SAFE_WEEKLY_LOSS_PERCENT) / 100;
        
        // Calculer le déficit calorique demandé
        const totalCaloriesNeeded = absWeightChange * SCIENCE.KCAL_PER_KG_FAT;
        const dailyDeficitNeeded = totalCaloriesNeeded / durationDays;
        const proposedCalories = tdee - dailyDeficitNeeded;
        
        // Minimum calories basé sur le genre
        const minCalories = gender === 'male' ? SCIENCE.MIN_CALORIES_MALE : SCIENCE.MIN_CALORIES_FEMALE;
        
        // Calculer le déficit maximum possible (TDEE - calories minimum)
        const maxPossibleDeficit = tdee - minCalories;
        const maxPossibleWeeklyLoss = (maxPossibleDeficit * 7) / SCIENCE.KCAL_PER_KG_FAT;
        
        console.log('TDEE:', Math.round(tdee), 'kcal/jour');
        console.log('Déficit demandé:', Math.round(dailyDeficitNeeded), 'kcal/jour');
        console.log('Déficit max possible:', Math.round(maxPossibleDeficit), 'kcal/jour');
        console.log('Perte max possible physiquement:', maxPossibleWeeklyLoss.toFixed(2), 'kg/semaine');
        console.log('Max selon % poids:', maxWeeklyLoss.toFixed(2), 'kg/semaine');
        
        // 🚨 VÉRIFICATION 0: Impossible physiquement (déficit > TDEE - minimum)
        if (dailyDeficitNeeded > maxPossibleDeficit) {
            isValid = false;
            severity = 'danger';
            
            // Calculer la durée minimale basée sur le déficit possible
            const minDaysNeeded = Math.ceil(totalCaloriesNeeded / maxPossibleDeficit);
            recommendedDuration = minDaysNeeded;
            
            messages.push({
                type: 'danger',
                text: `🚫 PHYSIQUEMENT IMPOSSIBLE !`
            });
            messages.push({
                type: 'danger',
                text: `Déficit nécessaire : ${Math.round(dailyDeficitNeeded)} kcal/jour`
            });
            messages.push({
                type: 'danger',
                text: `Votre TDEE (activité ${activityLevel}) : ${Math.round(tdee)} kcal/jour`
            });
            messages.push({
                type: 'warning',
                text: `Déficit max possible : ${Math.round(maxPossibleDeficit)} kcal/jour (TDEE - ${minCalories} kcal minimum)`
            });
            messages.push({
                type: 'info',
                text: `⏱️ Durée minimum : ${minDaysNeeded} jours (${Math.ceil(minDaysNeeded/7)} semaines)`
            });
        }
        // 🚨 VÉRIFICATION 1: Perte trop rapide (% du poids)
        else if (weeklyChange > maxWeeklyLoss || weeklyChange > SCIENCE.MAX_REALISTIC_WEEKLY_LOSS) {
            isValid = false;
            severity = 'danger';
            
            // Calculer la durée réaliste
            recommendedDuration = Math.ceil((absWeightChange / safeWeeklyLoss) * 7);
            
            messages.push({
                type: 'danger',
                text: `🚫 OBJECTIF IMPOSSIBLE ET DANGEREUX !`
            });
            messages.push({
                type: 'danger',
                text: `Vous demandez ${weeklyChange.toFixed(2)} kg/semaine (${((weeklyChange/currentWeight)*100).toFixed(1)}% de votre poids).`
            });
            messages.push({
                type: 'warning',
                text: `📚 Science : Max sûr = ${maxWeeklyLoss.toFixed(2)} kg/semaine (1% du poids) pour préserver vos muscles.`
            });
            messages.push({
                type: 'info',
                text: `⏱️ Durée minimale recommandée : ${recommendedDuration} jours (${Math.ceil(recommendedDuration/7)} semaines)`
            });
        }
        // 🚨 VÉRIFICATION 2: Déficit calorique trop important
        else if (dailyDeficitNeeded > SCIENCE.MAX_DAILY_DEFICIT) {
            isValid = false;
            severity = 'danger';
            
            const safeDuration = Math.ceil(totalCaloriesNeeded / SCIENCE.MAX_DAILY_DEFICIT);
            recommendedDuration = safeDuration;
            
            messages.push({
                type: 'danger',
                text: `🚫 DÉFICIT CALORIQUE DANGEREUX !`
            });
            messages.push({
                type: 'danger',
                text: `Déficit demandé : ${Math.round(dailyDeficitNeeded)} kcal/jour (Max sûr : ${SCIENCE.MAX_DAILY_DEFICIT} kcal/jour)`
            });
            messages.push({
                type: 'warning',
                text: `Un déficit > 1000 kcal/jour cause : perte musculaire, fatigue, carences nutritionnelles.`
            });
            messages.push({
                type: 'info',
                text: `⏱️ Durée minimale : ${safeDuration} jours pour un déficit de 1000 kcal/jour`
            });
        }
        // 🚨 VÉRIFICATION 3: Calories sous le minimum vital
        else if (proposedCalories < minCalories) {
            isValid = false;
            severity = 'danger';
            
            const safeDeficit = tdee - minCalories;
            const safeDuration = Math.ceil(totalCaloriesNeeded / safeDeficit);
            recommendedDuration = safeDuration;
            
            messages.push({
                type: 'danger',
                text: `🚫 CALORIES INSUFFISANTES !`
            });
            messages.push({
                type: 'danger',
                text: `Calories calculées : ${Math.round(proposedCalories)} kcal/jour (Minimum vital : ${minCalories} kcal/jour)`
            });
            messages.push({
                type: 'warning',
                text: `Manger moins de ${minCalories} kcal/jour = Mode famine, ralentissement du métabolisme.`
            });
            messages.push({
                type: 'info',
                text: `⏱️ Durée minimale : ${safeDuration} jours à ${minCalories} kcal/jour`
            });
        }
        // 🚨 VÉRIFICATION 4: Déficit > 25% du TDEE
        else if ((dailyDeficitNeeded / tdee) * 100 > SCIENCE.MAX_DEFICIT_PERCENT) {
            severity = 'warning';
            
            const safeDeficit = tdee * 0.20; // 20% déficit recommandé
            const safeDuration = Math.ceil(totalCaloriesNeeded / safeDeficit);
            
            messages.push({
                type: 'warning',
                text: `⚠️ OBJECTIF AGRESSIF`
            });
            messages.push({
                type: 'warning',
                text: `Déficit de ${((dailyDeficitNeeded/tdee)*100).toFixed(0)}% (recommandé : max 20-25%)`
            });
            messages.push({
                type: 'info',
                text: `Conseillé : ${safeDuration} jours pour un déficit de 20%`
            });
            messages.push({
                type: 'success',
                text: `✓ Techniquement possible, mais risque de fatigue et faim.`
            });
        }
        // ✅ Objectif réaliste
        else {
            messages.push({
                type: 'success',
                text: `✅ OBJECTIF RÉALISTE ET SAIN`
            });
            messages.push({
                type: 'success',
                text: `Perte de ${weeklyChange.toFixed(2)} kg/semaine (${((weeklyChange/currentWeight)*100).toFixed(1)}% de votre poids)`
            });
            messages.push({
                type: 'info',
                text: `📊 Déficit journalier : ${Math.round(dailyDeficitNeeded)} kcal (${((dailyDeficitNeeded/tdee)*100).toFixed(0)}% sous TDEE)`
            });
        }
        
        // Vérifier IMC cible
        if (targetBMI < SCIENCE.MIN_HEALTHY_BMI) {
            isValid = false;
            severity = 'danger';
            messages.push({
                type: 'danger',
                text: `🚫 IMC cible (${targetBMI.toFixed(1)}) = insuffisance pondérale ! Min sain : ${SCIENCE.MIN_HEALTHY_BMI}`
            });
        }
        
        // Calculer calories sûres
        safeCalories = Math.max(minCalories, Math.round(tdee - Math.min(dailyDeficitNeeded, SCIENCE.MAX_DAILY_DEFICIT)));
    }
    // ===== PRISE DE POIDS =====
    else {
        // Calculer le max sûr basé sur le % du poids corporel
        const maxWeeklyGain = (currentWeight * SCIENCE.MAX_WEEKLY_GAIN_PERCENT) / 100;
        const safeWeeklyGain = (currentWeight * SCIENCE.SAFE_WEEKLY_GAIN_PERCENT) / 100;
        
        // Calculer le surplus calorique demandé
        const totalCaloriesNeeded = absWeightChange * SCIENCE.KCAL_PER_KG_FAT;
        const dailySurplusNeeded = totalCaloriesNeeded / durationDays;
        const proposedCalories = tdee + dailySurplusNeeded;
        
        // 🚨 Prise trop rapide
        if (weeklyChange > maxWeeklyGain) {
            isValid = false;
            severity = 'danger';
            
            recommendedDuration = Math.ceil((absWeightChange / safeWeeklyGain) * 7);
            
            messages.push({
                type: 'danger',
                text: `🚫 PRISE DE POIDS TROP RAPIDE !`
            });
            messages.push({
                type: 'danger',
                text: `${weeklyChange.toFixed(2)} kg/semaine = principalement du gras, pas du muscle.`
            });
            messages.push({
                type: 'warning',
                text: `📚 Science : Max ${maxWeeklyGain.toFixed(2)} kg/semaine pour maximiser le muscle.`
            });
            messages.push({
                type: 'info',
                text: `⏱️ Durée recommandée : ${recommendedDuration} jours (${Math.ceil(recommendedDuration/7)} semaines)`
            });
        }
        // Surplus calorique trop important
        else if (dailySurplusNeeded > SCIENCE.MAX_DAILY_SURPLUS) {
            severity = 'warning';
            
            messages.push({
                type: 'warning',
                text: `⚠️ SURPLUS CALORIQUE ÉLEVÉ`
            });
            messages.push({
                type: 'warning',
                text: `Surplus de ${Math.round(dailySurplusNeeded)} kcal/jour (recommandé : ${SCIENCE.SAFE_DAILY_SURPLUS}-${SCIENCE.MAX_DAILY_SURPLUS} kcal)`
            });
            messages.push({
                type: 'info',
                text: `Un surplus > 500 kcal favorise le gain de gras plutôt que le muscle.`
            });
        }
        // ✅ Objectif réaliste
        else {
            messages.push({
                type: 'success',
                text: `✅ OBJECTIF RÉALISTE POUR PRISE DE MASSE`
            });
            messages.push({
                type: 'success',
                text: `Gain de ${weeklyChange.toFixed(2)} kg/semaine (majoritairement du muscle avec entraînement)`
            });
            messages.push({
                type: 'info',
                text: `📊 Surplus journalier : +${Math.round(dailySurplusNeeded)} kcal`
            });
        }
        
        // Vérifier IMC cible
        if (targetBMI > SCIENCE.MAX_HEALTHY_BMI) {
            messages.push({
                type: 'warning',
                text: `⚠️ IMC cible (${targetBMI.toFixed(1)}) = surpoids. Consultez un professionnel.`
            });
        }
        
        safeCalories = Math.round(tdee + Math.min(dailySurplusNeeded, SCIENCE.MAX_DAILY_SURPLUS));
    }
    
    // Ajouter info sur la composition corporelle
    messages.push({
        type: 'info',
        text: `💡 Estimation graisse corporelle : ${bodyFatPercent.toFixed(1)}% (${fatMass.toFixed(1)} kg de gras, ${leanMass.toFixed(1)} kg de masse maigre)`
    });
    
    return { 
        isValid, 
        severity, 
        messages, 
        weeklyChange, 
        recommendedDuration,
        safeCalories,
        bodyComposition: { bodyFatPercent, fatMass, leanMass },
        calculations: { bmr: Math.round(bmr), tdee: Math.round(tdee), currentBMI, targetBMI }
    };
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
    
    // Validate goal feasibility with ALL parameters for scientific calculation
    const validation = validateGoalFeasibility(currentWeight, targetWeight, targetDuration, gender, age, height, parseFloat(activityLevel));
    console.log('Validation result:', validation);
    
    // Display validation message with enhanced formatting
    const validationDiv = document.getElementById('validationMessage');
    if (validationDiv) {
        validationDiv.className = `alert alert-${validation.severity}`;
        validationDiv.innerHTML = `
            <div class="mb-2"><strong>📊 Analyse scientifique de votre objectif</strong></div>
            ${validation.messages.map(msg => 
                `<div class="${msg.type === 'danger' ? 'text-danger fw-bold' : msg.type === 'warning' ? 'text-warning' : msg.type === 'success' ? 'text-success' : ''}">${msg.text}</div>`
            ).join('')}
            ${validation.recommendedDuration ? `<hr><div class="mt-2"><strong>💡 Conseil : </strong>Ajustez la durée à ${validation.recommendedDuration} jours minimum.</div>` : ''}
        `;
        validationDiv.classList.remove('d-none');
    }
    
    if (!validation.isValid) {
        console.warn('Goal not valid, stopping here');
        showToast('⚠️ Objectif rejeté pour votre sécurité. Consultez les recommandations.', 'warning');
        return; // Ne pas sauvegarder si l'objectif est dangereux
    }
    
    console.log('Goal is valid, calculating nutritional needs...');
    
    // Use scientific calculations from validation
    const bmr = validation.calculations.bmr;
    const tdee = validation.calculations.tdee;
    
    // Use safe calories calculated by the validation function
    // This ensures we never go below minimum or exceed safe limits
    const targetCalories = validation.safeCalories || tdee;
    
    console.log('Calculations:', { bmr, tdee, targetCalories, safeCalories: validation.safeCalories });
    
    // Calculate macros based on goal type
    let proteinPercent, carbsPercent, fatsPercent;
    
    if (targetWeight < currentWeight) {
        // Perte de poids : plus de protéines pour préserver le muscle
        proteinPercent = 0.35;
        carbsPercent = 0.35;
        fatsPercent = 0.30;
    } else if (targetWeight > currentWeight) {
        // Prise de masse : plus de glucides pour l'énergie et la récupération
        proteinPercent = 0.30;
        carbsPercent = 0.45;
        fatsPercent = 0.25;
    } else {
        // Maintien : équilibré
        proteinPercent = 0.30;
        carbsPercent = 0.40;
        fatsPercent = 0.30;
    }
    
    const proteinCalories = targetCalories * proteinPercent;
    const carbsCalories = targetCalories * carbsPercent;
    const fatsCalories = targetCalories * fatsPercent;
    
    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatsGrams = Math.round(fatsCalories / 9);
    
    // Vérification protéines minimum (1.6-2.2g/kg pour préserver le muscle)
    const minProteinPerKg = targetWeight < currentWeight ? 2.0 : 1.6;
    const minProteinGrams = Math.round(currentWeight * minProteinPerKg);
    const finalProteinGrams = Math.max(proteinGrams, minProteinGrams);
    
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
            protein: { grams: finalProteinGrams, calories: Math.round(finalProteinGrams * 4) },
            carbs: { grams: carbsGrams, calories: Math.round(carbsCalories) },
            fats: { grams: fatsGrams, calories: Math.round(fatsCalories) }
        },
        weeklyChange: validation.weeklyChange,
        bodyComposition: validation.bodyComposition,
        scientificValidation: {
            maxWeeklyLossPercent: SCIENCE.MAX_WEEKLY_LOSS_PERCENT,
            minCalories: gender === 'male' ? SCIENCE.MIN_CALORIES_MALE : SCIENCE.MIN_CALORIES_FEMALE,
            validatedAt: new Date().toISOString()
        },
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
