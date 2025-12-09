// ===== Advanced Local Image Analyzer =====
// Analyse visuelle locale des aliments sans API

class ImageAnalyzer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Analyser une image et retourner les aliments détectés
    async analyzeImage(imageDataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Redimensionner pour performance
                this.canvas.width = 300;
                this.canvas.height = 300;
                this.ctx.drawImage(img, 0, 0, 300, 300);
                
                // Extraire les caractéristiques visuelles
                const features = this.extractFeatures();
                
                // Matcher avec la base de données
                const matches = this.matchFoods(features);
                
                resolve(matches);
            };
            img.src = imageDataUrl;
        });
    }

    // Extraire les caractéristiques visuelles
    extractFeatures() {
        const imageData = this.ctx.getImageData(0, 0, 300, 300);
        const pixels = imageData.data;
        
        const features = {
            dominantColors: this.getDominantColors(pixels),
            colorDistribution: this.getColorDistribution(pixels),
            brightness: this.getAverageBrightness(pixels),
            texture: this.analyzeTexture(pixels),
            shapes: this.detectShapes(pixels)
        };
        
        return features;
    }

    // Obtenir les couleurs dominantes (top 3)
    getDominantColors(pixels) {
        const colorCounts = {};
        
        // Échantillonner tous les 10 pixels pour performance
        for (let i = 0; i < pixels.length; i += 40) {
            const r = Math.floor(pixels[i] / 30) * 30;
            const g = Math.floor(pixels[i + 1] / 30) * 30;
            const b = Math.floor(pixels[i + 2] / 30) * 30;
            const key = `${r},${g},${b}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        
        // Trier et retourner top 3
        const sorted = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([color]) => {
                const [r, g, b] = color.split(',').map(Number);
                return { r, g, b, hsl: this.rgbToHsl(r, g, b) };
            });
        
        return sorted;
    }

    // Distribution des couleurs par catégorie
    getColorDistribution(pixels) {
        let white = 0, yellow = 0, brown = 0, green = 0, red = 0, orange = 0;
        const total = pixels.length / 4;
        
        for (let i = 0; i < pixels.length; i += 40) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const hsl = this.rgbToHsl(r, g, b);
            
            // Classifier par teinte et luminosité
            if (hsl.l > 0.8) white++;
            else if (hsl.h >= 40 && hsl.h <= 60 && hsl.s > 0.3) yellow++;
            else if (hsl.h >= 20 && hsl.h <= 40 && hsl.l < 0.5) brown++;
            else if (hsl.h >= 80 && hsl.h <= 150) green++;
            else if (hsl.h >= 0 && hsl.h <= 20) red++;
            else if (hsl.h >= 20 && hsl.h <= 40) orange++;
        }
        
        return {
            white: (white / total) * 100,
            yellow: (yellow / total) * 100,
            brown: (brown / total) * 100,
            green: (green / total) * 100,
            red: (red / total) * 100,
            orange: (orange / total) * 100
        };
    }

    // Luminosité moyenne
    getAverageBrightness(pixels) {
        let sum = 0;
        for (let i = 0; i < pixels.length; i += 40) {
            sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        }
        return sum / (pixels.length / 40) / 255;
    }

    // Analyser la texture (variation de luminosité)
    analyzeTexture(pixels) {
        const brightness = [];
        for (let i = 0; i < pixels.length; i += 40) {
            brightness.push((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
        }
        
        // Calculer variance (texture rugueuse = haute variance)
        const mean = brightness.reduce((a, b) => a + b) / brightness.length;
        const variance = brightness.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / brightness.length;
        
        return {
            variance: variance,
            smoothness: variance < 1000 ? 'lisse' : variance < 3000 ? 'moyen' : 'rugueux'
        };
    }

    // Détecter les formes basiques
    detectShapes(pixels) {
        // Analyse simple: détecter si grains séparés ou forme continue
        const edges = this.detectEdges(pixels);
        const grainCount = this.countGrains(edges);
        
        return {
            hasGrains: grainCount > 100,
            grainCount: grainCount,
            pattern: grainCount > 100 ? 'granuleux' : grainCount > 20 ? 'morceaux' : 'uniforme'
        };
    }

    // Détection de contours simplifiée
    detectEdges(pixels) {
        const width = 300;
        const edges = [];
        
        for (let y = 1; y < 299; y++) {
            for (let x = 1; x < 299; x++) {
                const i = (y * width + x) * 4;
                const current = pixels[i];
                const right = pixels[i + 4];
                const bottom = pixels[i + width * 4];
                
                const diff = Math.abs(current - right) + Math.abs(current - bottom);
                if (diff > 50) edges.push({ x, y });
            }
        }
        
        return edges;
    }

    // Compter les "grains" (régions distinctes)
    countGrains(edges) {
        // Simplification: nombre de transitions de contour
        return Math.floor(edges.length / 10);
    }

    // Convertir RGB en HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        
        let h = 0, s = 0;
        
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100) / 100,
            l: Math.round(l * 100) / 100
        };
    }

    // Matcher les caractéristiques avec les aliments
    matchFoods(features) {
        const matches = [];
        
        // Base de signatures visuelles pour aliments courants (AMÉLIORÉE)
        const foodSignatures = {
            'riz blanc': {
                colors: { white: 50, yellow: 20 },
                pattern: ['granuleux', 'uniforme'],
                brightnessRange: [0.6, 0.85],
                score: 0
            },
            'riz complet': {
                colors: { brown: 40, yellow: 25 },
                pattern: ['granuleux'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'pâtes': {
                colors: { yellow: 35, white: 25, brown: 15 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'spaghetti': {
                colors: { yellow: 40, white: 20 },
                pattern: ['uniforme'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'poulet grillé': {
                colors: { white: 35, brown: 25, yellow: 15 },
                pattern: ['morceaux', 'uniforme'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'poulet frit': {
                colors: { brown: 40, yellow: 25, orange: 15 },
                pattern: ['morceaux'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'boeuf': {
                colors: { brown: 45, red: 25 },
                pattern: ['morceaux', 'uniforme'],
                brightnessRange: [0.3, 0.5],
                score: 0
            },
            'steak': {
                colors: { brown: 50, red: 20 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.3, 0.5],
                score: 0
            },
            'saumon': {
                colors: { orange: 40, red: 20, white: 15 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.45, 0.65],
                score: 0
            },
            'frites': {
                colors: { yellow: 45, brown: 20, orange: 15 },
                pattern: ['morceaux'],
                brightnessRange: [0.5, 0.65],
                score: 0
            },
            'brocoli': {
                colors: { green: 60, yellow: 10 },
                pattern: ['rugueux', 'morceaux'],
                brightnessRange: [0.35, 0.55],
                score: 0
            },
            'carottes': {
                colors: { orange: 55, red: 15, yellow: 10 },
                pattern: ['morceaux', 'uniforme'],
                brightnessRange: [0.45, 0.6],
                score: 0
            },
            'tomates': {
                colors: { red: 55, orange: 15 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.45, 0.6],
                score: 0
            },
            'laitue': {
                colors: { green: 65, white: 10, yellow: 10 },
                pattern: ['rugueux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'salade verte': {
                colors: { green: 60, white: 15 },
                pattern: ['rugueux', 'morceaux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'pain': {
                colors: { brown: 40, yellow: 25, white: 15 },
                pattern: ['uniforme'],
                brightnessRange: [0.45, 0.6],
                score: 0
            },
            'pain complet': {
                colors: { brown: 50, yellow: 15 },
                pattern: ['uniforme', 'granuleux'],
                brightnessRange: [0.35, 0.5],
                score: 0
            },
            'pizza': {
                colors: { yellow: 30, red: 25, brown: 20 },
                pattern: ['uniforme'],
                brightnessRange: [0.45, 0.6],
                score: 0
            },
            'burger': {
                colors: { brown: 35, yellow: 20, green: 10 },
                pattern: ['morceaux'],
                brightnessRange: [0.45, 0.6],
                score: 0
            },
            'oeuf': {
                colors: { yellow: 45, white: 35 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.6, 0.8],
                score: 0
            },
            'fromage': {
                colors: { yellow: 40, white: 30, orange: 10 },
                pattern: ['uniforme'],
                brightnessRange: [0.6, 0.8],
                score: 0
            },
            'avocat': {
                colors: { green: 50, yellow: 15 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'banane': {
                colors: { yellow: 60, white: 15 },
                pattern: ['uniforme'],
                brightnessRange: [0.6, 0.8],
                score: 0
            },
            'pomme': {
                colors: { red: 50, yellow: 20, green: 15 },
                pattern: ['uniforme'],
                brightnessRange: [0.45, 0.65],
                score: 0
            },
            'orange': {
                colors: { orange: 60, yellow: 20 },
                pattern: ['uniforme'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'yaourt': {
                colors: { white: 70, yellow: 10 },
                pattern: ['uniforme'],
                brightnessRange: [0.7, 0.9],
                score: 0
            },
            'soupe': {
                colors: { orange: 35, red: 25, yellow: 20 },
                pattern: ['uniforme'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'chocolat': {
                colors: { brown: 60, yellow: 10 },
                pattern: ['uniforme'],
                brightnessRange: [0.2, 0.4],
                score: 0
            },
            'épinards': {
                colors: { green: 65, yellow: 10 },
                pattern: ['rugueux', 'morceaux'],
                brightnessRange: [0.3, 0.5],
                score: 0
            },
            'haricots verts': {
                colors: { green: 60, yellow: 15 },
                pattern: ['morceaux'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'maïs': {
                colors: { yellow: 70, orange: 15 },
                pattern: ['granuleux'],
                brightnessRange: [0.6, 0.8],
                score: 0
            },
            'thon': {
                colors: { white: 35, brown: 25, red: 15 },
                pattern: ['morceaux', 'uniforme'],
                brightnessRange: [0.4, 0.6],
                score: 0
            },
            'crevettes': {
                colors: { orange: 40, red: 25, white: 20 },
                pattern: ['morceaux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'champignons': {
                colors: { white: 45, brown: 30, yellow: 10 },
                pattern: ['morceaux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'courgette': {
                colors: { green: 55, white: 20, yellow: 10 },
                pattern: ['morceaux', 'uniforme'],
                brightnessRange: [0.45, 0.65],
                score: 0
            },
            'poivron': {
                colors: { red: 45, green: 30, yellow: 20, orange: 15 },
                pattern: ['uniforme', 'morceaux'],
                brightnessRange: [0.45, 0.65],
                score: 0
            },
            'quinoa': {
                colors: { white: 40, yellow: 30, brown: 15 },
                pattern: ['granuleux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'pois chiches': {
                colors: { yellow: 50, brown: 20, white: 15 },
                pattern: ['granuleux', 'morceaux'],
                brightnessRange: [0.5, 0.7],
                score: 0
            },
            'lentilles': {
                colors: { brown: 45, yellow: 20, green: 15 },
                pattern: ['granuleux'],
                brightnessRange: [0.4, 0.6],
                score: 0
            }
        };

        // Calculer le score de correspondance pour chaque aliment (ALGORITHME OPTIMISÉ V2)
        for (const [food, signature] of Object.entries(foodSignatures)) {
            let score = 0;
            
            // Score couleurs (55% du poids) - Encore plus tolérant et pondéré
            let colorScore = 0;
            let totalWeight = 0;
            for (const [color, expectedPercent] of Object.entries(signature.colors)) {
                const actualPercent = features.colorDistribution[color] || 0;
                const diff = Math.abs(expectedPercent - actualPercent);
                // Tolérance augmentée + bonus pour couleurs dominantes
                const match = Math.max(0, 100 - diff * 1.2);
                // Pondération: couleurs principales comptent plus
                const weight = expectedPercent / 100;
                colorScore += match * weight;
                totalWeight += weight;
            }
            score += (colorScore / totalWeight) * 0.55;
            
            // Score pattern (25% du poids) - Support de patterns multiples amélioré
            const patterns = Array.isArray(signature.pattern) ? signature.pattern : [signature.pattern];
            if (patterns.includes(features.shapes.pattern)) {
                score += 25; // Match exact
            } else {
                // Patterns similaires avec scores gradués
                const similarPatterns = {
                    'granuleux': { 'morceaux': 18, 'rugueux': 15, 'uniforme': 5 },
                    'morceaux': { 'granuleux': 18, 'rugueux': 15, 'uniforme': 8 },
                    'rugueux': { 'granuleux': 15, 'morceaux': 15, 'uniforme': 3 },
                    'uniforme': { 'morceaux': 8, 'granuleux': 5, 'rugueux': 3 }
                };
                const currentPattern = features.shapes.pattern;
                for (const pattern of patterns) {
                    if (similarPatterns[currentPattern]?.[pattern]) {
                        score += similarPatterns[currentPattern][pattern];
                        break;
                    }
                }
            }
            
            // Score luminosité (20% du poids) - Utiliser plage au lieu de valeur fixe
            const [minBright, maxBright] = signature.brightnessRange || [signature.brightness - 0.1, signature.brightness + 0.1];
            if (features.brightness >= minBright && features.brightness <= maxBright) {
                score += 20; // Dans la plage
            } else {
                // Calcul de proximité
                const closestBound = features.brightness < minBright ? minBright : maxBright;
                const brightnessDiff = Math.abs(features.brightness - closestBound);
                const brightnessScore = Math.max(0, 20 - brightnessDiff * 40);
                score += brightnessScore;
            }
            
            matches.push({
                food: food,
                score: Math.round(score),
                confidence: score > 65 ? 'haute' : score > 45 ? 'moyenne' : 'faible'
            });
        }
        
        // Trier par score décroissant
        matches.sort((a, b) => b.score - a.score);
        
        // Ajouter suggestions génériques si scores trop bas
        if (matches[0].score < 40) {
            console.log('⚠️ Scores faibles, ajout de suggestions génériques');
            // Suggestions basées sur couleur dominante
            const topColor = Object.entries(features.colorDistribution)
                .sort((a, b) => b[1] - a[1])[0];
            
            if (topColor) {
                const [color, percent] = topColor;
                const genericSuggestions = {
                    'white': ['riz blanc', 'poulet grillé', 'pain'],
                    'brown': ['boeuf', 'pain complet', 'poulet frit'],
                    'yellow': ['pâtes', 'frites', 'fromage'],
                    'green': ['brocoli', 'salade verte', 'avocat'],
                    'red': ['tomates', 'saumon', 'boeuf'],
                    'orange': ['carottes', 'saumon', 'frites']
                };
                
                const suggestions = genericSuggestions[color] || [];
                suggestions.forEach(food => {
                    if (!matches.find(m => m.food === food)) {
                        matches.push({
                            food: food,
                            score: 35,
                            confidence: 'faible'
                        });
                    }
                });
            }
        }
        
        return matches.slice(0, 8); // Top 8 pour plus de choix
    }
}

// Créer une instance globale
const imageAnalyzer = new ImageAnalyzer();
