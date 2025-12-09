// ===== AI Chatbot with Food Image Recognition =====

let chatHistory = [];
let currentImageData = null;
let isRecording = false;
let recognition = null;
let selectedFoods = []; // Pour la sélection manuelle
let aiConfig = {
    service: 'manual' // Mode intelligent par défaut (CV + ML)
};

// Quick suggestions avec catégories
const quickSuggestions = [
    { icon: '💪', text: 'Besoin en protéines', query: 'Quel est mon besoin quotidien en protéines pour la musculation ?', category: 'nutrition' },
    { icon: '🔥', text: 'Déficit calorique', query: 'Comment créer un déficit calorique pour perdre du poids ?', category: 'perte-poids' },
    { icon: '🥗', text: 'Repas équilibré', query: 'Donne-moi 3 idées de repas équilibrés', category: 'recettes' },
    { icon: '⚡', text: 'Pré-workout', query: 'Que manger 1h avant l\'entraînement ?', category: 'sport' },
    { icon: '🍖', text: 'Sources protéines', query: 'Quelles sont les meilleures sources de protéines ?', category: 'nutrition' },
    { icon: '💧', text: 'Hydratation', query: 'Combien d\'eau dois-je boire par jour ?', category: 'santé' },
    { icon: '🏋️', text: 'Prise de masse', query: 'Comment prendre de la masse musculaire efficacement ?', category: 'sport' },
    { icon: '🥑', text: 'Bonnes graisses', query: 'Quelles sont les bonnes graisses à consommer ?', category: 'nutrition' },
    { icon: '🍌', text: 'Post-workout', query: 'Que manger après l\'entraînement ?', category: 'sport' },
    { icon: '😴', text: 'Sommeil et nutrition', query: 'Quels aliments favorisent un bon sommeil ?', category: 'santé' },
    { icon: '🥤', text: 'Smoothies protéinés', query: 'Recette de smoothie protéiné maison', category: 'recettes' },
    { icon: '🎯', text: 'Calculer mes macros', query: 'Comment calculer mes macronutriments ?', category: 'nutrition' }
];

// Check login status
function checkLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        console.log('✅ User logged in:', currentUser.email);
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadChatHistory();
    loadAIConfig();
    updateAPIAlert();
    checkLogin();
    initVoiceRecognition();
    displayQuickSuggestions();
    
    // Attacher le listener pour l'upload d'image
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
        console.log('✅ Image input listener attached');
    } else {
        console.error('❌ imageInput not found!');
    }
    
    // Service change handler
    const aiServiceSelect = document.getElementById('aiService');
    if (aiServiceSelect) {
        aiServiceSelect.addEventListener('change', function() {
            // Mettre à jour les infos affichées
            const manualInfo = document.getElementById('manualModeInfo');
            const apiInfo = document.getElementById('apiModeInfo');
            
            if (this.value === 'manual') {
                showToast('🎯 Mode Intelligent activé - Analyse automatique !', 'success');
                if (manualInfo) manualInfo.style.display = 'block';
                if (apiInfo) apiInfo.style.display = 'none';
            } else {
                showToast('🎭 Mode démo activé - Analyse simulée', 'info');
                if (manualInfo) manualInfo.style.display = 'none';
                if (apiInfo) apiInfo.style.display = 'none';
            }
        });
    }
});

// Load AI configuration
function loadAIConfig() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const savedConfig = localStorage.getItem(`aiConfig_${user.email}`);
    if (savedConfig) {
        aiConfig = JSON.parse(savedConfig);
    } else {
        localStorage.setItem(`aiConfig_${user.email}`, JSON.stringify(aiConfig));
    }
    updateAPIAlert();
}

// Save AI configuration
function saveAIConfig() {
    const service = document.getElementById('aiService').value;
    
    // Update service but keep API keys
    aiConfig.service = service;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`aiConfig_${user.email}`, JSON.stringify(aiConfig));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('apiConfigModal'));
    if (modal) modal.hide();
    
    updateAPIAlert();
    
    if (service === 'demo') {
        showToast('🎭 Mode démo activé', 'info');
    } else {
        showToast('🎯 Mode Intelligent activé', 'success');
    }
}

// API configuration removed - not needed anymore
/*
function showAPIConfig() {
    const modal = new bootstrap.Modal(document.getElementById('apiConfigModal'));
    const serviceSelect = document.getElementById('aiService');
    if (serviceSelect) {
        serviceSelect.value = aiConfig.service;
    }
    modal.show();
    
    // S'assurer que l'input file fonctionne après fermeture du modal
    document.getElementById('apiConfigModal').addEventListener('hidden.bs.modal', function () {
        console.log('✅ Modal fermé, réactivation de l\'upload');
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.disabled = false;
        }
    });
}
*/

// Update status text only
// Update status text only
function updateAPIAlert() {
    const statusText = document.getElementById('statusText');
    
    if (aiConfig.service === 'demo') {
        if (statusText) statusText.textContent = 'Mode démo actif';
    } else {
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle text-success"></i> Mode Intelligent actif (CV + ML)';
    }
}

// Initialize voice recognition
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('messageInput').value = transcript;
            isRecording = false;
            updateVoiceButton();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            updateVoiceButton();
        };
        
        recognition.onend = function() {
            isRecording = false;
            updateVoiceButton();
        };
    }
}

// Toggle voice recording
function toggleVoiceRecording() {
    if (!recognition) {
        showToast('⚠️ Reconnaissance vocale non disponible', 'warning');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
        isRecording = false;
    } else {
        recognition.start();
        isRecording = true;
    }
    updateVoiceButton();
}

// Update voice button
function updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    if (btn) {
        btn.innerHTML = isRecording ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-microphone"></i>';
        btn.classList.toggle('btn-danger', isRecording);
        btn.classList.toggle('btn-secondary', !isRecording);
    }
}

// Display quick suggestions
function displayQuickSuggestions() {
    const container = document.getElementById('quickSuggestions');
    if (!container) return;
    
    container.innerHTML = quickSuggestions.map(sug => `
        <button class="btn btn-outline-primary btn-sm m-1" onclick="useSuggestion('${sug.query.replace(/'/g, "\\'")}')"> ${sug.icon} ${sug.text}
        </button>
    `).join('');
}

// Use suggestion
function useSuggestion(query) {
    document.getElementById('messageInput').value = query;
    sendMessage();
}

// Load chat history
function loadChatHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const saved = localStorage.getItem(`chatHistory_${user.email}`);
    if (saved) {
        chatHistory = JSON.parse(saved);
        displayChatHistory();
    }
}

// Save chat history
function saveChatHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`chatHistory_${user.email}`, JSON.stringify(chatHistory));
}

// Clear chat history
function clearChatHistory() {
    if (confirm('🗑️ Voulez-vous vraiment supprimer tout l\'historique de conversation ?\n\nCette action est irréversible.')) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        chatHistory = [];
        localStorage.removeItem(`chatHistory_${user.email}`);
        
        // Clear UI and show welcome message
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="chat-message bot">
                <div class="message-avatar bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div>
                    <div class="message-content bot">
                        👋 Bonjour ! Je suis votre assistant nutrition IA. Comment puis-je vous aider aujourd'hui ?<br><br>
                        <strong>Je peux :</strong><br>
                        🍽️ Analyser vos repas en photo<br>
                        📊 Calculer les calories et macros<br>
                        💡 Répondre à vos questions nutrition<br>
                        🎯 Vous conseiller selon vos objectifs<br>
                        🎤 Comprendre vos questions vocales
                    </div>
                    <div class="mt-3">
                        <small class="text-muted"><strong>💬 Questions rapides :</strong></small>
                        <div id="quickSuggestions" class="quick-questions mt-2"></div>
                    </div>
                </div>
            </div>
        `;
        
        displayQuickSuggestions();
        showToast('✅ Historique supprimé', 'success');
    }
}

// Display chat history
function displayChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    chatHistory.forEach(msg => {
        addMessageToUI(msg.role, msg.content, msg.image, msg.nutrition);
    });
}

// Handle key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send quick question
function sendQuickQuestion(question) {
    document.getElementById('messageInput').value = question;
    sendMessage();
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message && !currentImageData) return;
    
    // Add user message
    if (message) {
        addMessageToUI('user', message, currentImageData);
        chatHistory.push({ role: 'user', content: message, image: currentImageData, timestamp: Date.now() });
    }
    
    input.value = '';
    const imageData = currentImageData;
    currentImageData = null;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response
    try {
        const response = await getAIResponse(message, imageData);
        removeTypingIndicator();
        addMessageToUI('bot', response.text, null, response.nutrition);
        chatHistory.push({ role: 'bot', content: response.text, nutrition: response.nutrition, timestamp: Date.now() });
        
        // If nutrition data exists, add to food diary
        if (response.nutrition) {
            await addToFoodDiary(response.nutrition);
        }
    } catch (error) {
        removeTypingIndicator();
        addMessageToUI('bot', '❌ Désolé, une erreur est survenue. Veuillez réessayer.');
        console.error('AI Error:', error);
    }
    
    saveChatHistory();
    scrollToBottom();
}

// Get AI response
async function getAIResponse(message, imageData) {
    // Toujours utiliser getDemoResponse (système local uniquement)
    return await getDemoResponse(message, imageData);
}

// OpenAI GPT-4 Vision integration (INUTILISÉ - Gardé pour démo mode)
async function getOpenAIResponse(message, imageData) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Get user context for personalized responses
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    
    const weight = profile.currentWeight || 70;
    const height = profile.height || 170;
    const age = profile.age || 25;
    const gender = profile.gender || 'male';
    const goalCalories = goal.calories || 2000;
    
    const systemPrompt = `Tu es un expert en nutrition sportive personnalisé avec une expertise en analyse visuelle de repas. Voici le profil de l'utilisateur:
- Poids: ${weight}kg
- Taille: ${height}cm
- Âge: ${age} ans
- Sexe: ${gender}
- Objectif calorique: ${goalCalories} kcal/jour

Réponds de manière concise (max 150 mots), personnalisée et avec des émojis. Donne des conseils adaptés à ce profil.`;
    
    const messages = [{ role: 'system', content: systemPrompt }];
    
    if (imageData) {
        const detailedPrompt = `Tu es un expert en nutrition. OBSERVE TRÈS ATTENTIVEMENT cette image.

👤 PROFIL: ${weight}kg | Objectif ${goalCalories} kcal/jour

⚠️ IMPÉRATIF: DÉCRIS CE QUE TU VOIS AVANT D'IDENTIFIER!

🔍 ANALYSE VISUELLE DÉTAILLÉE:

ÉTAPE 1️⃣ - DESCRIPTION VISUELLE PURE:
❓ FORME: long/court/rond/tubulaire/en grains/fibreux?
❓ COULEUR: blanc/jaune/brun/beige/doré/autre?
❓ TEXTURE: lisse/striée/granuleuse/fibreuse/crémeuse?
❓ MOTIFS: des stries? des grains séparés? homogène?

ÉTAPE 2️⃣ - IDENTIFICATION (basée sur description):
✓ PÂTES = forme tubulaire + stries visibles + couleur jaune
✓ RIZ = petits grains + texture granuleuse + couleur blanche
✓ VIANDE = fibres + couleur chair + texture dense
✓ LÉGUMES = couleurs vives + formes naturelles

ÉTAPE 2️⃣ - QUANTIFIER:
- Assiette standard = 26cm de diamètre
- Compare avec couverts pour la taille
- Estime en GRAMMES (références: poulet 150-200g, riz 150-200g, légumes 100-150g)

ÉTAPE 3️⃣ - IDENTIFIER & CALCULER:

BASES NUTRITIONNELLES (pour 100g):
• Poulet grillé: 165 kcal | 31g P | 0g G | 3.6g L
• Bœuf: 250 kcal | 26g P | 0g G | 15g L
• Poisson blanc: 100 kcal | 22g P | 0g G | 1g L
• Riz cuit: 130 kcal | 2.7g P | 28g G | 0.3g L
• Pâtes cuites: 131 kcal | 5g P | 25g G | 1.1g L
• Patates douces: 86 kcal | 1.6g P | 20g G | 0.1g L
• Légumes verts: 30 kcal | 2g P | 6g G | 0g L
• Huile (10ml): 90 kcal | 0g P | 0g G | 10g L
• Fromage (30g): 110 kcal | 7g P | 1g G | 9g L

📋 FORMAT RÉPONSE OBLIGATOIRE:

🔎 **DESCRIPTION VISUELLE D'ABORD:**
"Dans l'image, je vois [forme détaillée] de couleur [couleur précise]. La texture apparaît [texture]. Je remarque [caractéristiques distinctives comme stries/grains/fibres]."

**🍴 IDENTIFICATION: [Nom exact]**

💭 **Justification:**
[Pourquoi cette identification basée sur les caractéristiques visuelles]

📊 **Décomposition nutritionnelle:**
• **[Aliment 1]** → [X]g = [cal] kcal | [p]g protéines | [g]g glucides | [l]g lipides
• **[Aliment 2]** → [X]g = [cal] kcal | [p]g protéines | [g]g glucides | [l]g lipides
• **[Aliment 3]** → [X]g = [cal] kcal | [p]g protéines | [g]g glucides | [l]g lipides
[Liste TOUS les aliments]

✅ **TOTAUX:**
Calories: [SOMME] kcal
Protéines: [SOMME]g
Glucides: [SOMME]g
Lipides: [SOMME]g

💡 **Analyse (objectif ${goalCalories} kcal):**
[Conseil personnalisé]

⚠️ RÈGLES STRICTES:
1. TOUJOURS commencer par description visuelle détaillée
2. Identifier APRÈS avoir décrit
3. Si hésitation (pâtes ou riz?): "Basé sur [caractéristique], je pense que c'est [X] plutôt que [Y]"
4. PÂTES ≠ RIZ : Pâtes = striées/tubulaires, Riz = grains séparés
5. Si image floue: le mentionner explicitement`;

        messages.push({
            role: 'user',
            content: [
                { type: 'text', text: message || detailedPrompt },
                { type: 'image_url', image_url: { url: imageData, detail: 'high' } }
            ]
        });
    } else {
        messages.push({ role: 'user', content: message });
    }
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
            model: imageData ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
            messages: messages,
            max_tokens: imageData ? 800 : 300,
            temperature: imageData ? 0.3 : 0.7
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Extract nutrition data if image analysis
    let nutrition = null;
    if (imageData) {
        nutrition = extractNutritionFromText(text);
    }
    
    return { text, nutrition };
}

// Google Gemini integration (INUTILISÉ - Gardé pour démo mode)
async function getGeminiResponse(message, imageData) {
    console.log('getGeminiResponse called with imageData:', !!imageData);
    const apiKey = aiConfig.service === 'gemini' ? aiConfig.apiKey : aiConfig.geminiKey;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    console.log('Using Gemini API key:', apiKey ? 'Present' : 'Missing');
    console.log('API URL:', apiUrl.replace(apiKey, 'HIDDEN'));
    
    // Get user context
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    
    const weight = profile.currentWeight || 70;
    const goalCalories = goal.calories || 2000;
    
    const parts = [];
    
    if (imageData) {
        const detailedPrompt = `Tu es un expert nutritionniste en analyse visuelle. REGARDE TRÈS ATTENTIVEMENT cette photo.

👤 PROFIL: Poids ${weight}kg | Objectif ${goalCalories} kcal/jour

⚠️ RÈGLE #1 ABSOLUE: DÉCRIS D'ABORD CE QUE TU VOIS RÉELLEMENT!

🔍 PROCESSUS D'ANALYSE OBLIGATOIRE:

ÉTAPE 1 - DESCRIPTION VISUELLE (NE SAUTE PAS!):
❓ Quelle est la FORME de l'aliment? (long/rond/plat/tubulaire/en grains)
❓ Quelle est la COULEUR? (blanc/jaune/brun/rouge/vert)
❓ Quelle est la TEXTURE visible? (lisse/rugueuse/fibreuse/granuleuse)
❓ Y a-t-il des STRIES ou MOTIFS? (pâtes = striées, riz = grains séparés)
❓ Comment c'est DISPOSÉ dans l'assiette?

ÉTAPE 2 - IDENTIFICATION BASÉE SUR LA DESCRIPTION:
MAINTENANT seulement, identifie:
- PÂTES si: forme tubulaire/longue, texture striée, couleur jaune/beige
- RIZ si: petits grains séparés, texture granuleuse, couleur blanche
- POULET si: morceaux fibreux, couleur blanche/dorée, texture de viande
- LÉGUMES si: couleurs vives (vert/rouge/orange), formes naturelles

ÉTAPE 2 - ESTIMER LES QUANTITÉS:
- Compare à la taille de l'assiette (standard = 26cm)
- Utilise les couverts comme référence
- Estime en GRAMMES (sois généreux plutôt que restrictif)
- Exemple: 1 blanc de poulet = 150-200g, 1 portion riz = 150-200g

ÉTAPE 3 - IDENTIFIER CHAQUE ALIMENT:
- Protéines: viande/poisson/œufs/tofu
- Féculents: riz/pâtes/pain/pommes de terre
- Légumes: liste tous les légumes visibles
- Graisses ajoutées: huile/beurre/sauce/fromage
- Condiments: sauces/vinaigrette/épices

ÉTAPE 4 - CALCULER LES VALEURS:
Utilise ces BASES NUTRITIONNELLES:
• Poulet grillé (100g): 165 kcal, 31g protéines, 0g glucides, 3.6g lipides
• Riz cuit (100g): 130 kcal, 2.7g protéines, 28g glucides, 0.3g lipides
• Pâtes cuites (100g): 131 kcal, 5g protéines, 25g glucides, 1.1g lipides
• Légumes (100g): 20-50 kcal, 1-2g protéines, 5-10g glucides, 0g lipides
• Huile (10ml): 90 kcal, 0g protéines, 0g glucides, 10g lipides
• Pain blanc (30g): 80 kcal, 2.4g protéines, 15g glucides, 1g lipides

📋 FORMAT DE RÉPONSE OBLIGATOIRE:

🔎 **DESCRIPTION VISUELLE (commence PAR ÇA!):**
"Je vois [forme] de couleur [couleur] avec une texture [texture]. L'aliment a [caractéristique distinctive]. Il est disposé [comment]."

**🍴 IDENTIFICATION: [Nom précis du plat]**

💭 **Pourquoi cette identification:**
[Explique pourquoi tu penses que c'est cet aliment basé sur la description visuelle]

📊 **Composition et calculs:**
• **[Aliment 1]** → [Quantité]g = [X] kcal | [Y]g protéines | [Z]g glucides | [W]g lipides
• **[Aliment 2]** → [Quantité]g = [X] kcal | [Y]g protéines | [Z]g glucides | [W]g lipides
• **[Aliment 3]** → [Quantité]g = [X] kcal | [Y]g protéines | [Z]g glucides | [W]g lipides
[Continue pour TOUS les aliments]

✅ **TOTAUX NUTRITIONNELS:**
Calories: [TOTAL] kcal
Protéines: [TOTAL]g
Glucides: [TOTAL]g
Lipides: [TOTAL]g

💡 **Analyse pour objectif ${goalCalories} kcal:**
[Conseil personnalisé basé sur le repas analysé]

⚠️ RÈGLES CRITIQUES:
1. COMMENCE TOUJOURS par décrire ce que tu VOIS (forme, couleur, texture)
2. N'identifie QU'APRÈS avoir décrit visuellement
3. Si INCERTAIN entre 2 aliments (pâtes vs riz): MENTIONNE LES DEUX avec probabilités
4. VÉRIFIE: Des pâtes ont des STRIES, le riz a des GRAINS distincts
5. Si mauvaise qualité photo: DIS "Image floue, identification incertaine"
6. Donne chiffres RÉALISTES et ADDITIONNE correctement
7. Calories = (Protéines×4) + (Glucides×4) + (Lipides×9)`;

        parts.push({ text: message || detailedPrompt });
        
        // Convert base64 to proper format for Gemini
        const base64Data = imageData.split(',')[1];
        console.log('Image base64 length:', base64Data.length);
        console.log('Image mime type:', imageData.includes('png') ? 'image/png' : 'image/jpeg');
        parts.push({
            inline_data: {
                mime_type: imageData.includes('png') ? 'image/png' : 'image/jpeg',
                data: base64Data
            }
        });
    } else {
        parts.push({ text: message });
    }
    
    console.log('Sending request to Gemini with parts count:', parts.length);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: imageData ? 0.2 : 0.7,
                maxOutputTokens: imageData ? 1024 : 512
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error Response:', errorData);
        console.error('Status:', response.status, response.statusText);
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Gemini response received:', data);
    const text = data.candidates[0].content.parts[0].text;
    
    let nutrition = null;
    if (imageData) {
        nutrition = extractNutritionFromText(text);
    }
    
    return { text, nutrition };
}

// Claude integration (INUTILISÉ - Gardé pour démo mode)
async function getClaudeResponse(message, imageData) {
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    
    const content = [];
    if (imageData) {
        const base64Data = imageData.split(',')[1];
        content.push({
            type: 'image',
            source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
            }
        });
    }
    content.push({
        type: 'text',
        text: message || 'Analyse ce repas et donne-moi les valeurs nutritionnelles.'
    });
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiConfig.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 500,
            messages: [{ role: 'user', content }]
        })
    });
    
    if (!response.ok) {
        throw new Error('Claude API request failed');
    }
    
    const data = await response.json();
    const text = data.content[0].text;
    
    let nutrition = null;
    if (imageData) {
        nutrition = extractNutritionFromText(text);
    }
    
    return { text, nutrition };
}

// Extract nutrition data from AI text response
function extractNutritionFromText(text) {
    console.log('Extracting nutrition from:', text);
    
    // Try multiple patterns for calories
    let caloriesMatch = text.match(/Calories?\s*:?\s*(\d+)/i) || 
                       text.match(/(\d+)\s*(kcal|calories)/i) ||
                       text.match(/Énergie\s*:?\s*(\d+)/i);
    
    // Try multiple patterns for proteins
    let proteinsMatch = text.match(/Protéines?\s*:?\s*(\d+)/i) ||
                       text.match(/(\d+)\s*g?\s*(de\s+)?protéines?/i) ||
                       text.match(/Protein\s*:?\s*(\d+)/i);
    
    // Try multiple patterns for carbs
    let carbsMatch = text.match(/Glucides?\s*:?\s*(\d+)/i) ||
                    text.match(/(\d+)\s*g?\s*(de\s+)?(glucides?|carbs?)/i) ||
                    text.match(/Carbohydrates?\s*:?\s*(\d+)/i);
    
    // Try multiple patterns for fats
    let fatsMatch = text.match(/Lipides?\s*:?\s*(\d+)/i) ||
                   text.match(/(\d+)\s*g?\s*(de\s+)?(lipides?|graisses?|fats?)/i) ||
                   text.match(/Fat\s*:?\s*(\d+)/i);
    
    // Extract dish name - try to find it in the text
    let dishName = 'Repas analysé par IA';
    const nameMatch = text.match(/\*\*([^*]+)\*\*/);
    if (nameMatch) {
        dishName = nameMatch[1].trim();
    } else {
        // Try to find first line or sentence
        const firstLine = text.split('\n')[0];
        if (firstLine && firstLine.length < 50 && !firstLine.includes(':')) {
            dishName = firstLine.replace(/[🍽️📸📊🎯💡]/g, '').trim();
        }
    }
    
    if (caloriesMatch) {
        const nutrition = {
            dishName: dishName,
            calories: parseInt(caloriesMatch[1]),
            proteins: proteinsMatch ? parseInt(proteinsMatch[1]) : 0,
            carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
            fats: fatsMatch ? parseFloat(fatsMatch[1]) : 0
        };
        
        console.log('Extracted nutrition:', nutrition);
        return nutrition;
    }
    
    console.log('No nutrition data found');
    return null;
}

// Demo AI responses
async function getDemoResponse(message, imageData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMessage = message?.toLowerCase() || '';
    
    // Image analysis
    if (imageData) {
        const foods = [
            { name: 'Poulet grillé', calories: 165, proteins: 31, carbs: 0, fats: 3.6 },
            { name: 'Riz blanc', calories: 130, proteins: 2.7, carbs: 28, fats: 0.3 },
            { name: 'Brocoli', calories: 55, proteins: 3.7, carbs: 11, fats: 0.6 },
            { name: 'Salade verte', calories: 15, proteins: 1.4, carbs: 2.9, fats: 0.2 }
        ];
        
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        const portion = 150 + Math.floor(Math.random() * 100);
        const multiplier = portion / 100;
        
        const nutrition = {
            dishName: `${randomFood.name} (${portion}g)`,
            calories: Math.round(randomFood.calories * multiplier),
            proteins: Math.round(randomFood.proteins * multiplier),
            carbs: Math.round(randomFood.carbs * multiplier),
            fats: (randomFood.fats * multiplier).toFixed(1)
        };
        
        return {
            text: `📸 **Analyse de votre repas**\n\nJ'ai identifié : **${nutrition.dishName}**\n\nC'est un excellent choix ! Voici les valeurs nutritionnelles estimées pour cette portion.`,
            nutrition: nutrition
        };
    }
    
    // Get user context for personalized responses
    let user = JSON.parse(localStorage.getItem('currentUser'));
    let profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    let goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    let diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    
    let weight = profile.currentWeight || 70;
    let height = profile.height || 170;
    let age = profile.age || 25;
    let gender = profile.gender || 'male';
    let goalCalories = goal.calories || 2000;
    
    // Today's intake
    let today = new Date().toISOString().split('T')[0];
    let todayData = diary[today] || { totalCalories: 0, totalProteins: 0 };
    let caloriesLeft = goalCalories - todayData.totalCalories;
    
    // Nutrition questions - PROTÉINES
    if (lowerMessage.includes('protéine') || lowerMessage.includes('protein')) {
        const proteinMin = (weight * 1.6).toFixed(0);
        const proteinMax = (weight * 2.2).toFixed(0);
        const proteinToday = todayData.totalProteins || 0;
        const proteinLeft = proteinMax - proteinToday;
        
        return {
            text: `💪 **Vos Besoins en Protéines**\n\nPour ${weight}kg :\n🎯 **Objectif : ${proteinMin}-${proteinMax}g/jour**\n📊 **Aujourd'hui : ${proteinToday}g** ${proteinLeft > 0 ? `(reste ${proteinLeft}g)` : '✅'}\n\n**Sources de qualité :**\n• 🍗 Poulet (31g/100g)\n• 🐟 Thon (26g/100g)\n• 🥚 Œufs (13g/œuf)\n• 🥜 Tofu (8g/100g)\n• 🌾 Lentilles (9g/100g)\n\n💡 **Conseil perso :** Mangez 30-40g de protéines à chaque repas (4x/jour) !`
        };
    }
    
    // CALORIES & DÉFICIT
    if (lowerMessage.includes('calorie') || lowerMessage.includes('déficit')) {
        const bmr = gender === 'male' ? 
            (10 * weight + 6.25 * height - 5 * age + 5) :
            (10 * weight + 6.25 * height - 5 * age - 161);
        const tdee = Math.round(bmr * 1.5);
        const deficit = Math.round(tdee * 0.8);
        
        return {
            text: `🔥 **Vos Besoins Caloriques**\n\n📊 **Métabolisme de base :** ${Math.round(bmr)} kcal\n⚡ **Dépense totale :** ${tdee} kcal\n🎯 **Votre objectif :** ${goalCalories} kcal\n📉 **Aujourd'hui :** ${todayData.totalCalories} kcal ${caloriesLeft > 0 ? `(reste ${caloriesLeft})` : '✅'}\n\n**Pour perdre du poids :**\n• Déficit modéré : ${deficit} kcal/jour (-500 kcal)\n• Perte visée : 0.5kg/semaine\n\n💡 **Conseil :** Ne descendez jamais sous ${Math.round(bmr)} kcal !`
        };
    }
    
    // REPAS ÉQUILIBRÉ
    if (lowerMessage.includes('repas') || lowerMessage.includes('équilibr') || lowerMessage.includes('idée')) {
        const mealCal = Math.round(goalCalories / 4);
        const mealProtein = Math.round(weight * 0.4);
        
        return {
            text: `🥗 **Repas Équilibré Type** (${mealCal} kcal)\n\n**Composition idéale :**\n🍗 **Protéines** (${mealProtein}g)\n• 150g poulet/poisson\n• Ou 2 œufs + 100g fromage blanc\n\n🌾 **Glucides** (${Math.round(mealCal * 0.4 / 4)}g)\n• 80g riz/pâtes (cuits)\n• Ou 100g patate douce\n\n🥑 **Lipides** (${Math.round(mealCal * 0.25 / 9)}g)\n• 1 c.à.s huile d'olive\n• Ou 30g amandes\n\n🥦 **Légumes** (à volonté)\n• Brocoli, épinards, carottes\n\n💡 **Astuce :** Préparez 4 repas similaires pour simplifier !`
        };
    }
    
    // PRÉ-WORKOUT
    if (lowerMessage.includes('avant') && (lowerMessage.includes('entraîn') || lowerMessage.includes('sport'))) {
        return {
            text: `⚡ **Nutrition Pré-Entraînement**\n\n**2-3h avant :**\n• 80g riz + 120g poulet\n• Ou 2 tranches pain complet + beurre de cacahuète\n\n**30-60min avant :**\n• 1 banane + 1 café\n• Ou shake: 30g whey + 1 pomme\n\n☕ **Booster :**\n• Café noir (100-200mg caféine)\n• Améliore performance de 3-5%\n\n💧 **Hydratation :**\n• 300-500ml eau 30min avant\n\n⚠️ **À éviter :**\n• Aliments gras (ralentissent digestion)\n• Repas trop copieux`
        };
    }
    
    // POST-WORKOUT
    if (lowerMessage.includes('après') && (lowerMessage.includes('entraîn') || lowerMessage.includes('sport'))) {
        return {
            text: `🍖 **Nutrition Post-Entraînement**\n\n**Dans les 30-60min :**\n🥤 **Shake optimal :**\n• 30-40g whey\n• 50g flocons d'avoine\n• 1 banane\n• 300ml lait\n\n🍽️ **Ou repas solide :**\n• 150g poulet/poisson\n• 100g riz blanc\n• Légumes\n\n**Ratio idéal :**\n• Protéines : 0.3g/kg (${Math.round(weight * 0.3)}g)\n• Glucides : 0.5g/kg (${Math.round(weight * 0.5)}g)\n\n💡 **Fenêtre anabolique :** 2h pour optimiser récupération\n\n💧 Buvez 500ml d'eau !`
        };
    }
    
    // HYDRATATION
    if (lowerMessage.includes('eau') || lowerMessage.includes('hydrat') || lowerMessage.includes('boire')) {
        const waterGoal = Math.round(weight * 35);
        return {
            text: `💧 **Hydratation Optimale**\n\nVotre besoin : ${waterGoal}ml/jour\n(${Math.round(waterGoal/250)} verres de 250ml)\n\n📋 **Répartition :**\n• Matin au réveil : 500ml\n• Avec chaque repas : 250ml (x4)\n• Entre les repas : 1L\n• Pendant sport : 200ml/15min\n\n🎯 **Indicateurs :**\n✅ Urine jaune pâle = bien hydraté\n❌ Urine foncée = buvez plus\n\n💡 **Astuce :** Gardez toujours une bouteille près de vous !`
        };
    }
    
    // PERTE DE POIDS
    if (lowerMessage.includes('maigrir') || lowerMessage.includes('perte') || lowerMessage.includes('perdre') || (lowerMessage.includes('poids') && !lowerMessage.includes('prise'))) {
        const bmr = gender === 'male' ? 
            (10 * weight + 6.25 * height - 5 * age + 5) :
            (10 * weight + 6.25 * height - 5 * age - 161);
        const tdee = Math.round(bmr * 1.5);
        const deficit = Math.round(tdee - 500);
        
        return {
            text: `🏃 **Plan de Perte de Poids**\n\n**Vos données :**\n• Métabolisme : ${Math.round(bmr)} kcal\n• Dépense totale : ${tdee} kcal\n\n**Stratégie :**\n🎯 Objectif : ${deficit} kcal/jour\n📉 Déficit : -500 kcal\n⚖️ Perte visée : 0.5kg/semaine\n\n**Macros recommandées :**\n• 🥩 Protéines : ${Math.round(weight * 2)}g (maintien musculaire)\n• 🍚 Glucides : ${Math.round(deficit * 0.35 / 4)}g (énergie)\n• 🥑 Lipides : ${Math.round(deficit * 0.25 / 9)}g (hormones)\n\n**Conseils clés :**\n✅ Ne jamais descendre sous ${Math.round(bmr)} kcal\n✅ Cardio 3-4x/semaine (30min)\n✅ Musculation 3x/semaine (préserve muscle)\n✅ Pesée 1x/semaine (même heure)\n\n⚠️ **Évitez :** Régimes extrêmes, sauter repas, moins de 1200 kcal`
        };
    }
    
    // PRISE DE MASSE
    if (lowerMessage.includes('masse') || lowerMessage.includes('muscle') || lowerMessage.includes('grossir') || lowerMessage.includes('prendre du poids')) {
        const bmr = gender === 'male' ? 
            (10 * weight + 6.25 * height - 5 * age + 5) :
            (10 * weight + 6.25 * height - 5 * age - 161);
        const tdee = Math.round(bmr * 1.6);
        const surplus = Math.round(tdee + 300);
        
        return {
            text: `💪 **Plan de Prise de Masse**\n\n**Vos besoins :**\n• Dépense : ${tdee} kcal\n🎯 **Objectif : ${surplus} kcal/jour**\n📈 Surplus : +300 kcal\n⚖️ Gain : 0.25-0.5kg/semaine\n\n**Macros optimales :**\n• 🥩 Protéines : ${Math.round(weight * 2.2)}g (2.2g/kg)\n• 🍚 Glucides : ${Math.round(surplus * 0.5 / 4)}g (50% calories)\n• 🥑 Lipides : ${Math.round(surplus * 0.25 / 9)}g (25% calories)\n\n**Programme type :**\n🏋️ Musculation : 4-5x/semaine\n⏰ Durée : 60-90min\n🎯 Focus : Charges lourdes (6-12 reps)\n💤 Repos : 8h/nuit minimum\n\n**Aliments clés :**\n• Poulet, bœuf, œufs\n• Riz, pâtes, avoine\n• Huile d'olive, noix, avocat\n• Lait, fromage blanc\n\n💡 **Secret :** Consistance > perfection !`
        };
    }
    
    // RECETTES SMOOTHIES
    if (lowerMessage.includes('smoothie') || lowerMessage.includes('shake') || lowerMessage.includes('boisson')) {
        return {
            text: `🥤 **Top 5 Smoothies Protéinés**\n\n**1. CLASSIQUE VANILLE** (~350 kcal)\n• 30g whey vanille\n• 1 banane\n• 250ml lait\n• 10g beurre cacahuète\n• Glace\n📊 28g protéines | 40g glucides | 8g lipides\n\n**2. CHOCOLAT BANANE** (~400 kcal)\n• 30g whey chocolat\n• 1 banane\n• 200ml lait\n• 1 c.à.s cacao\n• 15g amandes\n📊 30g protéines | 45g glucides | 10g lipides\n\n**3. FRUITS ROUGES** (~320 kcal)\n• 30g whey fraise\n• 150g fruits rouges surgelés\n• 200ml lait\n• 50g flocons avoine\n📊 32g protéines | 38g glucides | 6g lipides\n\n**4. GREEN POWER** (~300 kcal)\n• 30g whey vanille\n• 1 poignée épinards\n• 1/2 pomme\n• 1/2 banane\n• 250ml eau coco\n• 10g graines chia\n📊 30g protéines | 35g glucides | 5g lipides\n\n**5. PEANUT BUTTER CUP** (~450 kcal)\n• 30g whey chocolat\n• 20g beurre cacahuète\n• 250ml lait\n• 1 banane\n• 1 c.à.s cacao\n• Glace\n📊 32g protéines | 42g glucides | 15g lipides\n\n💡 **Astuces :**\n• Ajoutez glace pour texture crémeuse\n• Mixez 30-60 secondes\n• Fruits surgelés = moins cher\n• Préparez portions avoine/fruits la veille\n\n⏰ **Timing idéal :**\n• Post-workout (récup)\n• Petit-déj rapide\n• Collation entre repas`
        };
    }

    // PLAN DE REPAS
    if (lowerMessage.includes('plan') || lowerMessage.includes('menu') || lowerMessage.includes('semaine') || lowerMessage.includes('jour')) {
        const dailyCal = Math.round(goalCalories);
        const protein = Math.round(weight * 1.8);
        const carbs = Math.round(dailyCal * 0.45 / 4);
        const fats = Math.round(dailyCal * 0.25 / 9);
        
        return {
            text: `📅 **Plan de Repas Type** (${dailyCal} kcal)\n\n🎯 **Macros quotidiennes :**\n• Protéines : ${protein}g\n• Glucides : ${carbs}g\n• Lipides : ${fats}g\n\n---\n\n🍳 **PETIT-DÉJEUNER** (7h00) - ${Math.round(dailyCal * 0.25)} kcal\n• 3 œufs brouillés\n• 50g flocons avoine + miel\n• 1 banane\n• Café\n📊 ${Math.round(protein * 0.25)}g P | ${Math.round(carbs * 0.3)}g C | ${Math.round(fats * 0.25)}g L\n\n🍎 **COLLATION** (10h30) - ${Math.round(dailyCal * 0.15)} kcal\n• Yaourt grec 0% (200g)\n• 30g amandes\n• 1 pomme\n📊 ${Math.round(protein * 0.15)}g P | ${Math.round(carbs * 0.15)}g C | ${Math.round(fats * 0.25)}g L\n\n🍲 **DÉJEUNER** (13h00) - ${Math.round(dailyCal * 0.3)} kcal\n• 150g poulet grillé\n• 100g riz basmati (cuit)\n• Légumes à volonté\n• 1 c.à.s huile olive\n📊 ${Math.round(protein * 0.3)}g P | ${Math.round(carbs * 0.35)}g C | ${Math.round(fats * 0.2)}g L\n\n⚡ **PRÉ-WORKOUT** (16h30) - ${Math.round(dailyCal * 0.1)} kcal\n• 1 banane\n• 15g amandes\n• Café\n📊 ${Math.round(protein * 0.05)}g P | ${Math.round(carbs * 0.15)}g C | ${Math.round(fats * 0.15)}g L\n\n💪 **POST-WORKOUT** (18h00) - ${Math.round(dailyCal * 0.1)} kcal\n• Shake : 30g whey + banane + avoine\n📊 ${Math.round(protein * 0.15)}g P | ${Math.round(carbs * 0.15)}g C | ${Math.round(fats * 0.05)}g L\n\n🍴 **DÎNER** (20h00) - ${Math.round(dailyCal * 0.25)} kcal\n• 150g saumon\n• 80g patate douce\n• Brocoli/haricots verts\n• Salade verte\n📊 ${Math.round(protein * 0.3)}g P | ${Math.round(carbs * 0.2)}g C | ${Math.round(fats * 0.25)}g L\n\n---\n\n🔄 **VARIANTES :**\n\n🍖 **Protéines :**\nPoulet ↔ Dinde ↔ Poisson ↔ Bœuf maigre ↔ Tofu\n\n🍚 **Glucides :**\nRiz ↔ Pâtes ↔ Quinoa ↔ Patate douce ↔ Pain complet\n\n🥗 **Légumes :** Variez les couleurs !\nBrocoli, épinards, carottes, courgettes, poivrons\n\n💡 **Conseils :**\n• Préparez le dimanche pour 3-4 jours\n• Pesez aliments crus\n• Ajustez selon votre faim\n• Hydratation : 3L eau/jour`
        };
    }

    // SUPPLÉMENTS
    if (lowerMessage.includes('supplément') || lowerMessage.includes('complément') || lowerMessage.includes('whey') || lowerMessage.includes('créatine') || lowerMessage.includes('vitamine')) {
        return {
            text: `💊 **Guide des Suppléments**\n\n**ESSENTIELS :**\n\n🥛 **Whey Protein**\n• Quand : Post-workout ou snack\n• Dose : 25-30g\n• Bénéfice : Récupération musculaire\n• Prix : 20-40€/kg\n\n⚡ **Créatine Monohydrate**\n• Dose : 5g/jour (permanent)\n• Bénéfice : +5-15% force\n• Meilleur supplément prouvé\n• Prix : 15€ (6 mois)\n\n🐟 **Oméga-3 (EPA/DHA)**\n• Dose : 2-3g/jour\n• Bénéfice : Anti-inflammatoire\n• Essentiel si peu de poisson\n\n☀️ **Vitamine D3**\n• Dose : 2000-4000 UI/jour\n• Bénéfice : Immunité, os, testostérone\n• Crucial en hiver\n\n**UTILES :**\n• Multivitamines (assurance)\n• Magnésium (sommeil, crampes)\n• Zinc (testostérone, immunité)\n• Caféine (performance)\n\n❌ **INUTILES :**\n• BCAA (si whey suffisante)\n• Fat burners (marketing)\n• Glutamine\n• Boosters chers\n\n💡 **Priorité : Alimentation > Suppléments !**`
        };
    }
    
    // TIMING NUTRITION
    if (lowerMessage.includes('timing') || lowerMessage.includes('quand manger') || lowerMessage.includes('fréquence')) {
        return {
            text: `⏰ **Timing Nutritionnel Optimal**\n\n**FRÉQUENCE REPAS :**\n🍽️ Idéal : 4-5 repas/jour\n⏱️ Toutes les 3-4h\n\n**EXEMPLE JOURNÉE :**\n\n🌅 **7h00 - Petit-déj**\n• Objectif : Casser le jeûne\n• 30-40g protéines\n• 50-80g glucides\n• Ex : Œufs + avoine + fruit\n\n☀️ **10h30 - Collation**\n• 20-30g protéines\n• Ex : Yaourt grec + amandes\n\n🕐 **13h00 - Déjeuner**\n• Repas principal\n• Équilibré : Viande + Féculents + Légumes\n\n🏋️ **16h00 - Pré-workout** (si sport 17h)\n• Glucides rapides\n• Ex : Banane + café\n\n💪 **18h00 - Post-workout**\n• CRUCIAL (fenêtre anabolique)\n• 30g whey + 50g glucides\n• Ou repas complet\n\n🌙 **20h00 - Dîner**\n• Protéines + Légumes\n• Moins de glucides\n\n**RÈGLES D'OR :**\n✅ Protéines à chaque repas\n✅ Glucides autour de l'entraînement\n✅ Lipides éloignés du sport\n✅ Dernier repas 2-3h avant coucher\n\n💡 **Important :** Total quotidien > timing parfait`
        };
    }
    
    // GLUCIDES
    if (lowerMessage.includes('glucide') || lowerMessage.includes('carb') || lowerMessage.includes('sucre') || lowerMessage.includes('féculent')) {
        const carbsGoal = Math.round(goalCalories * 0.45 / 4);
        return {
            text: `🍚 **Guide des Glucides**\n\n**Votre besoin : ${carbsGoal}g/jour**\n\n**TYPES DE GLUCIDES :**\n\n✅ **COMPLEXES (Privilégier)**\n• Riz complet/basmati\n• Pâtes complètes\n• Patate douce\n• Flocons d'avoine\n• Quinoa, boulgour\n• Pain complet\n\n⚡ **SIMPLES (Autour sport)**\n• Banane, dattes\n• Miel\n• Riz blanc\n• Pain blanc\n\n❌ **À LIMITER**\n• Sodas, jus\n• Bonbons, gâteaux\n• Céréales sucrées\n• Fast-food\n\n**TIMING OPTIMAL :**\n🌅 Matin : 60-100g (énergie journée)\n🏋️ Pré-workout : 30-50g (performance)\n💪 Post-workout : 50-80g (récup)\n🌙 Soir : 20-40g (moins actif)\n\n**INDEX GLYCÉMIQUE :**\n• IG Bas (<55) : Stable, satiété\n• IG Moyen (55-70) : OK repas\n• IG Haut (>70) : Pic insuline, réserver sport\n\n💡 **Astuce :** Associez glucides + protéines + fibres`
        };
    }
    
    // LIPIDES / GRAISSES
    if (lowerMessage.includes('lipide') || lowerMessage.includes('graisse') || lowerMessage.includes('gras') || lowerMessage.includes('fat')) {
        const fatsGoal = Math.round(goalCalories * 0.25 / 9);
        return {
            text: `🥑 **Guide des Lipides**\n\n**Votre besoin : ${fatsGoal}g/jour**\n(0.8-1g/kg minimum)\n\n**ESSENTIELS (Oméga-3) :**\n🐟 **Poissons gras**\n• Saumon : 2g/100g\n• Maquereau : 3g/100g\n• Sardines : 2g/100g\n• Objectif : 2-3x/semaine\n\n🌰 **Sources végétales**\n• Noix : 6g/30g\n• Graines de lin\n• Huile de colza\n\n✅ **BONS LIPIDES :**\n• Huile d'olive (cuisine)\n• Avocat (1/2 = 15g)\n• Amandes (23 = 14g)\n• Beurre de cacahuète (1 c.à.s = 8g)\n• Œufs entiers (5g/œuf)\n\n⚠️ **MODÉRATION :**\n• Beurre (saturés)\n• Fromage (10-30g/100g)\n• Viande rouge grasse\n\n❌ **ÉVITER :**\n• Trans (industriels)\n• Fritures\n• Fast-food\n\n**BÉNÉFICES :**\n• Hormones (testostérone)\n• Absorption vitamines (A,D,E,K)\n• Satiété\n• Cerveau\n\n💡 **Répartition idéale :**\n30% saturés, 30% mono, 40% poly`
        };
    }
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('entraînement') || lowerMessage.includes('entrainement')) {
        return {
            text: `🏋️ **Repas Pré-Entraînement**\n\n**2-3h avant :**\n• Poulet + riz + légumes\n• Pâtes + sauce tomate + viande maigre\n• Poisson + patate douce\n\n**30-60min avant :**\n• Banane + amandes\n• Flocons d'avoine + miel\n• Toast + beurre de cacahuète\n\n💡 **Astuce :** Privilégiez les glucides complexes pour une énergie durable !`
        };
    }
    
    if (lowerMessage.includes('poids') || lowerMessage.includes('perdre') || lowerMessage.includes('maigrir')) {
        return {
            text: `📉 **Perdre du Poids Sainement**\n\n**Principe clé :** Déficit calorique modéré\n\n✅ **À faire :**\n• Déficit de 300-500 kcal/jour\n• Protéines élevées (2g/kg)\n• Activité physique régulière\n• 7-8h de sommeil\n• Boire 2-3L d'eau\n\n❌ **À éviter :**\n• Régimes extrêmes\n• Sauter des repas\n• Éliminer des groupes d'aliments\n\n🎯 **Objectif sain :** 0.5-1kg par semaine\n\n💡 Utilisez la page Objectifs pour créer votre plan personnalisé !`
        };
    }
    
    if (lowerMessage.includes('eau') || lowerMessage.includes('hydrat')) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
        const weight = profile.currentWeight || 70;
        const waterNeeds = Math.round(weight * 35);
        
        return {
            text: `💧 **Hydratation**\n\nPour ${weight}kg, buvez : **${waterNeeds}ml par jour**\n(soit ${Math.round(waterNeeds/250)} verres de 250ml)\n\n**Quand boire ?**\n• Au réveil : 1-2 verres\n• Avant repas : 1 verre\n• Pendant effort : 150-250ml/15min\n• Tout au long de la journée\n\n💡 Le Journal suit automatiquement votre hydratation !`
        };
    }
    
    // RÉCUPÉRATION / REPOS
    if (lowerMessage.includes('récup') || lowerMessage.includes('repos') || lowerMessage.includes('sommeil') || lowerMessage.includes('fatigue') || lowerMessage.includes('dormir')) {
        return {
            text: `😴 **Récupération & Performance**\n\n**SOMMEIL (Priorité #1) :**\n⏰ **Objectif : 7-9h/nuit**\n\n📊 **Impact sommeil :**\n• -30% récupération si <7h\n• -20% testostérone\n• +300 kcal grignotage\n• -15% performance sport\n\n✅ **Optimiser sommeil :**\n• Horaires réguliers\n• Chambre fraîche (18-20°C)\n• Noir complet\n• Pas d'écrans 1h avant\n• Magnésium le soir\n• Dernier repas 3h avant\n\n**JOURS DE REPOS :**\n🎯 **2-3 jours/semaine minimum**\n\n🔄 **Types de repos :**\n• Passif : Rien (1x/semaine)\n• Actif : Marche, yoga, natation douce\n• Étirements : 15-20min/jour\n\n**SIGNES SURENTRAÎNEMENT :**\n⚠️ Attention si :\n• Fatigue persistante\n• Baisse performance\n• Blessures fréquentes\n• Insomnie\n• Perte appétit\n• Irritabilité\n\n**TECHNIQUES RÉCUP :**\n• ❄️ Bains froids (11-15°C, 10-15min)\n• 🔥 Sauna (améliore circulation)\n• 💆 Massage / foam rolling\n• 🧘 Étirements / yoga\n• 🛁 Bain sel d'Epsom\n\n💡 **Règle d'or :** Muscle se construit au repos, pas à la salle !`
        };
    }
    
    // MYTHES & ERREURS
    if (lowerMessage.includes('mythe') || lowerMessage.includes('faux') || lowerMessage.includes('vrai') || lowerMessage.includes('erreur') || lowerMessage.includes('croyance')) {
        return {
            text: `🚫 **Mythes Nutrition Débunkés**\n\n**❌ FAUX :**\n\n1️⃣ "Manger le soir fait grossir"\n• Seul le total calorique compte\n• Timing = secondaire\n\n2️⃣ "Gras = mauvais"\n• Lipides essentiels (hormones)\n• 0.8-1g/kg minimum\n\n3️⃣ "Beaucoup de protéines = reins"\n• Faux si reins sains\n• 2-3g/kg safe\n\n4️⃣ "Petits repas = métabolisme"\n• Aucun impact prouvé\n• 3 ou 6 repas = pareil\n\n5️⃣ "Jeûne = perte muscle"\n• Muscle préservé si protéines OK\n• Jeûne intermittent efficace\n\n6️⃣ "Glucides = mauvais"\n• Essentiels pour performance\n• Problème = excès + sédentarité\n\n7️⃣ "Cardio à jeun = brûle gras"\n• Négligeable sur 24h\n• Risque perte muscle\n\n8️⃣ "Fenêtre anabolique 30min"\n• En fait 2-4h\n• Total journée > timing\n\n**✅ VRAIS :**\n\n✓ Déficit calorique = perte poids\n✓ Protéines préservent muscle\n✓ Musculation > cardio perte poids\n✓ Consistance > perfection\n✓ Sommeil crucial\n✓ Eau améliore performance\n\n💡 **Méfiez-vous des "secrets" et solutions miracles !**`
        };
    }
    
    // MYTHES NUTRITION
    if (lowerMessage.includes('mythe') || lowerMessage.includes('vrai') || lowerMessage.includes('faux') || lowerMessage.includes('légende')) {
        return {
            text: `❌ **Top 10 Mythes Nutrition Débunkés**\n\n**1. "Manger le soir fait grossir"**\n❌ FAUX - Seul le total calorique compte\n✅ Ce qui importe : Déficit sur 24h\n\n**2. "Les glucides font grossir"**\n❌ FAUX - Excès calorique fait grossir\n✅ Glucides = énergie essentielle\n\n**3. "Il faut manger toutes les 2-3h"**\n❌ FAUX - Fréquence importe peu\n✅ Total quotidien > timing\n\n**4. "Cardio à jeun brûle plus de graisse"**\n❌ FAUX - Même résultat sur 24h\n✅ Performance réduite à jeun\n\n**5. "Les œufs augmentent le cholestérol"**\n❌ FAUX - Impact minimal\n✅ 3 œufs/jour OK pour la plupart\n\n**6. "Protéines abîment les reins"**\n❌ FAUX - Si reins sains\n✅ Jusqu'à 2.5g/kg sans risque\n\n**7. "Détoxifier avec jus"**\n❌ FAUX - Foie/reins détoxifient\n✅ Pas besoin de "detox"\n\n**8. "Glucides après 18h interdits"**\n❌ FAUX - Timing flexible\n✅ Adaptez à votre style de vie\n\n**9. "Fat burners brûlent la graisse"**\n❌ FAUX - Marketing principalement\n✅ Déficit calorique seul fonctionne\n\n**10. "Manger gras rend gras"**\n❌ FAUX - Lipides essentiels\n✅ 0.8-1g/kg minimum nécessaire\n\n💡 **Vérité simple :**\n• Calories in vs out\n• Protéines suffisantes\n• Consistance > perfection\n• Science > marketing`
        };
    }

    // MEAL PREP
    if (lowerMessage.includes('prep') || lowerMessage.includes('prépar') || lowerMessage.includes('batch') || lowerMessage.includes('avance')) {
        return {
            text: `🥘 **Guide Meal Prep Efficace**\n\n📅 **ORGANISATION DIMANCHE :**\n\n**1. PLANIFICATION (30min)**\n• Choisir 3 sources protéines\n• Choisir 3 sources glucides\n• Acheter légumes variés\n• Calculer quantités (4-5 jours)\n\n**2. COURSES (1h)**\n📋 **Liste type :**\n• 2kg poulet/dinde\n• 1kg boeuf haché 5%\n• 12 œufs\n• 1kg riz basmati\n• 1kg patates douces\n• 500g flocons avoine\n• Légumes frais/surgelés\n• Fruits de saison\n\n**3. CUISSON (2-3h)**\n\n🍖 **Protéines :**\n• Four : Poulet 180°C (25-30min)\n• Casserole : Boeuf haché\n• Œufs durs (10min)\n\n🍚 **Glucides :**\n• Rice cooker : Riz (automatique)\n• Four : Patates douces 200°C (40min)\n• Flocons : Prêts à l'emploi\n\n🥦 **Légumes :**\n• Vapeur : Brocoli (5min)\n• Four : Mélange légumes 200°C (20min)\n• Crus : Salade, tomates\n\n**4. STOCKAGE**\n\n🥡 **Containers :**\n• Verre/plastique sans BPA\n• Portions individuelles\n• Étiquettes avec date\n\n❄️ **Conservation :**\n• Frigo : 4-5 jours\n• Congélo : 2-3 mois\n• Réchauffer micro-ondes 2-3min\n\n**5. STRATÉGIES PRO**\n\n⚡ **Gain de temps :**\n• Cuisson simultanée (4 plaques + four)\n• Rice cooker automatique\n• Légumes surgelés (pré-coupés)\n\n🎯 **Variété :**\n• Sauces différentes (curry, mexicaine, asiat)\n• Épices variées\n• Mix glucides/légumes\n\n💰 **Budget :**\n• Achats gros (poulet entier)\n• Surgelés hors saison\n• Marché local\n• ~40-60€/semaine possible\n\n📊 **EXEMPLE 5 JOURS :**\n\nLundi-Mardi : Poulet + riz + brocoli\nMercredi-Jeudi : Boeuf + patate + haricots\nVendredi : Restaurant/social\n\n💡 **Astuce :** Commencez par 3 jours si débutant !`
        };
    }

    // MOTIVATION
    if (lowerMessage.includes('motiv') || lowerMessage.includes('décourag') || lowerMessage.includes('difficile') || lowerMessage.includes('abandonn')) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
        const userName = profile.firstName || 'Champion';
        
        return {
            text: `💪 **${userName}, tu peux le faire !**\n\n🏆 **RAPPELS IMPORTANTS :**\n\n**1. PROGRESSION ≠ PERFECTION**\n• Un mauvais repas ≠ échec\n• C'est la consistance long terme\n• 80% bon = succès garanti\n\n**2. CHAQUE JOUR COMPTE**\n• Aujourd'hui > hier\n• Petits progrès s'accumulent\n• -0.5kg/semaine = -26kg/an !\n\n**3. TON PARCOURS EST UNIQUE**\n• Ne compare pas aux autres\n• Génétique différente\n• Focus sur TOI\n\n**4. LES OBSTACLES SONT NORMAUX**\n• Plateaux = adaptation\n• Rechutes = apprentissage\n• Patience = clé\n\n🚀 **STRATÉGIES MENTALES :**\n\n✅ **Objectifs SMART :**\n• Spécifique : "-5kg" vs "maigrir"\n• Mesurable : Photos, poids, mensurations\n• Atteignable : -0.5kg/semaine\n• Réaliste : Style de vie durable\n• Temporel : 3 mois, pas 3 semaines\n\n📸 **Tracking :**\n• Photos hebdo (même éclairage)\n• Mensurations (taille, bras, cuisses)\n• Performance gym (+poids, +répétitions)\n• Énergie quotidienne (1-10)\n\n🎉 **Célébrez victoires :**\n• 1 semaine consistante = win\n• Nouveau PR gym = win\n• Refuser fast-food = win\n• Meal prep fait = win\n\n💬 **MANTRAS :**\n• "Je deviens plus fort chaque jour"\n• "Mes choix d'aujourd'hui créent mon futur"\n• "La discipline bat la motivation"\n• "Je mérite d'être en forme"\n\n⚠️ **Si vraiment dur :**\n1. Prends 1 jour off (mental reset)\n2. Refais tes objectifs (trop ambitieux?)\n3. Trouve support (amis, coach, communauté)\n4. Rappelle-toi POURQUOI tu as commencé\n\n🔥 **${userName}, tu es plus fort que tu ne crois !**\n\n💪 Chaque rep compte, chaque repas compte, chaque jour compte.\n\n🎯 Continue, les résultats arrivent ! 🚀`
        };
    }

    // ALIMENTS SPÉCIFIQUES
    if (lowerMessage.includes('aliment') || lowerMessage.includes('manger') || lowerMessage.includes('quoi') || lowerMessage.includes('liste')) {
        return {
            text: `🛒 **Top Aliments par Catégorie**\n\n**🥩 PROTÉINES :**\n• Poulet (31g/100g) - polyvalent\n• Dinde (29g/100g) - maigre\n• Thon conserve (26g/100g) - pratique\n• Œufs (13g/œuf) - complets\n• Fromage blanc 0% (8g/100g) - budget\n• Tofu (8g/100g) - végé\n• Lentilles (9g/100g) - fibres\n\n**🍚 GLUCIDES :**\n• Riz basmati (IG moyen)\n• Patate douce (vitamines)\n• Flocons avoine (fibres)\n• Pâtes complètes\n• Pain complet\n• Quinoa (protéines)\n• Fruits : Banane, pomme, baies\n\n**🥑 LIPIDES :**\n• Huile d'olive (cuisine)\n• Avocat (fibres + K)\n• Amandes (vitamine E)\n• Saumon (oméga-3)\n• Œufs entiers (complets)\n• Beurre cacahuète (pratique)\n\n**🥦 LÉGUMES :**\n• Brocoli (vitamines C,K)\n• Épinards (fer, magnésium)\n• Tomates (lycopène)\n• Poivrons (vitamine C)\n• Carottes (vitamine A)\n• À VOLONTÉ !\n\n**🍇 FRUITS :**\n• Banane (sport, potassium)\n• Pomme (fibres)\n• Baies (antioxydants)\n• Orange (vitamine C)\n• 2-3 portions/jour\n\n💡 **Règle 80/20 :** 80% aliments sains, 20% plaisir = succès long terme`
        };
    }
    
    // QUESTIONS GÉNÉRIQUES / AIDE
    if (lowerMessage.includes('aide') || lowerMessage.includes('comment') || lowerMessage.includes('pourquoi') || lowerMessage.length < 20) {
        return {
            text: `👋 **Je suis là pour vous aider !**\n\n**Je peux répondre à :**\n\n📊 **Nutrition :**\n• Calories & macros\n• Perte de poids\n• Prise de masse\n• Timing repas\n\n🥗 **Aliments :**\n• Sources protéines\n• Glucides / lipides\n• Suppléments\n• Listes courses\n\n🏋️ **Sport :**\n• Pré/post workout\n• Récupération\n• Hydratation\n\n💡 **Conseils :**\n• Plans personnalisés\n• Mythes débunkés\n• Optimisations\n\n📸 **Upload une photo** de repas pour analyse complète !\n\n🎤 **Utilisez le micro** pour poser vos questions !\n\n💬 **Essayez les suggestions rapides** ci-dessus !`
        };
    }
    
    // Default response avec suggestions personnalisées et stats du jour
    user = JSON.parse(localStorage.getItem('currentUser'));
    profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    const userName = profile.firstName || 'Champion';
    weight = profile.currentWeight || 70;
    
    // Stats du jour
    today = new Date().toISOString().split('T')[0];
    todayData = diary[today] || { totalCalories: 0, totalProteins: 0 };
    const goalCal = goal.calories || 2000;
    caloriesLeft = Math.max(0, goalCal - todayData.totalCalories);
    const proteinGoal = Math.round(weight * 1.8);
    const proteinLeft = Math.max(0, proteinGoal - (todayData.totalProteins || 0));
    const percentCal = Math.round((todayData.totalCalories / goalCal) * 100);
    const percentProt = Math.round(((todayData.totalProteins || 0) / proteinGoal) * 100);
    
    const suggestions = [
        '📸 Photo de repas',
        '💪 "Protéines"',
        '🔥 "Déficit calorique"',
        '🥤 "Smoothie"',
        '📅 "Plan repas"',
        '🛒 "Aliments"',
        '💊 "Suppléments"',
        '🏋️ "Workout"',
        '😴 "Sommeil"',
        '⏰ "Timing"'
    ];
    
    const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return {
        text: `🤔 **${userName}, reformule ta question !**\n\n📊 **AUJOURD'HUI :**\n🎯 ${goal.type || 'Maintien'}\n🔥 ${todayData.totalCalories}/${goalCal} kcal (${percentCal}%) ${caloriesLeft > 0 ? `\n   ➜ Reste ${caloriesLeft} kcal` : '✅'}\n💪 ${todayData.totalProteins || 0}/${proteinGoal}g protéines (${percentProt}%) ${proteinLeft > 0 ? `\n   ➜ Reste ${proteinLeft}g` : '✅'}\n\n---\n\n💡 **ESSAIE :**\n${randomSuggestions.map(s => `• ${s}`).join('\n')}\n\n---\n\n✨ **MES SUPER-POUVOIRS :**\n\n🍽️ **Nutrition Pro**\n• Plans ${Math.round(goalCal)} kcal personnalisés\n• Recettes & meal prep rapide\n• Calculs macros précis\n• Mythes nutrition détruits\n\n🏋️ **Coach Sportif**\n• Pré/post-workout optimal\n• Suppléments qui marchent\n• Récupération maximale\n• ${Math.round(weight * 35)}ml eau/jour pour toi\n\n💪 **Motivation 24/7**\n• Support quotidien\n• Stratégies mentales\n• Suivi progression\n• Toujours disponible\n\n📸 **IA Analyse**\n• Photo → Nutrition\n• 162+ aliments reconnus\n• Ajout auto journal\n\n🎤 **Utilise le micro** ou clique sur une suggestion !`
    };
}

// Add message to UI
function addMessageToUI(role, content, image = null, nutrition = null) {
    console.log('🎨 addMessageToUI called:', { role, content: content.substring(0, 50), hasImage: !!image, hasNutrition: !!nutrition });
    
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) {
        console.error('❌ chatMessages container not found!');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    let imageHTML = '';
    if (image) {
        console.log('🖼️ Creating image HTML, base64 length:', image.length);
        imageHTML = `<div style="margin-bottom: 10px;"><img src="${image}" class="image-preview" alt="Food image" style="max-width: 300px; max-height: 300px; border-radius: 10px; display: block; border: 2px solid #ddd;"></div>`;
    }
    
    let nutritionHTML = '';
    if (nutrition) {
        nutritionHTML = `
            <div class="nutrition-card">
                <h6><i class="fas fa-utensils"></i> ${nutrition.dishName}</h6>
                <div class="nutrition-item">
                    <span><i class="fas fa-fire text-danger"></i> Calories</span>
                    <strong>${nutrition.calories} kcal</strong>
                </div>
                <div class="nutrition-item">
                    <span><i class="fas fa-drumstick-bite text-danger"></i> Protéines</span>
                    <strong>${nutrition.proteins}g</strong>
                </div>
                <div class="nutrition-item">
                    <span><i class="fas fa-bread-slice text-warning"></i> Glucides</span>
                    <strong>${nutrition.carbs}g</strong>
                </div>
                <div class="nutrition-item">
                    <span><i class="fas fa-cheese text-info"></i> Lipides</span>
                    <strong>${nutrition.fats}g</strong>
                </div>
                <button class="btn btn-sm btn-success mt-2 w-100" onclick="confirmAddToJournal('${nutrition.dishName}', ${nutrition.calories}, ${nutrition.proteins}, ${nutrition.carbs}, ${nutrition.fats})">
                    <i class="fas fa-plus"></i> Ajouter au Journal
                </button>
            </div>
        `;
    }
    
    const contentFormatted = content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${role}">
            <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div style="max-width: 70%;">
            <div class="message-content ${role}">
                ${imageHTML}
                ${contentFormatted}
                ${nutritionHTML}
            </div>
            <div class="message-time text-muted">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom(); // Ajouter scroll automatique
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = `
        <div class="message-avatar bot">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content bot">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle image selection
async function handleImageSelect(event) {
    console.log('handleImageSelect called', event);
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('❌ Veuillez sélectionner une image', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        console.log('✅ Image loaded, base64 length:', e.target.result.length);
        currentImageData = e.target.result;
        
        console.log('📸 Adding image to UI...');
        // Ajouter l'image au chat AVANT l'analyse
        addMessageToUI('user', '📸 Photo uploadée - Analyse en cours...', currentImageData);
        console.log('✅ Image added to UI');
        
        // NOUVEAU: Analyse locale automatique avec ML
        showToast('🔍 Analyse de l\'image en cours...', 'info');
        
        try {
            // Analyse visuelle locale (computer vision)
            const cvResults = await imageAnalyzer.analyzeImage(currentImageData);
            console.log('CV Results:', cvResults);
            
            // Ajouter prédictions ML si disponibles
            let finalResults = cvResults;
            if (window.mlRecognizer && mlRecognizer.isModelReady()) {
                console.log('ML model is ready, getting predictions...');
                const img = new Image();
                img.src = currentImageData;
                await img.decode();
                
                const mlResults = await mlRecognizer.predict(img);
                console.log('ML Results:', mlResults);
                
                // Fusionner CV + ML avec pondération intelligente
                finalResults = mergePredictions(cvResults, mlResults);
                console.log('Merged Results:', finalResults);
                
                // APIs désactivées - Mode local uniquement
                console.log('✅ Mode local uniquement (CV + ML)');
            } else {
                console.log('ML model not ready, using CV only');
            }
            
            // NOUVEAU: Toujours proposer le sélecteur avec suggestions
            // Score > 60: afficher comme "détections automatiques"
            // Score <= 60: afficher comme "suggestions basées sur l'image"
            if (finalResults[0].score > 60) {
                showToast('✅ Aliments détectés avec confiance!', 'success');
                showSmartFoodSelector(currentImageData, finalResults);
            } else {
                showToast('💡 Voici des suggestions basées sur l\'image...', 'info');
                showManualFoodSelector(currentImageData, finalResults);
            }
        } catch (error) {
            console.error('Image analysis error:', error);
            // Fallback sur mode manuel
            showToast('📝 Sélection manuelle disponible', 'info');
            showManualFoodSelector(currentImageData);
        }
    };
    reader.onerror = function(error) {
        console.error('FileReader error:', error);
        showToast('❌ Erreur lors du chargement de l\'image', 'error');
    };
    reader.readAsDataURL(file);
}

// Fusionner prédictions CV + ML
function mergePredictions(cvResults, mlResults) {
    const merged = {};
    
    // Ajouter CV avec pondération 60%
    cvResults.forEach(result => {
        const key = result.food;
        merged[key] = {
            food: result.food,
            score: result.score * 0.6,
            confidence: result.confidence,
            source: 'cv'
        };
    });
    
    // Ajouter ML avec pondération 40%
    mlResults.forEach(result => {
        const key = result.food;
        if (merged[key]) {
            // Combiner scores si détecté par les 2
            merged[key].score = merged[key].score + (result.score * 0.4);
            merged[key].source = 'cv+ml';
            merged[key].mlConfidence = result.confidence;
        } else {
            // Ajouter nouvelle détection ML
            merged[key] = {
                food: result.food,
                score: result.score * 0.4,
                confidence: result.confidence,
                source: 'ml'
            };
        }
    });
    
    // Convertir en array et trier par score
    const results = Object.values(merged);
    results.sort((a, b) => b.score - a.score);
    
    // Limiter à top 5
    return results.slice(0, 5);
}

// Confirm add to journal
function confirmAddToJournal(dishName, calories, proteins, carbs, fats) {
    if (confirm(`Ajouter "${dishName}" à votre journal alimentaire ?`)) {
        addToFoodDiary({
            dishName,
            calories,
            proteins,
            carbs,
            fats
        });
    }
}

// Add to food diary
async function addToFoodDiary(nutrition) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const diaryKey = `foodDiary_${user.email}`;
    const today = new Date().toISOString().split('T')[0];
    
    let foodDiary = JSON.parse(localStorage.getItem(diaryKey) || '{}');
    
    if (!foodDiary[today]) {
        foodDiary[today] = [];
    }
    
    const meal = {
        id: Date.now(),
        category: 'snack',
        name: nutrition.dishName,
        calories: nutrition.calories,
        quantity: 100,
        proteins: nutrition.proteins,
        carbs: nutrition.carbs,
        fats: parseFloat(nutrition.fats),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        source: 'ai-chatbot'
    };
    
    foodDiary[today].push(meal);
    localStorage.setItem(diaryKey, JSON.stringify(foodDiary));
    
    showToast('✅ Repas ajouté au journal !', 'success');
}

// Scroll to bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show toast
function showToast(message, type) {
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
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// ===== MODE MANUEL: Sélection d'aliments =====

// Nouveau: Sélecteur intelligent avec détections
function showSmartFoodSelector(imageData, detectedFoods) {
    selectedFoods = [];
    
    const detectionsHtml = detectedFoods.map((food, index) => {
        const foodData = nutritionDatabase[food.food];
        if (!foodData) return '';
        
        const badgeClass = food.confidence === 'haute' ? 'bg-success' : 
                          food.confidence === 'moyenne' ? 'bg-warning' : 'bg-secondary';
        
        return `
            <div class="col-12 mb-2">
                <div class="card ${index === 0 ? 'border-success border-2' : ''}">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${foodData.name}</strong>
                                <span class="badge ${badgeClass} ms-2">${food.score}%</span>
                                ${index === 0 ? '<span class="badge bg-success ms-1">Meilleure correspondance</span>' : ''}
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="quickAddFood('${food.food}', ${foodData.portion})">
                                <i class="fas fa-plus"></i> Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const modalHtml = `
        <div class="modal fade" id="foodSelectorModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle"></i> Aliments Détectés Automatiquement
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Image Preview -->
                        <div class="text-center mb-3">
                            <img src="${imageData}" class="img-fluid rounded" style="max-height: 200px;" alt="Repas">
                        </div>
                        
                        <!-- Aliments détectés -->
                        <div class="alert alert-success">
                            <h6><i class="fas fa-magic"></i> Analyse automatique terminée !</h6>
                            <p class="mb-0 small">Les aliments suivants ont été détectés. Cliquez sur "Ajouter" pour confirmer.</p>
                        </div>
                        
                        <div class="row" id="detectedFoodsList">
                            ${detectionsHtml}
                        </div>
                        
                        <hr>
                        
                        <!-- Search -->
                        <div class="mb-3">
                            <label class="form-label small"><i class="fas fa-search"></i> Ou recherchez manuellement :</label>
                            <input type="text" class="form-control" id="foodSearch" placeholder="🔍 Rechercher un aliment...">
                        </div>
                        
                        <!-- Selected Foods -->
                        <div id="selectedFoodsList" class="mb-3"></div>
                        
                        <!-- Food Categories (accordéon replié par défaut) -->
                        <details>
                            <summary class="btn btn-outline-secondary w-100 mb-2">
                                <i class="fas fa-list"></i> Parcourir tous les aliments (80+)
                            </summary>
                            <div class="accordion mt-2" id="foodCategories">
                                <!-- VIANDES -->
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#meats">
                                            🍗 Viandes & Poissons
                                        </button>
                                    </h2>
                                    <div id="meats" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                        <div class="accordion-body">
                                            <div class="row g-2" id="meatsList"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- FÉCULENTS -->
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#carbs">
                                            🍚 Féculents
                                        </button>
                                    </h2>
                                    <div id="carbs" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                        <div class="accordion-body">
                                            <div class="row g-2" id="carbsList"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- LÉGUMES -->
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#veggies">
                                            🥦 Légumes
                                        </button>
                                    </h2>
                                    <div id="veggies" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                        <div class="accordion-body">
                                            <div class="row g-2" id="veggiesList"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- AUTRES -->
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#others">
                                            🍳 Autres
                                        </button>
                                    </h2>
                                    <div id="others" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                        <div class="accordion-body">
                                            <div class="row g-2" id="othersList"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-success" onclick="calculateManualNutrition()">
                            <i class="fas fa-calculator"></i> Calculer (${selectedFoods.length} aliments)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('foodSelectorModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Populate food lists
    populateFoodLists();
    
    // Setup search
    document.getElementById('foodSearch').addEventListener('input', handleFoodSearch);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('foodSelectorModal'));
    modal.show();
    
    showToast('✅ Analyse terminée ! Vérifiez les détections.', 'success');
}

// Ajout rapide d'un aliment
function quickAddFood(foodKey, defaultGrams) {
    const grams = prompt(`Quantité en grammes ?`, defaultGrams);
    if (!grams || grams <= 0) return;
    
    selectedFoods.push({ key: foodKey, grams: parseInt(grams) });
    updateSelectedFoodsList();
}

function showManualFoodSelector(imageData, detectedFoods = null) {
    selectedFoods = [];
    
    // Préparer les suggestions si disponibles
    let suggestionsHtml = '';
    if (detectedFoods && detectedFoods.length > 0) {
        suggestionsHtml = `
            <div class="alert alert-info mb-3">
                <h6 class="mb-2"><i class="fas fa-lightbulb"></i> Suggestions basées sur l'image:</h6>
                <div class="d-flex flex-wrap gap-2">
                    ${detectedFoods.slice(0, 5).map(food => `
                        <button class="btn btn-sm btn-outline-primary" onclick="quickAddFood('${food.food}', 100)">
                            ${nutritionDatabase[food.food]?.name || food.food} 
                            <span class="badge bg-secondary">${food.score}%</span>
                        </button>
                    `).join('')}
                </div>
                <small class="text-muted d-block mt-2">Cliquez pour ajouter rapidement (100g par défaut) ou sélectionnez manuellement ci-dessous</small>
            </div>
        `;
    }
    
    // Créer le modal
    const modalHtml = `
        <div class="modal fade" id="foodSelectorModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-utensils"></i> Sélection des Aliments
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Image Preview -->
                        <div class="text-center mb-4">
                            <img src="${imageData}" class="img-fluid rounded" style="max-height: 200px;" alt="Repas">
                        </div>
                        
                        <!-- Suggestions (si disponibles) -->
                        ${suggestionsHtml}
                        
                        <!-- Search -->
                        <div class="mb-3">
                            <input type="text" class="form-control" id="foodSearch" placeholder="🔍 Rechercher un aliment (poulet, riz, pâtes...)">
                        </div>
                        
                        <!-- Selected Foods -->
                        <div id="selectedFoodsList" class="mb-3"></div>
                        
                        <!-- Food Categories -->
                        <div class="accordion" id="foodCategories">
                            <!-- VIANDES -->
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#meats">
                                        🍗 Viandes & Poissons
                                    </button>
                                </h2>
                                <div id="meats" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                    <div class="accordion-body">
                                        <div class="row g-2" id="meatsList"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- FÉCULENTS -->
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#carbs">
                                        🍚 Féculents
                                    </button>
                                </h2>
                                <div id="carbs" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                    <div class="accordion-body">
                                        <div class="row g-2" id="carbsList"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- LÉGUMES -->
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#veggies">
                                        🥦 Légumes
                                    </button>
                                </h2>
                                <div id="veggies" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                    <div class="accordion-body">
                                        <div class="row g-2" id="veggiesList"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- AUTRES -->
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#others">
                                        🍳 Autres
                                    </button>
                                </h2>
                                <div id="others" class="accordion-collapse collapse" data-bs-parent="#foodCategories">
                                    <div class="accordion-body">
                                        <div class="row g-2" id="othersList"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" onclick="calculateManualNutrition()">
                            <i class="fas fa-calculator"></i> Calculer (${selectedFoods.length} aliments)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('foodSelectorModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Populate food lists
    populateFoodLists();
    
    // Setup search
    document.getElementById('foodSearch').addEventListener('input', handleFoodSearch);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('foodSelectorModal'));
    modal.show();
}

function populateFoodLists() {
    const categories = {
        meats: ['poulet', 'poulet grillé', 'dinde', 'boeuf', 'steak', 'saumon', 'thon', 'crevette'],
        carbs: ['riz', 'riz blanc', 'riz complet', 'pâtes', 'spaghetti', 'patate douce', 'pomme de terre', 'pain'],
        veggies: ['brocoli', 'carotte', 'tomate', 'laitue', 'épinard', 'haricot vert', 'courgette', 'poivron'],
        others: ['oeuf', 'fromage', 'yaourt', 'avocat', 'huile', 'frites', 'pizza']
    };
    
    for (const [category, foods] of Object.entries(categories)) {
        const container = document.getElementById(`${category}List`);
        container.innerHTML = foods.map(food => {
            const foodData = nutritionDatabase[food];
            if (!foodData) return '';
            
            return `
                <div class="col-6 col-md-4">
                    <button class="btn btn-outline-primary btn-sm w-100" onclick="addFoodToSelection('${food}')">
                        ${foodData.name}
                    </button>
                </div>
            `;
        }).join('');
    }
}

function addFoodToSelection(foodKey) {
    const foodData = nutritionDatabase[foodKey];
    if (!foodData) return;
    
    // Demander la quantité
    const grams = prompt(`Quantité de ${foodData.name} en grammes ?`, foodData.portion);
    if (!grams || grams <= 0) return;
    
    selectedFoods.push({ key: foodKey, grams: parseInt(grams) });
    updateSelectedFoodsList();
}

function updateSelectedFoodsList() {
    const container = document.getElementById('selectedFoodsList');
    if (selectedFoods.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Aucun aliment sélectionné</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-check-circle"></i> Aliments sélectionnés:</h6>
            <ul class="mb-0">
                ${selectedFoods.map((food, index) => {
                    const foodData = nutritionDatabase[food.key];
                    return `<li>${foodData.name} - ${food.grams}g <button class="btn btn-sm btn-danger" onclick="removeFood(${index})">×</button></li>`;
                }).join('')}
            </ul>
        </div>
    `;
    
    // Update button text
    const btn = document.querySelector('.modal-footer .btn-primary');
    if (btn) btn.innerHTML = `<i class="fas fa-calculator"></i> Calculer (${selectedFoods.length} aliments)`;
}

function removeFood(index) {
    selectedFoods.splice(index, 1);
    updateSelectedFoodsList();
}

function handleFoodSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    if (query.length < 2) return;
    
    // Search in database
    const results = Object.keys(nutritionDatabase).filter(key => 
        key.includes(query) || nutritionDatabase[key].name.toLowerCase().includes(query)
    ).slice(0, 10);
    
    if (results.length === 0) {
        showToast('❌ Aucun aliment trouvé', 'warning');
        return;
    }
    
    // Show results
    showToast(`✅ ${results.length} résultat(s) trouvé(s)`, 'success');
}

function calculateManualNutrition() {
    if (selectedFoods.length === 0) {
        showToast('⚠️ Veuillez sélectionner au moins un aliment', 'warning');
        return;
    }
    
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let composition = [];
    
    selectedFoods.forEach(food => {
        const foodData = nutritionDatabase[food.key];
        const ratio = food.grams / 100;
        
        const calories = Math.round(foodData.calories * ratio);
        const proteins = Math.round(foodData.proteins * ratio * 10) / 10;
        const carbs = Math.round(foodData.carbs * ratio * 10) / 10;
        const fats = Math.round(foodData.fats * ratio * 10) / 10;
        
        totalCalories += calories;
        totalProteins += proteins;
        totalCarbs += carbs;
        totalFats += fats;
        
        composition.push(`• **${foodData.name}** (${food.grams}g) → ${calories} kcal | ${proteins}g P | ${carbs}g G | ${fats}g L`);
    });
    
    const responseText = `**🍴 Repas Analysé (Mode Manuel)**\n\n📊 **Composition:**\n${composition.join('\n')}\n\n✅ **TOTAUX:**\nCalories: ${totalCalories} kcal\nProtéines: ${Math.round(totalProteins * 10) / 10}g\nGlucides: ${Math.round(totalCarbs * 10) / 10}g\nLipides: ${Math.round(totalFats * 10) / 10}g\n\n💡 **Conseil:** Repas équilibré avec ${selectedFoods.length} aliment(s) !`;
    
    const nutrition = {
        dishName: 'Repas manuel (' + selectedFoods.length + ' aliments)',
        calories: totalCalories,
        proteins: Math.round(totalProteins * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fats: Math.round(totalFats * 10) / 10
    };
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('foodSelectorModal')).hide();
    
    // Add message with image
    addMessageToUI('user', '📸 Analyse manuelle du repas', currentImageData);
    addMessageToUI('bot', responseText, null, nutrition);
    
    // Save to history
    chatHistory.push({ role: 'bot', content: responseText, nutrition, timestamp: Date.now() });
    saveChatHistory();
    
    // Reset
    selectedFoods = [];
    currentImageData = null;
}

// Make all functions globally accessible
window.sendMessage = sendMessage;
window.sendQuickQuestion = sendQuickQuestion;
window.handleKeyPress = handleKeyPress;
window.toggleVoiceRecording = toggleVoiceRecording;
window.clearChatHistory = clearChatHistory;
// window.confirmClearHistory = confirmClearHistory; // Pas nécessaire
window.saveAIConfig = saveAIConfig;
// window.showAPIConfig = showAPIConfig; // Removed - API config not needed
window.confirmAddToJournal = confirmAddToJournal;
window.handleImageSelect = handleImageSelect;
window.addFoodToSelection = addFoodToSelection;
window.quickAddFood = quickAddFood;
window.removeFood = removeFood;
window.calculateManualNutrition = calculateManualNutrition;
