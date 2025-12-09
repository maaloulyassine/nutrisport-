// ===== Meal Plan Generator =====

// Meal templates by goal
const MEAL_TEMPLATES = {
    'perte-poids': {
        name: 'Perte de Poids',
        macroRatio: { proteins: 0.35, carbs: 0.35, fats: 0.30 },
        mealsPerDay: 4,
        meals: {
            'petit-dejeuner': [
                { name: 'Omelette aux légumes', calories: 280, proteins: 20, carbs: 8, fats: 18, ingredients: ['3 œufs', 'épinards', 'tomates', 'oignons'] },
                { name: 'Yaourt grec protéiné', calories: 200, proteins: 18, carbs: 12, fats: 8, ingredients: ['yaourt grec 0%', 'myrtilles', 'graines de chia'] },
                { name: 'Smoothie vert protéiné', calories: 250, proteins: 25, carbs: 20, fats: 5, ingredients: ['whey', 'épinards', 'banane', 'lait d\'amande'] },
                { name: 'Avoine protéinée', calories: 320, proteins: 22, carbs: 35, fats: 10, ingredients: ['flocons d\'avoine', 'whey', 'beurre de cacahuète'] }
            ],
            'dejeuner': [
                { name: 'Salade poulet grillé', calories: 400, proteins: 45, carbs: 15, fats: 18, ingredients: ['poulet 200g', 'salade mixte', 'avocat', 'vinaigrette légère'] },
                { name: 'Bowl saumon quinoa', calories: 450, proteins: 35, carbs: 40, fats: 16, ingredients: ['saumon 150g', 'quinoa 100g', 'légumes grillés'] },
                { name: 'Wrap thon légumes', calories: 380, proteins: 32, carbs: 28, fats: 14, ingredients: ['thon 150g', 'wrap complet', 'crudités'] },
                { name: 'Steak haché salade', calories: 420, proteins: 40, carbs: 10, fats: 24, ingredients: ['steak 5% 200g', 'grande salade', 'feta'] }
            ],
            'collation': [
                { name: 'Pomme + amandes', calories: 180, proteins: 5, carbs: 20, fats: 10, ingredients: ['1 pomme', '15 amandes'] },
                { name: 'Cottage cheese', calories: 120, proteins: 14, carbs: 5, fats: 4, ingredients: ['cottage cheese 150g', 'concombre'] },
                { name: 'Shake protéiné', calories: 150, proteins: 25, carbs: 5, fats: 3, ingredients: ['whey 30g', 'eau'] }
            ],
            'diner': [
                { name: 'Poisson blanc légumes', calories: 300, proteins: 35, carbs: 15, fats: 10, ingredients: ['cabillaud 200g', 'brocolis', 'haricots verts'] },
                { name: 'Poulet rôti légumes', calories: 350, proteins: 40, carbs: 12, fats: 15, ingredients: ['blanc poulet 200g', 'courgettes', 'poivrons'] },
                { name: 'Salade thon avocat', calories: 380, proteins: 30, carbs: 10, fats: 25, ingredients: ['thon 150g', 'avocat', 'tomates'] }
            ]
        }
    },
    'prise-masse': {
        name: 'Prise de Masse',
        macroRatio: { proteins: 0.30, carbs: 0.45, fats: 0.25 },
        mealsPerDay: 5,
        meals: {
            'petit-dejeuner': [
                { name: 'Pancakes protéinés', calories: 550, proteins: 35, carbs: 60, fats: 18, ingredients: ['3 œufs', 'flocons avoine 80g', 'whey 30g', 'banane', 'sirop érable'] },
                { name: 'Avoine massive', calories: 600, proteins: 30, carbs: 80, fats: 15, ingredients: ['flocons 100g', 'lait entier', 'beurre cacahuète', 'banane', 'miel'] },
                { name: 'Œufs bacon toast', calories: 650, proteins: 35, carbs: 45, fats: 35, ingredients: ['4 œufs', 'bacon 3 tranches', 'pain complet 2 tranches', 'beurre'] }
            ],
            'collation-matin': [
                { name: 'Shake gainer maison', calories: 450, proteins: 30, carbs: 55, fats: 12, ingredients: ['lait 300ml', 'banane', 'whey', 'flocons avoine', 'beurre cacahuète'] },
                { name: 'Sandwich beurre cacahuète', calories: 400, proteins: 15, carbs: 40, fats: 22, ingredients: ['pain complet', 'beurre cacahuète 40g', 'confiture'] }
            ],
            'dejeuner': [
                { name: 'Riz poulet curry', calories: 700, proteins: 50, carbs: 75, fats: 18, ingredients: ['poulet 250g', 'riz 150g cuit', 'sauce curry', 'légumes'] },
                { name: 'Pâtes bolognaise', calories: 750, proteins: 45, carbs: 85, fats: 22, ingredients: ['pâtes 150g', 'boeuf haché 200g', 'sauce tomate', 'parmesan'] },
                { name: 'Bowl saumon patate douce', calories: 680, proteins: 40, carbs: 65, fats: 25, ingredients: ['saumon 200g', 'patate douce 200g', 'avocat'] }
            ],
            'collation-soir': [
                { name: 'Fromage blanc granola', calories: 350, proteins: 25, carbs: 35, fats: 12, ingredients: ['fromage blanc 250g', 'granola 50g', 'miel'] },
                { name: 'Shake post-training', calories: 400, proteins: 40, carbs: 45, fats: 5, ingredients: ['whey 40g', 'lait', 'banane', 'miel'] }
            ],
            'diner': [
                { name: 'Steak riz légumes', calories: 650, proteins: 45, carbs: 60, fats: 22, ingredients: ['steak 200g', 'riz 150g', 'haricots verts', 'huile olive'] },
                { name: 'Saumon quinoa', calories: 600, proteins: 40, carbs: 50, fats: 25, ingredients: ['saumon 200g', 'quinoa 150g', 'asperges'] }
            ]
        }
    },
    'maintien': {
        name: 'Maintien',
        macroRatio: { proteins: 0.30, carbs: 0.40, fats: 0.30 },
        mealsPerDay: 4,
        meals: {
            'petit-dejeuner': [
                { name: 'Tartines complètes', calories: 380, proteins: 15, carbs: 45, fats: 14, ingredients: ['pain complet 2 tranches', 'avocat', 'œuf poché', 'tomates'] },
                { name: 'Porridge fruits', calories: 350, proteins: 12, carbs: 50, fats: 10, ingredients: ['flocons avoine 60g', 'lait', 'banane', 'myrtilles'] }
            ],
            'dejeuner': [
                { name: 'Bowl méditerranéen', calories: 550, proteins: 30, carbs: 50, fats: 24, ingredients: ['poulet 150g', 'riz 100g', 'légumes grillés', 'houmous', 'feta'] },
                { name: 'Salade complète', calories: 480, proteins: 28, carbs: 35, fats: 25, ingredients: ['thon 120g', 'œufs', 'pommes de terre', 'haricots verts'] }
            ],
            'collation': [
                { name: 'Fruits secs mix', calories: 200, proteins: 6, carbs: 25, fats: 10, ingredients: ['noix', 'amandes', 'raisins secs'] },
                { name: 'Yaourt muesli', calories: 220, proteins: 12, carbs: 28, fats: 6, ingredients: ['yaourt nature', 'muesli 40g'] }
            ],
            'diner': [
                { name: 'Pâtes légumes poulet', calories: 520, proteins: 35, carbs: 55, fats: 16, ingredients: ['pâtes 100g', 'poulet 150g', 'légumes', 'huile olive'] },
                { name: 'Poisson grillé légumes', calories: 420, proteins: 38, carbs: 25, fats: 18, ingredients: ['dorade 200g', 'légumes méditerranéens', 'huile olive'] }
            ]
        }
    }
};

// Generate meal plan for a week
function generateMealPlan(goalType = 'maintien', targetCalories = 2000) {
    const template = MEAL_TEMPLATES[goalType] || MEAL_TEMPLATES['maintien'];
    const weekPlan = {};
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach((day, index) => {
        weekPlan[day] = generateDayPlan(template, targetCalories, index);
    });
    
    return {
        goalType: goalType,
        goalName: template.name,
        targetCalories: targetCalories,
        days: weekPlan,
        shoppingList: generateShoppingList(weekPlan),
        macroRatio: template.macroRatio
    };
}

// Generate one day plan
function generateDayPlan(template, targetCalories, seed = 0) {
    const dayMeals = [];
    const mealTypes = Object.keys(template.meals);
    let totalCalories = 0;
    
    // Calculate calories per meal
    const caloriesPerMeal = Math.round(targetCalories / mealTypes.length);
    
    mealTypes.forEach((mealType, index) => {
        const options = template.meals[mealType];
        // Use seed to vary meals each day
        const selectedIndex = (seed + index) % options.length;
        const meal = { ...options[selectedIndex], category: mealType };
        
        // Adjust portion to fit calorie target
        const ratio = caloriesPerMeal / meal.calories;
        if (ratio > 0.7 && ratio < 1.5) {
            meal.adjustedCalories = Math.round(meal.calories * ratio);
            meal.adjustedProteins = Math.round(meal.proteins * ratio);
            meal.adjustedCarbs = Math.round(meal.carbs * ratio);
            meal.adjustedFats = Math.round(meal.fats * ratio);
        } else {
            meal.adjustedCalories = meal.calories;
            meal.adjustedProteins = meal.proteins;
            meal.adjustedCarbs = meal.carbs;
            meal.adjustedFats = meal.fats;
        }
        
        totalCalories += meal.adjustedCalories;
        dayMeals.push(meal);
    });
    
    return {
        meals: dayMeals,
        totalCalories: totalCalories,
        totalProteins: dayMeals.reduce((sum, m) => sum + (m.adjustedProteins || m.proteins), 0),
        totalCarbs: dayMeals.reduce((sum, m) => sum + (m.adjustedCarbs || m.carbs), 0),
        totalFats: dayMeals.reduce((sum, m) => sum + (m.adjustedFats || m.fats), 0)
    };
}

// Generate shopping list from meal plan
function generateShoppingList(weekPlan) {
    const ingredients = {};
    
    Object.values(weekPlan).forEach(day => {
        day.meals.forEach(meal => {
            (meal.ingredients || []).forEach(ingredient => {
                // Parse quantity from ingredient string
                const match = ingredient.match(/^(\d+)?(.+)$/);
                const qty = match && match[1] ? parseInt(match[1]) : 1;
                const name = (match && match[2] ? match[2] : ingredient).trim().toLowerCase();
                
                if (ingredients[name]) {
                    ingredients[name].count += qty;
                } else {
                    ingredients[name] = { name: ingredient, count: qty };
                }
            });
        });
    });
    
    // Categorize ingredients
    const categories = {
        'Protéines': [],
        'Féculents': [],
        'Légumes': [],
        'Fruits': [],
        'Produits laitiers': [],
        'Autres': []
    };
    
    const proteinKeywords = ['poulet', 'boeuf', 'saumon', 'thon', 'œuf', 'poisson', 'steak', 'bacon', 'whey', 'dinde'];
    const starchKeywords = ['riz', 'pâtes', 'pain', 'avoine', 'quinoa', 'patate', 'flocons'];
    const veggieKeywords = ['salade', 'brocoli', 'épinard', 'tomate', 'légume', 'courgette', 'haricot', 'poivron', 'oignon', 'concombre'];
    const fruitKeywords = ['banane', 'pomme', 'myrtille', 'fruit', 'raisin'];
    const dairyKeywords = ['lait', 'yaourt', 'fromage', 'beurre', 'cottage', 'feta'];
    
    Object.entries(ingredients).forEach(([key, item]) => {
        const lowerKey = key.toLowerCase();
        if (proteinKeywords.some(k => lowerKey.includes(k))) {
            categories['Protéines'].push(item);
        } else if (starchKeywords.some(k => lowerKey.includes(k))) {
            categories['Féculents'].push(item);
        } else if (veggieKeywords.some(k => lowerKey.includes(k))) {
            categories['Légumes'].push(item);
        } else if (fruitKeywords.some(k => lowerKey.includes(k))) {
            categories['Fruits'].push(item);
        } else if (dairyKeywords.some(k => lowerKey.includes(k))) {
            categories['Produits laitiers'].push(item);
        } else {
            categories['Autres'].push(item);
        }
    });
    
    return categories;
}

// Display meal plan UI
function showMealPlanGenerator() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const goal = JSON.parse(localStorage.getItem(`goal_${user?.email}`) || '{}');
    const profile = JSON.parse(localStorage.getItem(`profile_${user?.email}`) || '{}');
    
    const currentGoal = goal.type || 'maintien';
    const targetCalories = goal.calories || 2000;
    
    const modalHtml = `
        <div class="modal fade" id="mealPlanModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-alt"></i> Générateur de Plan Repas
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Configuration -->
                        <div class="row mb-4">
                            <div class="col-md-4">
                                <label class="form-label">Objectif</label>
                                <select id="planGoalType" class="form-select">
                                    <option value="perte-poids" ${currentGoal === 'perte-poids' ? 'selected' : ''}>🔥 Perte de poids</option>
                                    <option value="maintien" ${currentGoal === 'maintien' ? 'selected' : ''}>⚖️ Maintien</option>
                                    <option value="prise-masse" ${currentGoal === 'prise-masse' ? 'selected' : ''}>💪 Prise de masse</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Calories cibles/jour</label>
                                <input type="number" id="planTargetCalories" class="form-control" value="${targetCalories}" min="1200" max="5000">
                            </div>
                            <div class="col-md-4 d-flex align-items-end">
                                <button class="btn btn-success w-100" onclick="generateAndDisplayPlan()">
                                    <i class="fas fa-magic"></i> Générer le plan
                                </button>
                            </div>
                        </div>
                        
                        <!-- Plan Display -->
                        <div id="mealPlanDisplay"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" onclick="exportMealPlan()">
                            <i class="fas fa-download"></i> Exporter PDF
                        </button>
                        <button type="button" class="btn btn-warning" onclick="showShoppingList()">
                            <i class="fas fa-shopping-cart"></i> Liste de courses
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existing = document.getElementById('mealPlanModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('mealPlanModal'));
    modal.show();
    
    // Auto-generate
    generateAndDisplayPlan();
}

// Generate and display plan
function generateAndDisplayPlan() {
    const goalType = document.getElementById('planGoalType').value;
    const targetCalories = parseInt(document.getElementById('planTargetCalories').value) || 2000;
    
    const plan = generateMealPlan(goalType, targetCalories);
    window.currentMealPlan = plan;
    
    let html = `
        <div class="alert alert-info">
            <strong>📊 Plan ${plan.goalName}</strong> - ${plan.targetCalories} kcal/jour
            <br>
            <small>Ratio: ${Math.round(plan.macroRatio.proteins * 100)}% P / ${Math.round(plan.macroRatio.carbs * 100)}% G / ${Math.round(plan.macroRatio.fats * 100)}% L</small>
        </div>
        
        <ul class="nav nav-tabs" id="dayTabs" role="tablist">
    `;
    
    Object.keys(plan.days).forEach((day, index) => {
        html += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${index === 0 ? 'active' : ''}" data-bs-toggle="tab" data-bs-target="#day${index}">
                    ${day}
                </button>
            </li>
        `;
    });
    
    html += `</ul><div class="tab-content mt-3">`;
    
    Object.entries(plan.days).forEach(([day, data], index) => {
        html += `
            <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id="day${index}">
                <div class="row mb-3">
                    <div class="col">
                        <span class="badge bg-danger">${data.totalCalories} kcal</span>
                        <span class="badge bg-primary">${data.totalProteins}g P</span>
                        <span class="badge bg-warning">${data.totalCarbs}g G</span>
                        <span class="badge bg-info">${data.totalFats}g L</span>
                    </div>
                </div>
                <div class="row g-3">
        `;
        
        data.meals.forEach(meal => {
            const categoryEmoji = {
                'petit-dejeuner': '🌅',
                'collation-matin': '🍎',
                'dejeuner': '🍽️',
                'collation': '🥤',
                'collation-soir': '🍌',
                'diner': '🌙'
            };
            
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <strong>${categoryEmoji[meal.category] || '🍴'} ${meal.category.replace('-', ' ').toUpperCase()}</strong>
                        </div>
                        <div class="card-body">
                            <h6 class="card-title">${meal.name}</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="badge bg-danger">${meal.adjustedCalories || meal.calories} kcal</span>
                                <span class="badge bg-primary">${meal.adjustedProteins || meal.proteins}g P</span>
                            </div>
                            <small class="text-muted">
                                <strong>Ingrédients:</strong><br>
                                ${(meal.ingredients || []).join(', ')}
                            </small>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-sm btn-outline-success w-100" onclick="addMealToDiary('${meal.name}', ${meal.adjustedCalories || meal.calories}, ${meal.adjustedProteins || meal.proteins}, ${meal.adjustedCarbs || meal.carbs}, ${meal.adjustedFats || meal.fats}, '${meal.category}')">
                                <i class="fas fa-plus"></i> Ajouter au journal
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    html += `</div>`;
    
    document.getElementById('mealPlanDisplay').innerHTML = html;
}

// Add meal from plan to diary
function addMealToDiary(name, calories, proteins, carbs, fats, category) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const today = new Date().toISOString().split('T')[0];
    const diaryKey = `foodDiary_${user.email}`;
    
    let diary = JSON.parse(localStorage.getItem(diaryKey) || '{}');
    if (!diary[today]) diary[today] = [];
    
    const meal = {
        id: Date.now(),
        name: name,
        category: category.includes('dejeuner') ? 'lunch' : category.includes('diner') ? 'dinner' : category.includes('petit') ? 'breakfast' : 'snack',
        calories: calories,
        proteins: proteins,
        carbs: carbs,
        fats: fats,
        quantity: 100,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        source: 'meal-plan'
    };
    
    diary[today].push(meal);
    localStorage.setItem(diaryKey, JSON.stringify(diary));
    
    showToast(`✅ ${name} ajouté au journal !`, 'success');
}

// Show shopping list
function showShoppingList() {
    if (!window.currentMealPlan) {
        alert('Générez d\'abord un plan repas !');
        return;
    }
    
    const list = window.currentMealPlan.shoppingList;
    
    let html = `
        <div class="modal fade" id="shoppingListModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title">
                            <i class="fas fa-shopping-cart"></i> Liste de Courses - Semaine
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
    `;
    
    Object.entries(list).forEach(([category, items]) => {
        if (items.length === 0) return;
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header bg-light">
                        <strong>${category}</strong>
                    </div>
                    <ul class="list-group list-group-flush">
        `;
        
        items.forEach(item => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        <input type="checkbox" class="form-check-input me-2">
                        ${item.name}
                    </span>
                    <span class="badge bg-secondary">${item.count > 1 ? 'x' + item.count : ''}</span>
                </li>
            `;
        });
        
        html += `</ul></div></div>`;
    });
    
    html += `
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-success" onclick="exportShoppingList()">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button type="button" class="btn btn-primary" onclick="printShoppingList()">
                            <i class="fas fa-print"></i> Imprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing
    const existing = document.getElementById('shoppingListModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    new bootstrap.Modal(document.getElementById('shoppingListModal')).show();
}

// Export shopping list
function exportShoppingList() {
    if (!window.currentMealPlan) return;
    
    let text = '🛒 LISTE DE COURSES - NUTRISPORT\n';
    text += '================================\n\n';
    
    Object.entries(window.currentMealPlan.shoppingList).forEach(([category, items]) => {
        if (items.length === 0) return;
        text += `📦 ${category.toUpperCase()}\n`;
        items.forEach(item => {
            text += `   ☐ ${item.name}${item.count > 1 ? ' (x' + item.count + ')' : ''}\n`;
        });
        text += '\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste-courses-nutrisport.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Print shopping list
function printShoppingList() {
    window.print();
}

// Export meal plan to PDF (simple version)
function exportMealPlan() {
    if (!window.currentMealPlan) return;
    
    let text = '📅 PLAN REPAS NUTRISPORT\n';
    text += '========================\n\n';
    text += `Objectif: ${window.currentMealPlan.goalName}\n`;
    text += `Calories: ${window.currentMealPlan.targetCalories} kcal/jour\n\n`;
    
    Object.entries(window.currentMealPlan.days).forEach(([day, data]) => {
        text += `\n━━━━━ ${day.toUpperCase()} ━━━━━\n`;
        text += `Total: ${data.totalCalories} kcal | ${data.totalProteins}g P | ${data.totalCarbs}g G | ${data.totalFats}g L\n\n`;
        
        data.meals.forEach(meal => {
            text += `• ${meal.category.toUpperCase()}: ${meal.name}\n`;
            text += `  ${meal.adjustedCalories || meal.calories} kcal | Ingrédients: ${(meal.ingredients || []).join(', ')}\n`;
        });
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-repas-nutrisport.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Toast
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    alert(message);
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    console.log('📅 Meal Plan Generator loaded');
});

// Export
window.mealPlanGenerator = {
    generate: generateMealPlan,
    show: showMealPlanGenerator,
    showShoppingList: showShoppingList
};
