// ===== Comparison & Benchmark System =====

// Average user data (simulated benchmarks)
const BENCHMARKS = {
    male: {
        avgCalories: 2200,
        avgProtein: 120,
        avgCarbs: 250,
        avgFats: 70,
        avgWaterRate: 65,
        avgGoalRate: 58,
        avgStreak: 4
    },
    female: {
        avgCalories: 1800,
        avgProtein: 90,
        avgCarbs: 200,
        avgFats: 60,
        avgWaterRate: 68,
        avgGoalRate: 62,
        avgStreak: 5
    }
};

// Calculate user percentile
function calculatePercentile(userValue, avgValue, isHigherBetter = true) {
    const ratio = userValue / avgValue;
    
    if (isHigherBetter) {
        // Higher is better (streak, success rate)
        if (ratio >= 1.5) return 95;
        if (ratio >= 1.3) return 85;
        if (ratio >= 1.1) return 70;
        if (ratio >= 0.9) return 50;
        if (ratio >= 0.7) return 30;
        return 15;
    } else {
        // Closer to target is better (calories if trying to lose weight)
        const diff = Math.abs(ratio - 1);
        if (diff <= 0.05) return 95;
        if (diff <= 0.1) return 85;
        if (diff <= 0.15) return 70;
        if (diff <= 0.2) return 50;
        if (diff <= 0.3) return 30;
        return 15;
    }
}

// Get user comparison
function getUserComparison() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return null;
    
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const gender = profile.gender || 'male';
    const benchmark = BENCHMARKS[gender];
    
    const stats = window.statisticsSystem ? window.statisticsSystem.getForDisplay() : null;
    if (!stats) return null;
    
    const comparison = {
        calories: {
            user: stats.averages.dailyCalories,
            avg: benchmark.avgCalories,
            diff: stats.averages.dailyCalories - benchmark.avgCalories,
            percentile: calculatePercentile(stats.averages.dailyCalories, benchmark.avgCalories, false)
        },
        protein: {
            user: stats.averages.protein,
            avg: benchmark.avgProtein,
            diff: stats.averages.protein - benchmark.avgProtein,
            percentile: calculatePercentile(stats.averages.protein, benchmark.avgProtein, true)
        },
        streak: {
            user: stats.overview.currentStreak,
            avg: benchmark.avgStreak,
            diff: stats.overview.currentStreak - benchmark.avgStreak,
            percentile: calculatePercentile(stats.overview.currentStreak, benchmark.avgStreak, true)
        },
        goalRate: {
            user: stats.success.goalRate,
            avg: benchmark.avgGoalRate,
            diff: stats.success.goalRate - benchmark.avgGoalRate,
            percentile: calculatePercentile(stats.success.goalRate, benchmark.avgGoalRate, true)
        },
        waterRate: {
            user: stats.success.waterRate,
            avg: benchmark.avgWaterRate,
            diff: stats.success.waterRate - benchmark.avgWaterRate,
            percentile: calculatePercentile(stats.success.waterRate, benchmark.avgWaterRate, true)
        }
    };
    
    return comparison;
}

// Get overall performance score
function getPerformanceScore() {
    const comparison = getUserComparison();
    if (!comparison) return 0;
    
    const percentiles = [
        comparison.streak.percentile,
        comparison.goalRate.percentile,
        comparison.waterRate.percentile,
        comparison.protein.percentile
    ];
    
    const avgPercentile = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
    return Math.round(avgPercentile);
}

// Get performance level
function getPerformanceLevel(score) {
    if (score >= 90) return { level: 'Exceptionnel', color: '#6f42c1', icon: '🏆' };
    if (score >= 75) return { level: 'Excellent', color: '#198754', icon: '⭐' };
    if (score >= 60) return { level: 'Bon', color: '#0d6efd', icon: '👍' };
    if (score >= 40) return { level: 'Moyen', color: '#ffc107', icon: '📊' };
    return { level: 'À améliorer', color: '#dc3545', icon: '💪' };
}

// Get suggestions based on comparison
function getSuggestions() {
    const comparison = getUserComparison();
    if (!comparison) return [];
    
    const suggestions = [];
    
    // Streak suggestions
    if (comparison.streak.percentile < 50) {
        suggestions.push({
            type: 'streak',
            priority: 'high',
            message: `Votre série de ${comparison.streak.user} jours est en dessous de la moyenne. Essayez de logger vos repas quotidiennement pour améliorer votre régularité !`,
            icon: '🔥'
        });
    }
    
    // Protein suggestions
    if (comparison.protein.diff < -20) {
        suggestions.push({
            type: 'protein',
            priority: 'medium',
            message: `Vous consommez ${Math.abs(comparison.protein.diff)}g de protéines en moins que la moyenne. Augmentez vos sources de protéines pour optimiser vos résultats !`,
            icon: '💪'
        });
    }
    
    // Goal rate suggestions
    if (comparison.goalRate.percentile < 40) {
        suggestions.push({
            type: 'goal',
            priority: 'high',
            message: `Votre taux de réussite (${comparison.goalRate.user}%) est en dessous de la moyenne. Ajustez vos objectifs pour qu'ils soient plus réalistes et atteignables !`,
            icon: '🎯'
        });
    }
    
    // Water suggestions
    if (comparison.waterRate.percentile < 50) {
        suggestions.push({
            type: 'water',
            priority: 'medium',
            message: `Votre hydratation (${comparison.waterRate.user}%) peut être améliorée. Buvez régulièrement tout au long de la journée !`,
            icon: '💧'
        });
    }
    
    // Positive reinforcement
    if (comparison.streak.percentile >= 70) {
        suggestions.push({
            type: 'success',
            priority: 'low',
            message: `Bravo ! Votre régularité de ${comparison.streak.user} jours vous place dans le top ${100 - comparison.streak.percentile}% des utilisateurs !`,
            icon: '🎉'
        });
    }
    
    if (comparison.goalRate.percentile >= 70) {
        suggestions.push({
            type: 'success',
            priority: 'low',
            message: `Excellent ! Votre taux de réussite de ${comparison.goalRate.user}% est supérieur à ${comparison.goalRate.percentile}% des utilisateurs !`,
            icon: '⭐'
        });
    }
    
    return suggestions;
}

// Get rank among users (simulated)
function getUserRank() {
    const score = getPerformanceScore();
    
    // Simulate total users based on score
    const totalUsers = 10000;
    const rank = Math.floor(totalUsers * (100 - score) / 100);
    
    return {
        rank: rank + 1,
        total: totalUsers,
        percentage: score
    };
}

// Export
window.comparisonSystem = {
    getComparison: getUserComparison,
    getScore: getPerformanceScore,
    getLevel: getPerformanceLevel,
    getSuggestions: getSuggestions,
    getRank: getUserRank
};
