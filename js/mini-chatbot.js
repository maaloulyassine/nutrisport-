// ===== Mini Chatbot Widget for Index Page =====

// Toggle chatbot popup
function toggleChatbot() {
    const popup = document.getElementById('chatbotPopup');
    if (popup) {
        const isVisible = popup.style.display !== 'none';
        popup.style.display = isVisible ? 'none' : 'block';
        
        // Remove badge when opened
        if (!isVisible) {
            const badge = document.getElementById('chatbotBadge');
            if (badge) badge.style.display = 'none';
        }
    }
}

// Send quick message
function sendQuickMessage(message) {
    const messagesContainer = document.getElementById('miniChatMessages');
    
    // Add user message
    addMiniMessage('user', message);
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'mini-message bot typing';
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Get response
    setTimeout(() => {
        typingDiv.remove();
        const response = getQuickResponse(message);
        addMiniMessage('bot', response);
    }, 1000);
}

// Add message to mini chat
function addMiniMessage(role, content) {
    const messagesContainer = document.getElementById('miniChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `mini-message ${role}`;
    
    const contentFormatted = content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageDiv.innerHTML = contentFormatted;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get quick response
function getQuickResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
        return `🤖 **Assistant Nutrition**\n\nJe peux vous aider avec :\n• 📊 Calcul de calories\n• 🍽️ Analyse de repas (photo)\n• 💪 Conseils protéines\n• 🎯 Plans nutritionnels\n\n✨ **Accédez au chatbot complet** dans le menu pour analyser vos photos de repas avec IA !`;
    }
    
    if (lowerMessage.includes('calorie') || lowerMessage.includes('besoin')) {
        return `🔥 **Calculer vos besoins**\n\nUtilisez notre **Calculateur** dans le menu pour obtenir :\n• Calories journalières\n• Macronutriments (P/G/L)\n• Plan personnalisé\n\nBasé sur votre poids, taille, âge et objectif !`;
    }
    
    if (lowerMessage.includes('protéine') || lowerMessage.includes('protein')) {
        return `💪 **Protéines**\n\nBesoin général : **1.6-2.2g/kg**\n\n**Sources :**\n• Poulet : 31g/100g\n• Œufs : 13g/100g\n• Poisson : 20-25g/100g\n• Légumineuses : 8-12g/100g\n\n📸 Utilisez le **Chatbot complet** pour analyser vos repas !`;
    }
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('image') || lowerMessage.includes('repas')) {
        return `📸 **Analyse de repas par IA**\n\n✨ Accédez au **Chatbot complet** dans le menu !\n\nFonctionnalités :\n• 🤖 Gemini AI (ultra-rapide)\n• 📊 Calcul nutrition automatique\n• 🍽️ Reconnaissance 20+ aliments\n• 💾 Ajout au journal\n\nCliquez sur "Chatbot" dans la navigation !`;
    }
    
    if (lowerMessage.includes('commencer') || lowerMessage.includes('start') || lowerMessage.includes('début')) {
        return `🚀 **Commencer avec NutriSport**\n\n**Étapes :**\n1. 📊 **Objectifs** : Définir vos besoins\n2. 📝 **Journal** : Suivre vos repas\n3. 🤖 **Chatbot** : Analyser avec IA\n4. 📈 **Dashboard** : Voir vos progrès\n\nConnectez-vous pour accéder à toutes les fonctionnalités !`;
    }
    
    if (lowerMessage.includes('poids') || lowerMessage.includes('perdre') || lowerMessage.includes('maigrir')) {
        return `📉 **Perdre du poids**\n\nPrincipe : **Déficit calorique**\n\n✅ **Conseils :**\n• -300 à -500 kcal/jour\n• Protéines élevées\n• Sport régulier\n• Sommeil 7-8h\n\n🎯 Objectif sain : **0.5-1kg/semaine**\n\nUtilisez le calculateur pour votre plan !`;
    }
    
    return `🤖 Je suis votre assistant nutrition !\n\n💡 **Suggestions :**\n• "Comment calculer mes calories ?"\n• "Besoin en protéines ?"\n• "Comment analyser mes repas ?"\n• "Conseils pour perdre du poids ?"\n\n✨ Pour des analyses complètes avec IA, accédez au **Chatbot complet** dans le menu !`;
}

// Initialize mini chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Add welcome message
    const messagesContainer = document.getElementById('miniChatMessages');
    if (messagesContainer && messagesContainer.children.length === 0) {
        addMiniMessage('bot', '👋 Bonjour ! Je suis votre assistant nutrition. Comment puis-je vous aider ?');
    }
});
