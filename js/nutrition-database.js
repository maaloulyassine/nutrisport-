// ===== Nutrition Database pour reconnaissance manuelle =====

const nutritionDatabase = {
    // VIANDES & POISSONS (par 100g)
    'poulet': { name: 'Poulet grillé', calories: 165, proteins: 31, carbs: 0, fats: 3.6, portion: 150 },
    'poulet grillé': { name: 'Poulet grillé', calories: 165, proteins: 31, carbs: 0, fats: 3.6, portion: 150 },
    'poulet frit': { name: 'Poulet frit', calories: 246, proteins: 19, carbs: 12, fats: 15, portion: 150 },
    'dinde': { name: 'Dinde', calories: 135, proteins: 30, carbs: 0, fats: 1, portion: 150 },
    'boeuf': { name: 'Bœuf haché', calories: 250, proteins: 26, carbs: 0, fats: 15, portion: 150 },
    'steak': { name: 'Steak de bœuf', calories: 271, proteins: 25, carbs: 0, fats: 19, portion: 150 },
    'porc': { name: 'Porc', calories: 242, proteins: 27, carbs: 0, fats: 14, portion: 150 },
    'agneau': { name: 'Agneau', calories: 294, proteins: 25, carbs: 0, fats: 21, portion: 150 },
    'saumon': { name: 'Saumon', calories: 208, proteins: 20, carbs: 0, fats: 13, portion: 150 },
    'thon': { name: 'Thon', calories: 132, proteins: 28, carbs: 0, fats: 1, portion: 150 },
    'sardine': { name: 'Sardines', calories: 208, proteins: 25, carbs: 0, fats: 11, portion: 100 },
    'tilapia': { name: 'Tilapia', calories: 96, proteins: 20, carbs: 0, fats: 1.7, portion: 150 },
    'crevette': { name: 'Crevettes', calories: 99, proteins: 24, carbs: 0, fats: 0.3, portion: 100 },
    
    // FÉCULENTS (par 100g cuit)
    'riz': { name: 'Riz blanc cuit', calories: 130, proteins: 2.7, carbs: 28, fats: 0.3, portion: 200 },
    'riz blanc': { name: 'Riz blanc cuit', calories: 130, proteins: 2.7, carbs: 28, fats: 0.3, portion: 200 },
    'riz complet': { name: 'Riz complet cuit', calories: 111, proteins: 2.6, carbs: 23, fats: 0.9, portion: 200 },
    'riz basmati': { name: 'Riz basmati cuit', calories: 121, proteins: 3, carbs: 25, fats: 0.4, portion: 200 },
    'pâtes': { name: 'Pâtes cuites', calories: 131, proteins: 5, carbs: 25, fats: 1.1, portion: 200 },
    'pâtes complètes': { name: 'Pâtes complètes cuites', calories: 124, proteins: 5, carbs: 26, fats: 0.5, portion: 200 },
    'spaghetti': { name: 'Spaghetti cuits', calories: 131, proteins: 5, carbs: 25, fats: 1.1, portion: 200 },
    'macaroni': { name: 'Macaroni cuits', calories: 131, proteins: 5, carbs: 25, fats: 1.1, portion: 200 },
    'penne': { name: 'Penne cuites', calories: 131, proteins: 5, carbs: 25, fats: 1.1, portion: 200 },
    'patate douce': { name: 'Patate douce cuite', calories: 86, proteins: 1.6, carbs: 20, fats: 0.1, portion: 200 },
    'pomme de terre': { name: 'Pomme de terre cuite', calories: 77, proteins: 2, carbs: 17, fats: 0.1, portion: 200 },
    'quinoa': { name: 'Quinoa cuit', calories: 120, proteins: 4.4, carbs: 21, fats: 1.9, portion: 150 },
    'couscous': { name: 'Couscous cuit', calories: 112, proteins: 3.8, carbs: 23, fats: 0.2, portion: 150 },
    'pain': { name: 'Pain blanc', calories: 265, proteins: 8, carbs: 49, fats: 3.2, portion: 60 },
    'pain complet': { name: 'Pain complet', calories: 247, proteins: 13, carbs: 41, fats: 3.4, portion: 60 },
    'tortilla': { name: 'Tortilla', calories: 312, proteins: 8, carbs: 51, fats: 8, portion: 50 },
    
    // LÉGUMES (par 100g)
    'brocoli': { name: 'Brocoli', calories: 34, proteins: 2.8, carbs: 7, fats: 0.4, portion: 150 },
    'carotte': { name: 'Carottes', calories: 41, proteins: 0.9, carbs: 10, fats: 0.2, portion: 100 },
    'tomate': { name: 'Tomates', calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2, portion: 150 },
    'laitue': { name: 'Laitue', calories: 15, proteins: 1.4, carbs: 2.9, fats: 0.2, portion: 100 },
    'épinard': { name: 'Épinards', calories: 23, proteins: 2.9, carbs: 3.6, fats: 0.4, portion: 100 },
    'haricot vert': { name: 'Haricots verts', calories: 31, proteins: 1.8, carbs: 7, fats: 0.1, portion: 150 },
    'courgette': { name: 'Courgettes', calories: 17, proteins: 1.2, carbs: 3.1, fats: 0.3, portion: 150 },
    'aubergine': { name: 'Aubergine', calories: 25, proteins: 1, carbs: 6, fats: 0.2, portion: 150 },
    'poivron': { name: 'Poivrons', calories: 31, proteins: 1, carbs: 6, fats: 0.3, portion: 100 },
    'concombre': { name: 'Concombre', calories: 16, proteins: 0.7, carbs: 3.6, fats: 0.1, portion: 100 },
    'chou-fleur': { name: 'Chou-fleur', calories: 25, proteins: 1.9, carbs: 5, fats: 0.3, portion: 150 },
    'champignon': { name: 'Champignons', calories: 22, proteins: 3.1, carbs: 3.3, fats: 0.3, portion: 100 },
    'salade': { name: 'Salade verte', calories: 15, proteins: 1.4, carbs: 2.9, fats: 0.2, portion: 100 },
    
    // FRUITS
    'banane': { name: 'Banane', calories: 89, proteins: 1.1, carbs: 23, fats: 0.3, portion: 120 },
    'pomme': { name: 'Pomme', calories: 52, proteins: 0.3, carbs: 14, fats: 0.2, portion: 150 },
    'orange': { name: 'Orange', calories: 47, proteins: 0.9, carbs: 12, fats: 0.1, portion: 130 },
    'fraise': { name: 'Fraises', calories: 32, proteins: 0.7, carbs: 8, fats: 0.3, portion: 150 },
    'avocat': { name: 'Avocat', calories: 160, proteins: 2, carbs: 9, fats: 15, portion: 100 },
    
    // PRODUITS LAITIERS
    'yaourt': { name: 'Yaourt nature', calories: 59, proteins: 10, carbs: 3.6, fats: 0.4, portion: 125 },
    'yaourt grec': { name: 'Yaourt grec', calories: 97, proteins: 9, carbs: 3.6, fats: 5, portion: 125 },
    'fromage': { name: 'Fromage', calories: 402, proteins: 25, carbs: 1.3, fats: 33, portion: 30 },
    'lait': { name: 'Lait', calories: 42, proteins: 3.4, carbs: 5, fats: 1, portion: 250 },
    'oeuf': { name: 'Œuf', calories: 155, proteins: 13, carbs: 1.1, fats: 11, portion: 60 },
    'oeufs': { name: 'Œufs', calories: 155, proteins: 13, carbs: 1.1, fats: 11, portion: 60 },
    
    // LÉGUMINEUSES (cuites)
    'lentille': { name: 'Lentilles cuites', calories: 116, proteins: 9, carbs: 20, fats: 0.4, portion: 150 },
    'pois chiche': { name: 'Pois chiches cuits', calories: 164, proteins: 8.9, carbs: 27, fats: 2.6, portion: 150 },
    'haricot rouge': { name: 'Haricots rouges cuits', calories: 127, proteins: 8.7, carbs: 23, fats: 0.5, portion: 150 },
    'haricot noir': { name: 'Haricots noirs cuits', calories: 132, proteins: 8.9, carbs: 24, fats: 0.5, portion: 150 },
    
    // NOIX & GRAINES (par 30g)
    'amande': { name: 'Amandes', calories: 579, proteins: 21, carbs: 22, fats: 49, portion: 30 },
    'noix': { name: 'Noix', calories: 654, proteins: 15, carbs: 14, fats: 65, portion: 30 },
    'cacahuète': { name: 'Cacahuètes', calories: 567, proteins: 26, carbs: 16, fats: 49, portion: 30 },
    'noix de cajou': { name: 'Noix de cajou', calories: 553, proteins: 18, carbs: 30, fats: 44, portion: 30 },
    'pistache': { name: 'Pistaches', calories: 562, proteins: 20, carbs: 28, fats: 45, portion: 30 },
    'noisette': { name: 'Noisettes', calories: 628, proteins: 15, carbs: 17, fats: 61, portion: 30 },
    'graines de chia': { name: 'Graines de chia', calories: 486, proteins: 17, carbs: 42, fats: 31, portion: 30 },
    'graines de lin': { name: 'Graines de lin', calories: 534, proteins: 18, carbs: 29, fats: 42, portion: 30 },
    'graines de courge': { name: 'Graines de courge', calories: 559, proteins: 30, carbs: 14, fats: 49, portion: 30 },
    'graines de tournesol': { name: 'Graines de tournesol', calories: 584, proteins: 21, carbs: 20, fats: 51, portion: 30 },
    
    // FAST FOOD & PLATS PRÉPARÉS
    'pizza': { name: 'Pizza fromage', calories: 266, proteins: 11, carbs: 33, fats: 10, portion: 200 },
    'pizza margherita': { name: 'Pizza Margherita', calories: 250, proteins: 10, carbs: 31, fats: 9, portion: 200 },
    'pizza pepperoni': { name: 'Pizza Pepperoni', calories: 298, proteins: 12, carbs: 35, fats: 13, portion: 200 },
    'pizza 4 fromages': { name: 'Pizza 4 Fromages', calories: 310, proteins: 14, carbs: 32, fats: 15, portion: 200 },
    'burger': { name: 'Burger simple', calories: 295, proteins: 17, carbs: 28, fats: 13, portion: 150 },
    'big burger': { name: 'Big Burger', calories: 540, proteins: 25, carbs: 45, fats: 28, portion: 250 },
    'cheeseburger': { name: 'Cheeseburger', calories: 303, proteins: 15, carbs: 28, fats: 14, portion: 120 },
    'frites': { name: 'Frites', calories: 312, proteins: 3.4, carbs: 41, fats: 15, portion: 150 },
    'frites maison': { name: 'Frites maison', calories: 280, proteins: 3.5, carbs: 38, fats: 13, portion: 150 },
    'sandwich': { name: 'Sandwich poulet', calories: 260, proteins: 18, carbs: 30, fats: 7, portion: 180 },
    'sandwich thon': { name: 'Sandwich thon', calories: 280, proteins: 15, carbs: 32, fats: 10, portion: 180 },
    'sandwich jambon': { name: 'Sandwich jambon-beurre', calories: 350, proteins: 15, carbs: 35, fats: 16, portion: 180 },
    'wrap': { name: 'Wrap poulet', calories: 280, proteins: 20, carbs: 32, fats: 8, portion: 200 },
    'wrap végétarien': { name: 'Wrap végétarien', calories: 240, proteins: 8, carbs: 35, fats: 7, portion: 200 },
    'kebab': { name: 'Kebab', calories: 574, proteins: 28, carbs: 51, fats: 28, portion: 350 },
    'tacos': { name: 'Tacos', calories: 226, proteins: 9, carbs: 20, fats: 13, portion: 150 },
    'burrito': { name: 'Burrito', calories: 380, proteins: 18, carbs: 50, fats: 12, portion: 300 },
    'quesadilla': { name: 'Quesadilla', calories: 330, proteins: 16, carbs: 35, fats: 14, portion: 200 },
    'hot dog': { name: 'Hot-dog', calories: 290, proteins: 11, carbs: 25, fats: 17, portion: 150 },
    'nuggets poulet': { name: 'Nuggets de poulet', calories: 296, proteins: 15, carbs: 18, fats: 18, portion: 100 },
    'fish and chips': { name: 'Fish & Chips', calories: 450, proteins: 20, carbs: 45, fats: 22, portion: 300 },
    
    // SAUCES & CONDIMENTS (par 10ml)
    'huile': { name: 'Huile (olive/tournesol)', calories: 884, proteins: 0, carbs: 0, fats: 100, portion: 10 },
    "huile d'olive": { name: "Huile d'olive", calories: 884, proteins: 0, carbs: 0, fats: 100, portion: 10 },
    'beurre': { name: 'Beurre', calories: 717, proteins: 0.9, carbs: 0.1, fats: 81, portion: 10 },
    'mayonnaise': { name: 'Mayonnaise', calories: 680, proteins: 1, carbs: 1, fats: 75, portion: 15 },
    'ketchup': { name: 'Ketchup', calories: 112, proteins: 1, carbs: 27, fats: 0.1, portion: 15 },
    'moutarde': { name: 'Moutarde', calories: 66, proteins: 4, carbs: 6, fats: 4, portion: 15 },
    'sauce soja': { name: 'Sauce soja', calories: 53, proteins: 5, carbs: 5, fats: 0.1, portion: 15 },
    'sauce tomate': { name: 'Sauce tomate', calories: 32, proteins: 1.5, carbs: 7, fats: 0.2, portion: 50 },
    'pesto': { name: 'Pesto', calories: 430, proteins: 5, carbs: 4, fats: 45, portion: 30 },
    'sauce barbecue': { name: 'Sauce BBQ', calories: 172, proteins: 0.8, carbs: 41, fats: 0.5, portion: 30 },
    'sauce curry': { name: 'Sauce curry', calories: 150, proteins: 2, carbs: 12, fats: 10, portion: 50 },
    'vinaigrette': { name: 'Vinaigrette', calories: 449, proteins: 0, carbs: 16, fats: 45, portion: 30 },
    'crème fraîche': { name: 'Crème fraîche', calories: 340, proteins: 2.5, carbs: 3, fats: 35, portion: 30 },
    'guacamole': { name: 'Guacamole', calories: 160, proteins: 2, carbs: 9, fats: 15, portion: 50 },
    'hummus': { name: 'Houmous', calories: 166, proteins: 8, carbs: 14, fats: 10, portion: 50 },
    'salsa': { name: 'Salsa', calories: 36, proteins: 1.5, carbs: 8, fats: 0.2, portion: 50 },
    'tzatziki': { name: 'Tzatziki', calories: 95, proteins: 4, carbs: 6, fats: 6, portion: 50 }
};

// AJOUT: Plats composés et recettes populaires
const composedDishes = {
    'poulet riz brocoli': {
        name: 'Poulet Riz Brocoli',
        components: [
            { food: 'poulet grillé', grams: 150 },
            { food: 'riz blanc', grams: 200 },
            { food: 'brocoli', grams: 150 }
        ]
    },
    'pâtes bolognaise': {
        name: 'Pâtes Bolognaise',
        components: [
            { food: 'pâtes', grams: 200 },
            { food: 'boeuf', grams: 100 },
            { food: 'sauce tomate', grams: 100 }
        ]
    },
    'salade caesar': {
        name: 'Salade Caesar',
        components: [
            { food: 'laitue', grams: 100 },
            { food: 'poulet grillé', grams: 100 },
            { food: 'fromage', grams: 30 },
            { food: 'pain', grams: 40 }
        ]
    },
    'omelette complète': {
        name: 'Omelette Complète',
        components: [
            { food: 'oeuf', grams: 180 }, // 3 oeufs
            { food: 'fromage', grams: 30 },
            { food: 'jambon', grams: 50 }
        ]
    },
    'bowl végétarien': {
        name: 'Bowl Végétarien',
        components: [
            { food: 'quinoa', grams: 150 },
            { food: 'pois chiche', grams: 100 },
            { food: 'avocat', grams: 100 },
            { food: 'tomate', grams: 100 }
        ]
    }
};

// SOUPES & POTAGES (par 250ml)
const soups = {
    'soupe de légumes': { name: 'Soupe de légumes', calories: 50, proteins: 2, carbs: 10, fats: 0.5, portion: 250 },
    'soupe de tomate': { name: 'Soupe de tomate', calories: 74, proteins: 2, carbs: 16, fats: 0.5, portion: 250 },
    'soupe poulet nouilles': { name: 'Soupe poulet et nouilles', calories: 108, proteins: 8, carbs: 14, fats: 2, portion: 250 },
    'minestrone': { name: 'Minestrone', calories: 90, proteins: 4, carbs: 16, fats: 1.5, portion: 250 },
    'gaspacho': { name: 'Gaspacho', calories: 46, proteins: 1.5, carbs: 9, fats: 0.5, portion: 250 },
    'soupe miso': { name: 'Soupe miso', calories: 40, proteins: 3, carbs: 5, fats: 1, portion: 250 },
    'soupe oignon': { name: "Soupe à l'oignon", calories: 120, proteins: 4, carbs: 15, fats: 5, portion: 250 },
    'potage': { name: 'Potage', calories: 65, proteins: 2, carbs: 12, fats: 1, portion: 250 },
    'velouté': { name: 'Velouté', calories: 95, proteins: 3, carbs: 10, fats: 5, portion: 250 },
    'bisque': { name: 'Bisque de homard', calories: 140, proteins: 6, carbs: 8, fats: 9, portion: 250 },
    'soupe potiron': { name: 'Soupe de potiron', calories: 70, proteins: 2, carbs: 14, fats: 1, portion: 250 },
    'soupe lentilles': { name: 'Soupe de lentilles', calories: 130, proteins: 8, carbs: 22, fats: 1, portion: 250 }
};

// DESSERTS (portions variées)
const desserts = {
    'glace vanille': { name: 'Glace vanille', calories: 207, proteins: 3.5, carbs: 24, fats: 11, portion: 100 },
    'glace chocolat': { name: 'Glace chocolat', calories: 216, proteins: 3.8, carbs: 28, fats: 11, portion: 100 },
    'yaourt glacé': { name: 'Yaourt glacé', calories: 127, proteins: 3.2, carbs: 22, fats: 3, portion: 100 },
    'brownie': { name: 'Brownie', calories: 466, proteins: 6, carbs: 63, fats: 21, portion: 100 },
    'cookie': { name: 'Cookie chocolat', calories: 502, proteins: 5.5, carbs: 64, fats: 25, portion: 100 },
    'muffin': { name: 'Muffin', calories: 377, proteins: 6, carbs: 51, fats: 17, portion: 100 },
    'gâteau chocolat': { name: 'Gâteau au chocolat', calories: 389, proteins: 5, carbs: 50, fats: 19, portion: 100 },
    'tarte pommes': { name: 'Tarte aux pommes', calories: 237, proteins: 2, carbs: 34, fats: 11, portion: 100 },
    'crème brûlée': { name: 'Crème brûlée', calories: 296, proteins: 5, carbs: 28, fats: 18, portion: 100 },
    'tiramisu': { name: 'Tiramisu', calories: 315, proteins: 6, carbs: 35, fats: 16, portion: 100 },
    'mousse chocolat': { name: 'Mousse au chocolat', calories: 301, proteins: 6, carbs: 26, fats: 19, portion: 100 },
    'crêpe': { name: 'Crêpe nature', calories: 227, proteins: 6, carbs: 28, fats: 9, portion: 100 },
    'gaufre': { name: 'Gaufre', calories: 291, proteins: 6, carbs: 37, fats: 13, portion: 100 },
    'donut': { name: 'Donut', calories: 452, proteins: 5, carbs: 51, fats: 25, portion: 100 },
    'éclair': { name: 'Éclair au chocolat', calories: 262, proteins: 6, carbs: 25, fats: 15, portion: 100 },
    'macaron': { name: 'Macaron', calories: 390, proteins: 6, carbs: 62, fats: 13, portion: 100 },
    'tarte citron': { name: 'Tarte au citron', calories: 318, proteins: 3, carbs: 40, fats: 16, portion: 100 },
    'cheesecake': { name: 'Cheesecake', calories: 321, proteins: 5.5, carbs: 25, fats: 23, portion: 100 }
};

// PETIT DÉJEUNER (portions variées)
const breakfast = {
    'porridge': { name: 'Porridge (flocons avoine)', calories: 68, proteins: 2.5, carbs: 12, fats: 1.4, portion: 100 },
    'muesli': { name: 'Muesli', calories: 363, proteins: 10, carbs: 66, fats: 6, portion: 100 },
    'granola': { name: 'Granola', calories: 471, proteins: 10, carbs: 64, fats: 20, portion: 100 },
    'pancakes': { name: 'Pancakes', calories: 227, proteins: 6, carbs: 28, fats: 10, portion: 100 },
    'french toast': { name: 'Pain perdu', calories: 270, proteins: 8, carbs: 36, fats: 10, portion: 100 },
    'croissant': { name: 'Croissant', calories: 406, proteins: 8, carbs: 46, fats: 21, portion: 100 },
    'pain au chocolat': { name: 'Pain au chocolat', calories: 414, proteins: 7, carbs: 45, fats: 23, portion: 100 },
    'céréales': { name: 'Céréales (corn flakes)', calories: 357, proteins: 7, carbs: 84, fats: 0.9, portion: 100 },
    'smoothie bowl': { name: 'Smoothie bowl', calories: 150, proteins: 4, carbs: 30, fats: 2, portion: 300 },
    'bagel': { name: 'Bagel nature', calories: 257, proteins: 10, carbs: 50, fats: 2, portion: 100 },
    'brioche': { name: 'Brioche', calories: 375, proteins: 8, carbs: 52, fats: 15, portion: 100 },
    'pain complet': { name: 'Pain complet', calories: 247, proteins: 13, carbs: 41, fats: 3, portion: 100 }
};

// CUISINE INTERNATIONALE (portions variées)
const international = {
    'sushi': { name: 'Sushi (6 pièces)', calories: 200, proteins: 9, carbs: 30, fats: 4, portion: 150 },
    'sashimi': { name: 'Sashimi', calories: 127, proteins: 20, carbs: 0, fats: 5, portion: 100 },
    'ramen': { name: 'Ramen', calories: 436, proteins: 22, carbs: 65, fats: 10, portion: 400 },
    'pad thai': { name: 'Pad Thai', calories: 364, proteins: 17, carbs: 50, fats: 11, portion: 300 },
    'curry indien': { name: 'Curry indien (poulet)', calories: 180, proteins: 15, carbs: 12, fats: 9, portion: 250 },
    'paella': { name: 'Paella', calories: 175, proteins: 12, carbs: 22, fats: 5, portion: 250 },
    'couscous': { name: 'Couscous', calories: 112, proteins: 3.8, carbs: 23, fats: 0.2, portion: 100 },
    'tajine': { name: 'Tajine', calories: 130, proteins: 10, carbs: 15, fats: 4, portion: 250 },
    'falafel': { name: 'Falafel (3 pièces)', calories: 333, proteins: 13, carbs: 32, fats: 18, portion: 100 },
    'spring rolls': { name: 'Rouleaux de printemps', calories: 153, proteins: 6, carbs: 22, fats: 5, portion: 100 },
    'dim sum': { name: 'Dim sum (3 pièces)', calories: 150, proteins: 8, carbs: 20, fats: 4, portion: 100 },
    'biryani': { name: 'Biryani', calories: 200, proteins: 12, carbs: 30, fats: 5, portion: 250 },
    'pho': { name: 'Pho vietnamien', calories: 194, proteins: 15, carbs: 25, fats: 3, portion: 400 },
    'kimchi': { name: 'Kimchi', calories: 15, proteins: 1, carbs: 2, fats: 0.5, portion: 100 },
    'empanada': { name: 'Empanada', calories: 260, proteins: 8, carbs: 28, fats: 13, portion: 100 },
    'chimichanga': { name: 'Chimichanga', calories: 350, proteins: 15, carbs: 40, fats: 15, portion: 200 }
};

// Combiner toutes les bases de données
Object.assign(nutritionDatabase, soups, desserts, breakfast, international);

// Fonction pour rechercher un aliment
function searchFood(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Recherche exacte
    if (nutritionDatabase[lowerQuery]) {
        return nutritionDatabase[lowerQuery];
    }
    
    // Recherche partielle
    const partial = Object.keys(nutritionDatabase).find(key => 
        key.includes(lowerQuery) || lowerQuery.includes(key)
    );
    
    if (partial) {
        return nutritionDatabase[partial];
    }
    
    return null;
}

// Fonction pour calculer les valeurs nutritionnelles
function calculateNutrition(foodKey, grams) {
    const food = nutritionDatabase[foodKey] || searchFood(foodKey);
    if (!food) return null;
    
    const ratio = grams / 100;
    return {
        dishName: food.name,
        calories: Math.round(food.calories * ratio),
        proteins: Math.round(food.proteins * ratio * 10) / 10,
        carbs: Math.round(food.carbs * ratio * 10) / 10,
        fats: Math.round(food.fats * ratio * 10) / 10
    };
}

// Export pour utilisation dans chatbot.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { nutritionDatabase, searchFood, calculateNutrition };
}
