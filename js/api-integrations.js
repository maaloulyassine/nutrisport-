// ===== API Integrations Gratuites pour Améliorer la Reconnaissance =====
// Utilise des APIs gratuites pour enrichir les données nutritionnelles

class APIIntegrations {
    constructor() {
        // APIs gratuites disponibles
        this.apis = {
            // USDA FoodData Central - Base de données nutritionnelle officielle US
            usda: {
                enabled: false, // Désactivé - limite démo trop basse (429 errors)
                baseUrl: 'https://api.nal.usda.gov/fdc/v1',
                apiKey: 'DEMO_KEY', // Clé démo (limitée)
                name: 'USDA FoodData'
            },
            // Edamam Nutrition Analysis - Gratuit jusqu'à 10k requêtes/mois
            edamam: {
                enabled: false, // Désactivé - erreurs
                baseUrl: 'https://api.edamam.com/api/nutrition-details',
                appId: 'edamam-nutrition', // ID par défaut
                appKey: 'd13444a3f6264e01970a7c4f193e1361',
                name: 'Edamam Nutrition'
            },
            // Open Food Facts - 100% gratuit et open source
            openfoodfacts: {
                enabled: false, // Désactivé - erreurs
                baseUrl: 'https://world.openfoodfacts.org/api/v2',
                name: 'Open Food Facts'
            },
            // Spoonacular - 150 requêtes/jour gratuites
            spoonacular: {
                enabled: false, // Désactivé par défaut (nécessite inscription)
                baseUrl: 'https://api.spoonacular.com',
                apiKey: '', // À remplir après inscription
                name: 'Spoonacular'
            }
        };
    }

    // Rechercher un aliment dans USDA
    async searchUSDA(foodName) {
        if (!this.apis.usda.enabled) return null;

        try {
            const url = `${this.apis.usda.baseUrl}/foods/search?query=${encodeURIComponent(foodName)}&pageSize=5&api_key=${this.apis.usda.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('USDA API error');
            
            const data = await response.json();
            
            if (data.foods && data.foods.length > 0) {
                return this.parseUSDAFood(data.foods[0]);
            }
            
            return null;
        } catch (error) {
            console.warn('❌ USDA API Error:', error);
            return null;
        }
    }

    // Parser les données USDA
    parseUSDAFood(food) {
        const nutrients = {};
        
        food.foodNutrients?.forEach(nutrient => {
            const name = nutrient.nutrientName?.toLowerCase();
            if (name.includes('energy')) {
                nutrients.calories = nutrient.value;
            } else if (name.includes('protein')) {
                nutrients.proteins = nutrient.value;
            } else if (name.includes('carbohydrate')) {
                nutrients.carbs = nutrient.value;
            } else if (name.includes('fat') && !name.includes('trans')) {
                nutrients.fats = nutrient.value;
            } else if (name.includes('fiber')) {
                nutrients.fiber = nutrient.value;
            } else if (name.includes('sodium')) {
                nutrients.sodium = nutrient.value;
            }
        });

        return {
            name: food.description,
            ...nutrients,
            source: 'USDA',
            confidence: 'haute'
        };
    }

    // Rechercher dans Open Food Facts (aliments emballés)
    async searchOpenFoodFacts(barcode = null, productName = null) {
        if (!this.apis.openfoodfacts.enabled) return null;

        try {
            let url;
            if (barcode) {
                url = `${this.apis.openfoodfacts.baseUrl}/product/${barcode}.json`;
            } else if (productName) {
                url = `${this.apis.openfoodfacts.baseUrl}/search?search_terms=${encodeURIComponent(productName)}&page_size=5&json=true`;
            } else {
                return null;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('OpenFoodFacts API error');
            
            const data = await response.json();
            
            if (barcode && data.product) {
                return this.parseOpenFoodFactsProduct(data.product);
            } else if (data.products && data.products.length > 0) {
                return this.parseOpenFoodFactsProduct(data.products[0]);
            }
            
            return null;
        } catch (error) {
            console.warn('❌ OpenFoodFacts API Error:', error);
            return null;
        }
    }

    // Parser les données Open Food Facts
    parseOpenFoodFactsProduct(product) {
        const nutriments = product.nutriments || {};
        
        return {
            name: product.product_name || 'Produit inconnu',
            calories: nutriments['energy-kcal_100g'] || nutriments.energy_100g / 4.184 || 0,
            proteins: nutriments.proteins_100g || 0,
            carbs: nutriments.carbohydrates_100g || 0,
            fats: nutriments.fat_100g || 0,
            fiber: nutriments.fiber_100g || 0,
            sodium: nutriments.sodium_100g || 0,
            sugar: nutriments.sugars_100g || 0,
            source: 'OpenFoodFacts',
            confidence: 'haute',
            image: product.image_url,
            brands: product.brands
        };
    }

    // Enrichir les résultats de reconnaissance avec données API
    async enrichFoodData(detectedFoods) {
        console.log('🔄 Enrichissement des données avec APIs...');
        
        const enriched = [];
        
        for (const food of detectedFoods.slice(0, 5)) { // Top 5 seulement
            let apiData = null;
            
            // Essayer USDA d'abord
            if (this.apis.usda.enabled) {
                apiData = await this.searchUSDA(food.food);
            }
            
            // Si pas de résultat, essayer OpenFoodFacts
            if (!apiData && this.apis.openfoodfacts.enabled) {
                apiData = await this.searchOpenFoodFacts(null, food.food);
            }
            
            enriched.push({
                ...food,
                apiData: apiData,
                enriched: !!apiData
            });
        }
        
        console.log(`✅ ${enriched.filter(f => f.enriched).length}/${enriched.length} aliments enrichis`);
        return enriched;
    }

    // Obtenir des suggestions de recettes (Spoonacular)
    async getRecipeSuggestions(ingredients) {
        if (!this.apis.spoonacular.enabled || !this.apis.spoonacular.apiKey) {
            return null;
        }

        try {
            const url = `${this.apis.spoonacular.baseUrl}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients.join(','))}&number=3&apiKey=${this.apis.spoonacular.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Spoonacular API error');
            
            const recipes = await response.json();
            return recipes;
        } catch (error) {
            console.warn('❌ Spoonacular API Error:', error);
            return null;
        }
    }

    // Analyser une recette complète (Edamam)
    async analyzeRecipe(ingredientsList) {
        if (!this.apis.edamam.enabled) return null;

        try {
            const url = `${this.apis.edamam.baseUrl}?app_id=${this.apis.edamam.appId}&app_key=${this.apis.edamam.appKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Mon repas',
                    ingr: ingredientsList
                })
            });
            
            if (!response.ok) throw new Error('Edamam API error');
            
            const data = await response.json();
            return this.parseEdamamNutrition(data);
        } catch (error) {
            console.warn('❌ Edamam API Error:', error);
            return null;
        }
    }

    // Parser nutrition Edamam
    parseEdamamNutrition(data) {
        const nutrients = data.totalNutrients || {};
        
        return {
            calories: nutrients.ENERC_KCAL?.quantity || 0,
            proteins: nutrients.PROCNT?.quantity || 0,
            carbs: nutrients.CHOCDF?.quantity || 0,
            fats: nutrients.FAT?.quantity || 0,
            fiber: nutrients.FIBTG?.quantity || 0,
            sodium: nutrients.NA?.quantity || 0,
            source: 'Edamam'
        };
    }

    // Vérifier la disponibilité des APIs
    async checkAPIsStatus() {
        const status = {};
        
        for (const [key, api] of Object.entries(this.apis)) {
            if (!api.enabled) {
                status[key] = { available: false, reason: 'Désactivée' };
                continue;
            }
            
            try {
                // Test simple pour chaque API
                if (key === 'usda') {
                    const test = await this.searchUSDA('apple');
                    status[key] = { available: !!test, name: api.name };
                } else if (key === 'openfoodfacts') {
                    const test = await this.searchOpenFoodFacts(null, 'nutella');
                    status[key] = { available: !!test, name: api.name };
                } else {
                    status[key] = { available: false, reason: 'Non testée' };
                }
            } catch (error) {
                status[key] = { available: false, reason: error.message };
            }
        }
        
        return status;
    }

    // Activer/désactiver une API
    toggleAPI(apiName, enabled) {
        if (this.apis[apiName]) {
            this.apis[apiName].enabled = enabled;
            console.log(`${apiName} ${enabled ? 'activée' : 'désactivée'}`);
        }
    }

    // Configurer une clé API
    setAPIKey(apiName, key, appId = null) {
        if (this.apis[apiName]) {
            this.apis[apiName].apiKey = key;
            if (appId) this.apis[apiName].appId = appId;
            console.log(`✅ Clé API configurée pour ${apiName}`);
        }
    }
}

// Instance globale
const apiIntegrations = new APIIntegrations();

// Tester les APIs au chargement (optionnel)
if (typeof window !== 'undefined') {
    setTimeout(() => {
        console.log('🔍 Test des APIs disponibles...');
        apiIntegrations.checkAPIsStatus().then(status => {
            console.log('📊 Statut des APIs:', status);
            
            const available = Object.entries(status)
                .filter(([, s]) => s.available)
                .map(([name, s]) => s.name);
            
            if (available.length > 0) {
                console.log(`✅ ${available.length} API(s) disponible(s): ${available.join(', ')}`);
            } else {
                console.log('ℹ️ Aucune API externe activée (mode local uniquement)');
            }
        });
    }, 3000);
}
