// ===== Achievement & Gamification System =====

const ACHIEVEMENTS = {
    firstLogin: {
        id: 'firstLogin',
        title: '🎉 Premier Pas',
        description: 'Créer un compte',
        points: 10,
        icon: 'fa-user-plus'
    },
    firstGoal: {
        id: 'firstGoal',
        title: '🎯 Visionnaire',
        description: 'Définir votre premier objectif',
        points: 20,
        icon: 'fa-bullseye'
    },
    firstMeal: {
        id: 'firstMeal',
        title: '🍽️ Premier Repas',
        description: 'Enregistrer votre premier repas',
        points: 15,
        icon: 'fa-utensils'
    },
    streak7: {
        id: 'streak7',
        title: '🔥 Semaine Parfaite',
        description: '7 jours consécutifs de suivi',
        points: 50,
        icon: 'fa-fire'
    },
    streak30: {
        id: 'streak30',
        title: '💎 Champion du Mois',
        description: '30 jours consécutifs',
        points: 200,
        icon: 'fa-gem'
    },
    caloriesGoal: {
        id: 'caloriesGoal',
        title: '🎊 Objectif Atteint',
        description: 'Atteindre votre objectif calorique',
        points: 30,
        icon: 'fa-check-circle'
    },
    caloriesGoal10: {
        id: 'caloriesGoal10',
        title: '⭐ Régularité',
        description: '10 jours d\'objectif calorique atteint',
        points: 100,
        icon: 'fa-star'
    },
    waterGoal: {
        id: 'waterGoal',
        title: '💧 Hydraté',
        description: 'Atteindre votre objectif d\'eau',
        points: 25,
        icon: 'fa-tint'
    },
    waterGoal7: {
        id: 'waterGoal7',
        title: '💦 Source de Vie',
        description: '7 jours d\'hydratation complète',
        points: 75,
        icon: 'fa-water'
    },
    aiChat: {
        id: 'aiChat',
        title: '🤖 Techno-Nutritionniste',
        description: 'Utiliser l\'assistant IA',
        points: 15,
        icon: 'fa-robot'
    },
    photoAnalysis: {
        id: 'photoAnalysis',
        title: '📸 Scanner Expert',
        description: 'Analyser une photo de repas',
        points: 25,
        icon: 'fa-camera'
    },
    weightLoss5: {
        id: 'weightLoss5',
        title: '🏆 Transformation',
        description: 'Perdre 5kg',
        points: 150,
        icon: 'fa-trophy'
    },
    perfectWeek: {
        id: 'perfectWeek',
        title: '💯 Semaine Parfaite',
        description: 'Atteindre tous les objectifs pendant 7 jours',
        points: 250,
        icon: 'fa-medal'
    }
};

const LEVELS = [
    { level: 1, name: 'Débutant', minPoints: 0, color: '#6c757d' },
    { level: 2, name: 'Apprenti', minPoints: 100, color: '#0dcaf0' },
    { level: 3, name: 'Confirmé', minPoints: 300, color: '#198754' },
    { level: 4, name: 'Expert', minPoints: 600, color: '#ffc107' },
    { level: 5, name: 'Maître', minPoints: 1000, color: '#fd7e14' },
    { level: 6, name: 'Champion', minPoints: 1500, color: '#dc3545' },
    { level: 7, name: 'Légende', minPoints: 2500, color: '#6f42c1' }
];

let userAchievements = [];
let userPoints = 0;

// Initialize system
function initAchievements() {
    loadAchievements();
}

// Load user achievements
function loadAchievements() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const saved = localStorage.getItem(`achievements_${user.email}`);
    if (saved) {
        const data = JSON.parse(saved);
        userAchievements = data.achievements || [];
        userPoints = data.points || 0;
    }
}

// Save achievements
function saveAchievements() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    localStorage.setItem(`achievements_${user.email}`, JSON.stringify({
        achievements: userAchievements,
        points: userPoints
    }));
}

// Unlock achievement
function unlockAchievement(achievementId) {
    if (userAchievements.includes(achievementId)) return false;
    
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return false;
    
    userAchievements.push(achievementId);
    userPoints += achievement.points;
    saveAchievements();
    
    showAchievementNotification(achievement);
    return true;
}

// Show notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <i class="fas ${achievement.icon} achievement-icon"></i>
            <div>
                <h5>${achievement.title}</h5>
                <p>${achievement.description}</p>
                <span class="achievement-points">+${achievement.points} points</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Get user level
function getUserLevel() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (userPoints >= LEVELS[i].minPoints) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

// Get progress to next level
function getProgressToNextLevel() {
    const currentLevel = getUserLevel();
    const nextLevel = LEVELS[currentLevel.level];
    
    if (!nextLevel) return { percent: 100, pointsNeeded: 0 };
    
    const pointsInCurrentLevel = userPoints - currentLevel.minPoints;
    const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
    const percent = Math.round((pointsInCurrentLevel / pointsNeededForNext) * 100);
    const pointsNeeded = nextLevel.minPoints - userPoints;
    
    return { percent, pointsNeeded, nextLevel };
}

// Get all achievements
function getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(ach => ({
        ...ach,
        unlocked: userAchievements.includes(ach.id)
    }));
}

// Get unlocked count
function getUnlockedCount() {
    return userAchievements.length;
}

// Get total achievements
function getTotalAchievements() {
    return Object.keys(ACHIEVEMENTS).length;
}

// Check for achievements based on actions
function checkAchievements() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    // Check first login
    unlockAchievement('firstLogin');
    
    // Check first goal
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    if (profile.targetWeight) {
        unlockAchievement('firstGoal');
    }
    
    // Check first meal
    const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    if (Object.keys(diary).length > 0) {
        unlockAchievement('firstMeal');
    }
    
    // Check streak
    const streak = calculateStreak();
    if (streak >= 7) unlockAchievement('streak7');
    if (streak >= 30) unlockAchievement('streak30');
    
    // Check AI usage
    const chatHistory = localStorage.getItem(`chatHistory_${user.email}`);
    if (chatHistory) {
        unlockAchievement('aiChat');
    }
}

// Calculate streak
function calculateStreak() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return 0;
    
    const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    const dates = Object.keys(diary).sort().reverse();
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const dateStr of dates) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        
        const diffDays = Math.round((currentDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Export
window.achievementSystem = {
    init: initAchievements,
    unlock: unlockAchievement,
    getLevel: getUserLevel,
    getProgress: getProgressToNextLevel,
    getAll: getAllAchievements,
    getUnlockedCount: getUnlockedCount,
    getTotalCount: getTotalAchievements,
    getPoints: () => userPoints,
    check: checkAchievements,
    getStreak: calculateStreak
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    initAchievements();
    checkAchievements();
});
