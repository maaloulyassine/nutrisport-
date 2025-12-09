// ===== Shopping List Manager =====

let shoppingList = [];

// Initialize shopping list from localStorage
function initShoppingList() {
    const saved = localStorage.getItem('nutrisport_shopping_list');
    if (saved) {
        shoppingList = JSON.parse(saved);
    }
    console.log('🛒 Shopping List initialized');
}

// Categories for organizing shopping list
const SHOPPING_CATEGORIES = {
    'proteins': {
        name: 'Protéines',
        icon: 'fa-drumstick-bite',
        color: 'danger',
        items: ['poulet', 'boeuf', 'porc', 'dinde', 'saumon', 'thon', 'cabillaud', 'crevettes', 'œufs', 'steak', 'bacon', 'jambon', 'dorade', 'tofu', 'tempeh']
    },
    'dairy': {
        name: 'Produits Laitiers',
        icon: 'fa-cheese',
        color: 'warning',
        items: ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'cottage cheese', 'fromage blanc', 'feta', 'parmesan', 'mozzarella', 'ricotta']
    },
    'grains': {
        name: 'Céréales & Féculents',
        icon: 'fa-bread-slice',
        color: 'info',
        items: ['riz', 'pâtes', 'pain', 'avoine', 'flocons', 'quinoa', 'boulgour', 'semoule', 'tortilla', 'wrap', 'muesli', 'granola', 'céréales', 'patate douce', 'pommes de terre']
    },
    'fruits': {
        name: 'Fruits',
        icon: 'fa-apple-alt',
        color: 'success',
        items: ['pomme', 'banane', 'orange', 'fraise', 'myrtille', 'framboise', 'raisin', 'kiwi', 'mangue', 'ananas', 'poire', 'pêche', 'abricot', 'melon', 'pastèque', 'citron']
    },
    'vegetables': {
        name: 'Légumes',
        icon: 'fa-carrot',
        color: 'success',
        items: ['salade', 'tomate', 'concombre', 'carotte', 'brocoli', 'épinards', 'courgette', 'poivron', 'oignon', 'ail', 'champignon', 'haricots', 'chou', 'asperges', 'aubergine', 'céleri', 'maïs', 'petits pois']
    },
    'nuts': {
        name: 'Fruits Secs & Oléagineux',
        icon: 'fa-seedling',
        color: 'secondary',
        items: ['amandes', 'noix', 'noisettes', 'cacahuètes', 'beurre cacahuète', 'graines chia', 'graines lin', 'noix de cajou', 'pistaches', 'raisins secs']
    },
    'condiments': {
        name: 'Condiments & Sauces',
        icon: 'fa-bottle-droplet',
        color: 'primary',
        items: ['huile olive', 'vinaigre', 'moutarde', 'ketchup', 'mayonnaise', 'sauce soja', 'miel', 'confiture', 'sirop érable', 'houmous', 'sauce curry', 'sauce tomate']
    },
    'supplements': {
        name: 'Compléments',
        icon: 'fa-pills',
        color: 'purple',
        items: ['whey', 'protéine', 'gainer', 'créatine', 'bcaa', 'multivitamines']
    },
    'other': {
        name: 'Autres',
        icon: 'fa-basket-shopping',
        color: 'dark',
        items: []
    }
};

// Categorize an ingredient
function categorizeIngredient(ingredient) {
    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [categoryKey, category] of Object.entries(SHOPPING_CATEGORIES)) {
        for (const item of category.items) {
            if (lowerIngredient.includes(item) || item.includes(lowerIngredient)) {
                return categoryKey;
            }
        }
    }
    
    return 'other';
}

// Add item to shopping list
function addToShoppingList(item, quantity = 1, unit = '') {
    const category = categorizeIngredient(item);
    
    // Check if item already exists
    const existingIndex = shoppingList.findIndex(i => 
        i.name.toLowerCase() === item.toLowerCase()
    );
    
    if (existingIndex !== -1) {
        // Update quantity
        shoppingList[existingIndex].quantity += quantity;
    } else {
        shoppingList.push({
            id: Date.now(),
            name: item,
            quantity: quantity,
            unit: unit,
            category: category,
            checked: false,
            addedAt: new Date().toISOString()
        });
    }
    
    saveShoppingList();
    return true;
}

// Remove item from shopping list
function removeFromShoppingList(itemId) {
    shoppingList = shoppingList.filter(item => item.id !== itemId);
    saveShoppingList();
}

// Toggle item checked status
function toggleShoppingItem(itemId) {
    const item = shoppingList.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        saveShoppingList();
    }
}

// Clear checked items
function clearCheckedItems() {
    shoppingList = shoppingList.filter(item => !item.checked);
    saveShoppingList();
}

// Clear all items
function clearShoppingList() {
    if (confirm('Voulez-vous vraiment vider la liste de courses ?')) {
        shoppingList = [];
        saveShoppingList();
        renderShoppingList();
    }
}

// Save to localStorage
function saveShoppingList() {
    localStorage.setItem('nutrisport_shopping_list', JSON.stringify(shoppingList));
}

// Generate shopping list from meal plan
function generateShoppingListFromMealPlan(mealPlan) {
    const ingredientsList = {};
    
    // Extract all ingredients from meal plan
    for (const day in mealPlan) {
        const dayMeals = mealPlan[day].meals;
        for (const mealType in dayMeals) {
            const meal = dayMeals[mealType];
            if (meal && meal.ingredients) {
                meal.ingredients.forEach(ingredient => {
                    // Parse ingredient (e.g., "poulet 200g" => { name: "poulet", quantity: 200, unit: "g" })
                    const parsed = parseIngredient(ingredient);
                    const key = parsed.name.toLowerCase();
                    
                    if (ingredientsList[key]) {
                        ingredientsList[key].quantity += parsed.quantity;
                    } else {
                        ingredientsList[key] = {
                            name: parsed.name,
                            quantity: parsed.quantity,
                            unit: parsed.unit
                        };
                    }
                });
            }
        }
    }
    
    // Add all ingredients to shopping list
    for (const key in ingredientsList) {
        const item = ingredientsList[key];
        addToShoppingList(item.name, item.quantity, item.unit);
    }
    
    return shoppingList;
}

// Parse ingredient string
function parseIngredient(ingredientStr) {
    // Match patterns like "poulet 200g", "3 œufs", "lait 300ml"
    const patterns = [
        /^(\d+)\s*(.+)$/,           // "3 œufs"
        /^(.+?)\s+(\d+)\s*(g|ml|kg|l)?$/i,  // "poulet 200g"
        /^(.+)$/                     // Just the name
    ];
    
    for (const pattern of patterns) {
        const match = ingredientStr.match(pattern);
        if (match) {
            if (pattern === patterns[0]) {
                return { quantity: parseInt(match[1]), name: match[2].trim(), unit: '' };
            } else if (pattern === patterns[1]) {
                return { name: match[1].trim(), quantity: parseInt(match[2]) || 1, unit: match[3] || '' };
            } else {
                return { name: match[1].trim(), quantity: 1, unit: '' };
            }
        }
    }
    
    return { name: ingredientStr.trim(), quantity: 1, unit: '' };
}

// Render shopping list UI
function renderShoppingList(containerId = 'shoppingListContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Group by category
    const grouped = {};
    for (const category in SHOPPING_CATEGORIES) {
        grouped[category] = shoppingList.filter(item => item.category === category);
    }
    
    let html = '';
    
    // Summary stats
    const totalItems = shoppingList.length;
    const checkedItems = shoppingList.filter(i => i.checked).length;
    
    html += `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-primary me-2">${totalItems} article${totalItems > 1 ? 's' : ''}</span>
                <span class="badge bg-success">${checkedItems} acheté${checkedItems > 1 ? 's' : ''}</span>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-success me-1" onclick="clearCheckedItems()" ${checkedItems === 0 ? 'disabled' : ''}>
                    <i class="fas fa-check-double"></i> Supprimer achetés
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="clearShoppingList()" ${totalItems === 0 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Vider
                </button>
            </div>
        </div>
    `;
    
    // Add item form
    html += `
        <div class="input-group mb-4">
            <span class="input-group-text"><i class="fas fa-plus"></i></span>
            <input type="text" id="newShoppingItem" class="form-control" placeholder="Ajouter un article...">
            <button class="btn btn-primary" onclick="addNewShoppingItem()">
                Ajouter
            </button>
        </div>
    `;
    
    if (totalItems === 0) {
        html += `
            <div class="text-center text-muted py-5">
                <i class="fas fa-shopping-basket fa-4x mb-3 opacity-50"></i>
                <p class="lead">Votre liste de courses est vide</p>
                <p>Ajoutez des articles ou générez une liste depuis votre plan de repas</p>
            </div>
        `;
    } else {
        // Render each category
        for (const [categoryKey, category] of Object.entries(SHOPPING_CATEGORIES)) {
            const items = grouped[categoryKey];
            if (items && items.length > 0) {
                html += `
                    <div class="card mb-3">
                        <div class="card-header bg-${category.color} bg-opacity-10">
                            <h6 class="mb-0">
                                <i class="fas ${category.icon} text-${category.color}"></i> 
                                ${category.name}
                                <span class="badge bg-${category.color} ms-2">${items.length}</span>
                            </h6>
                        </div>
                        <ul class="list-group list-group-flush">
                `;
                
                items.forEach(item => {
                    const checkedClass = item.checked ? 'text-decoration-line-through text-muted' : '';
                    html += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" 
                                    ${item.checked ? 'checked' : ''} 
                                    onchange="toggleShoppingItem(${item.id}); renderShoppingList();">
                                <label class="form-check-label ${checkedClass}">
                                    ${item.name}
                                    ${item.quantity > 1 ? `<span class="text-muted">(×${item.quantity}${item.unit})</span>` : ''}
                                </label>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromShoppingList(${item.id}); renderShoppingList();">
                                <i class="fas fa-times"></i>
                            </button>
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            }
        }
    }
    
    container.innerHTML = html;
    
    // Add enter key listener
    setTimeout(() => {
        const input = document.getElementById('newShoppingItem');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addNewShoppingItem();
                }
            });
        }
    }, 0);
}

// Add new item from input
function addNewShoppingItem() {
    const input = document.getElementById('newShoppingItem');
    if (!input || !input.value.trim()) return;
    
    addToShoppingList(input.value.trim());
    input.value = '';
    renderShoppingList();
    showToast('Article ajouté à la liste !', 'success');
}

// Show toast notification
function showShoppingToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `position-fixed bottom-0 end-0 p-3`;
    toast.style.zIndex = '1100';
    toast.innerHTML = `
        <div class="toast show bg-${type} text-white">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle me-2"></i>
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Export shopping list
function exportShoppingList(format = 'text') {
    if (shoppingList.length === 0) {
        showShoppingToast('La liste est vide !', 'warning');
        return;
    }
    
    if (format === 'text') {
        let text = '🛒 LISTE DE COURSES - NutriSport\n';
        text += '═'.repeat(40) + '\n\n';
        
        // Group by category
        const grouped = {};
        for (const category in SHOPPING_CATEGORIES) {
            grouped[category] = shoppingList.filter(item => item.category === category);
        }
        
        for (const [categoryKey, category] of Object.entries(SHOPPING_CATEGORIES)) {
            const items = grouped[categoryKey];
            if (items && items.length > 0) {
                text += `📌 ${category.name.toUpperCase()}\n`;
                items.forEach(item => {
                    const checkbox = item.checked ? '☑' : '☐';
                    const qty = item.quantity > 1 ? ` (×${item.quantity}${item.unit})` : '';
                    text += `  ${checkbox} ${item.name}${qty}\n`;
                });
                text += '\n';
            }
        }
        
        text += '─'.repeat(40) + '\n';
        text += `Total: ${shoppingList.length} articles\n`;
        text += `Générée le ${new Date().toLocaleDateString('fr-FR')}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showShoppingToast('Liste copiée dans le presse-papier !', 'success');
        });
        
    } else if (format === 'print') {
        const printWindow = window.open('', '_blank');
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Liste de Courses - NutriSport</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
                    h3 { margin-top: 20px; color: #333; }
                    ul { list-style: none; padding: 0; }
                    li { padding: 5px 0; border-bottom: 1px solid #eee; }
                    .checkbox { width: 15px; height: 15px; border: 1px solid #333; display: inline-block; margin-right: 10px; }
                    .checked { background: #28a745; }
                    .footer { margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>🛒 Liste de Courses</h1>
        `;
        
        // Group by category
        const grouped = {};
        for (const category in SHOPPING_CATEGORIES) {
            grouped[category] = shoppingList.filter(item => item.category === category);
        }
        
        for (const [categoryKey, category] of Object.entries(SHOPPING_CATEGORIES)) {
            const items = grouped[categoryKey];
            if (items && items.length > 0) {
                html += `<h3>${category.name}</h3><ul>`;
                items.forEach(item => {
                    const qty = item.quantity > 1 ? ` (×${item.quantity}${item.unit})` : '';
                    html += `<li><span class="checkbox ${item.checked ? 'checked' : ''}"></span>${item.name}${qty}</li>`;
                });
                html += '</ul>';
            }
        }
        
        html += `
                <div class="footer">
                    <p>Total: ${shoppingList.length} articles | Générée le ${new Date().toLocaleDateString('fr-FR')}</p>
                    <p>🏋️ NutriSport - Votre partenaire nutrition</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
}

// Open shopping list modal
function openShoppingList() {
    // Check if modal exists
    let modal = document.getElementById('shoppingListModal');
    if (!modal) {
        // Create modal
        const modalHtml = `
            <div class="modal fade" id="shoppingListModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-shopping-cart"></i> Liste de Courses
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="shoppingListContainer">
                            <!-- Content rendered here -->
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline-secondary" onclick="exportShoppingList('text')">
                                <i class="fas fa-copy"></i> Copier
                            </button>
                            <button class="btn btn-outline-primary" onclick="exportShoppingList('print')">
                                <i class="fas fa-print"></i> Imprimer
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('shoppingListModal');
    }
    
    renderShoppingList('shoppingListContainer');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initShoppingList);

// Export functions
window.shoppingListManager = {
    add: addToShoppingList,
    remove: removeFromShoppingList,
    toggle: toggleShoppingItem,
    clear: clearShoppingList,
    clearChecked: clearCheckedItems,
    generateFromMealPlan: generateShoppingListFromMealPlan,
    render: renderShoppingList,
    export: exportShoppingList,
    open: openShoppingList,
    getList: () => shoppingList
};
