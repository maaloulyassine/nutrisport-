// ===== Machine Learning Food Recognition with TensorFlow.js =====
// Utilise MobileNet pré-entraîné pour reconnaissance d'aliments

class MLFoodRecognizer {
    constructor() {
        this.model = null;
        this.isLoading = false;
        this.isReady = false;
    }

    // Charger le modèle MobileNet
    async loadModel() {
        if (this.isReady) return true;
        if (this.isLoading) {
            // Attendre que le chargement en cours se termine
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.isReady;
        }

        try {
            this.isLoading = true;
            console.log('🤖 Chargement du modèle MobileNet...');
            
            // Charger MobileNet (léger et rapide)
            this.model = await mobilenet.load();
            
            this.isReady = true;
            this.isLoading = false;
            console.log('✅ Modèle chargé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur chargement modèle:', error);
            this.isLoading = false;
            this.isReady = false;
            return false;
        }
    }

    // Prédire l'aliment dans une image
    async predict(imageElement) {
        if (!this.isReady) {
            const loaded = await this.loadModel();
            if (!loaded) {
                throw new Error('Impossible de charger le modèle ML');
            }
        }

        try {
            // Obtenir les prédictions (top 5)
            const predictions = await this.model.classify(imageElement, 5);
            
            // Mapper les prédictions aux aliments de notre base
            const mappedPredictions = this.mapToFoodDatabase(predictions);
            
            return mappedPredictions;
        } catch (error) {
            console.error('❌ Erreur prédiction:', error);
            return [];
        }
    }

    // Mapper les prédictions MobileNet à notre base de données
    mapToFoodDatabase(predictions) {
        const foodMappings = {
            // MobileNet label → Notre base de données
            'plate': null, // Ignorer
            'dish': null,
            'bowl': null,
            'cup': null,
            'fork': null,
            'spoon': null,
            'knife': null,
            
            // Viandes
            'chicken': 'poulet grillé',
            'roast': 'poulet grillé',
            'drumstick': 'poulet grillé',
            'steak': 'steak',
            'meat loaf': 'boeuf',
            'beef': 'boeuf',
            'pork': 'porc',
            'bacon': 'porc',
            'sausage': 'porc',
            'hot dog': 'porc',
            'hamburger': 'burger',
            'cheeseburger': 'burger',
            
            // Poissons
            'salmon': 'saumon',
            'tuna': 'thon',
            'fish': 'tilapia',
            'shrimp': 'crevette',
            
            // Féculents
            'rice': 'riz blanc',
            'pasta': 'pâtes',
            'spaghetti': 'spaghetti',
            'macaroni': 'macaroni',
            'noodle': 'pâtes',
            'bread': 'pain',
            'baguette': 'pain',
            'bagel': 'pain',
            'pizza': 'pizza',
            'french fries': 'frites',
            'fries': 'frites',
            'potato': 'pomme de terre',
            'sweet potato': 'patate douce',
            
            // Légumes
            'broccoli': 'brocoli',
            'carrot': 'carotte',
            'tomato': 'tomate',
            'lettuce': 'laitue',
            'salad': 'salade verte',
            'spinach': 'épinard',
            'cucumber': 'concombre',
            'pepper': 'poivron',
            'mushroom': 'champignon',
            'corn': 'maïs',
            'peas': 'petits pois',
            'green beans': 'haricot vert',
            'cauliflower': 'chou-fleur',
            'zucchini': 'courgette',
            'eggplant': 'aubergine',
            
            // Fruits
            'banana': 'banane',
            'apple': 'pomme',
            'orange': 'orange',
            'strawberry': 'fraise',
            'avocado': 'avocat',
            
            // Autres
            'egg': 'oeuf',
            'cheese': 'fromage',
            'yogurt': 'yaourt',
            'milk': 'lait',
            'sandwich': 'sandwich',
            'wrap': 'wrap',
            'taco': 'tacos',
            'burrito': 'wrap',
            'soup': 'soupe',
            'salad': 'salade',
            
            // Fruits supplémentaires
            'kiwi': 'kiwi',
            'pineapple': 'ananas',
            'watermelon': 'pastèque',
            'melon': 'melon',
            'grape': 'raisin',
            'lemon': 'citron',
            'peach': 'pêche',
            'pear': 'poire',
            
            // Légumes supplémentaires
            'onion': 'oignon',
            'garlic': 'ail',
            'cabbage': 'chou',
            'beetroot': 'betterave',
            'turnip': 'navet',
            
            // Féculents supplémentaires
            'quinoa': 'quinoa',
            'couscous': 'couscous',
            'oatmeal': 'avoine',
            'cereal': 'céréales',
            'pretzel': 'bretzel',
            'croissant': 'croissant',
            
            // Protéines supplémentaires
            'turkey': 'dinde',
            'duck': 'canard',
            'lamb': 'agneau',
            'tofu': 'tofu',
            'tempeh': 'tofu',
            'beans': 'haricots',
            'lentils': 'lentilles',
            'chickpeas': 'pois chiches',
            'hummus': 'houmous',
            
            // Produits laitiers
            'butter': 'beurre',
            'cream': 'crème',
            'ice cream': 'glace',
            
            // Snacks
            'cookie': 'cookie',
            'cake': 'gâteau',
            'muffin': 'muffin',
            'brownie': 'brownie',
            'donut': 'donut',
            'chips': 'chips',
            'popcorn': 'popcorn',
            'chocolate': 'chocolat',
            'candy': 'bonbon',
            
            // Boissons
            'coffee': 'café',
            'tea': 'thé',
            'juice': 'jus',
            'smoothie': 'smoothie',
            
            // Condiments
            'sauce': 'sauce',
            'ketchup': 'ketchup',
            'mayonnaise': 'mayonnaise',
            'mustard': 'moutarde'
        };

        const mapped = [];
        
        for (const pred of predictions) {
            const label = pred.className.toLowerCase();
            
            // Chercher une correspondance exacte
            let foodKey = foodMappings[label];
            
            // Si pas de correspondance exacte, chercher une correspondance partielle
            if (!foodKey) {
                for (const [key, value] of Object.entries(foodMappings)) {
                    if (value && label.includes(key)) {
                        foodKey = value;
                        break;
                    }
                }
            }
            
            // Si trouvé et existe dans notre base
            if (foodKey && nutritionDatabase[foodKey]) {
                const foodData = nutritionDatabase[foodKey];
                mapped.push({
                    food: foodKey,
                    score: Math.round(pred.probability * 100),
                    confidence: pred.probability > 0.7 ? 'haute' : pred.probability > 0.4 ? 'moyenne' : 'faible',
                    mlLabel: pred.className,
                    source: 'ML'
                });
            }
        }
        
        // Enlever les doublons
        const unique = [];
        const seen = new Set();
        for (const item of mapped) {
            if (!seen.has(item.food)) {
                seen.add(item.food);
                unique.push(item);
            }
        }
        
        return unique;
    }

    // Vérifier si le modèle est prêt
    isModelReady() {
        return this.isReady;
    }
}

// Instance globale
const mlRecognizer = new MLFoodRecognizer();

// Pré-charger le modèle au chargement de la page (en arrière-plan)
if (typeof mobilenet !== 'undefined') {
    setTimeout(() => {
        mlRecognizer.loadModel().then(() => {
            console.log('🤖 ML Recognizer prêt !');
        });
    }, 2000); // Attendre 2s après le chargement de la page
}
