// ===== Advanced Statistics System =====

// Calculate statistics
function calculateStatistics() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return null;
    
    const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    
    const stats = {
        totalDays: Object.keys(diary).length,
        currentStreak: calculateCurrentStreak(diary),
        longestStreak: calculateLongestStreak(diary),
        avgCalories: calculateAverage(diary, 'calories'),
        avgCalories7: calculateAverage(diary, 'calories', 7),
        avgCalories30: calculateAverage(diary, 'calories', 30),
        avgProtein: calculateAverage(diary, 'proteins'),
        avgCarbs: calculateAverage(diary, 'carbs'),
        avgFats: calculateAverage(diary, 'fats'),
        totalMeals: countTotalMeals(diary),
        goalSuccessRate: calculateGoalSuccessRate(diary, goal),
        waterSuccessRate: calculateWaterSuccessRate(),
        bestDay: findBestDay(diary, goal),
        worstDay: findWorstDay(diary, goal),
        weeklyTrend: calculateWeeklyTrend(diary),
        monthlyTrend: calculateMonthlyTrend(diary),
        weightProgress: calculateWeightProgress(profile),
        favoriteCategory: findFavoriteCategory(diary),
        totalCaloriesConsumed: calculateTotalCalories(diary)
    };
    
    return stats;
}

// Calculate current streak
function calculateCurrentStreak(diary) {
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

// Calculate longest streak
function calculateLongestStreak(diary) {
    const dates = Object.keys(diary).sort();
    if (dates.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return longestStreak;
}

// Calculate average
function calculateAverage(diary, property, lastDays = null) {
    const dates = Object.keys(diary).sort().reverse();
    let count = 0;
    let total = 0;
    
    for (const date of dates) {
        if (lastDays && count >= lastDays) break;
        
        const meals = diary[date];
        const dayTotal = meals.reduce((sum, meal) => sum + (meal[property] || 0), 0);
        total += dayTotal;
        count++;
    }
    
    return count > 0 ? Math.round(total / count) : 0;
}

// Count total meals
function countTotalMeals(diary) {
    return Object.values(diary).reduce((sum, meals) => sum + meals.length, 0);
}

// Calculate goal success rate
function calculateGoalSuccessRate(diary, goal) {
    if (!goal.calories) return 0;
    
    const dates = Object.keys(diary);
    if (dates.length === 0) return 0;
    
    let successDays = 0;
    
    for (const date of dates) {
        const meals = diary[date];
        const dayCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
        const diff = Math.abs(dayCalories - goal.calories);
        
        // Within 10% margin
        if (diff <= goal.calories * 0.1) {
            successDays++;
        }
    }
    
    return Math.round((successDays / dates.length) * 100);
}

// Calculate water success rate
function calculateWaterSuccessRate() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return 0;
    
    const waterHistory = JSON.parse(localStorage.getItem(`waterHistory_${user.email}`) || '{}');
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    
    if (!profile.currentWeight) return 0;
    
    const waterGoal = Math.round((profile.currentWeight * 35) / 250);
    const dates = Object.keys(waterHistory);
    
    if (dates.length === 0) return 0;
    
    let successDays = 0;
    for (const date of dates) {
        if (waterHistory[date] >= waterGoal) {
            successDays++;
        }
    }
    
    return Math.round((successDays / dates.length) * 100);
}

// Find best day
function findBestDay(diary, goal) {
    if (!goal.calories) return null;
    
    let bestDay = null;
    let bestScore = Infinity;
    
    for (const [date, meals] of Object.entries(diary)) {
        const dayCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
        const diff = Math.abs(dayCalories - goal.calories);
        
        if (diff < bestScore) {
            bestScore = diff;
            bestDay = { date, calories: dayCalories, diff };
        }
    }
    
    return bestDay;
}

// Find worst day
function findWorstDay(diary, goal) {
    if (!goal.calories) return null;
    
    let worstDay = null;
    let worstScore = 0;
    
    for (const [date, meals] of Object.entries(diary)) {
        const dayCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
        const diff = Math.abs(dayCalories - goal.calories);
        
        if (diff > worstScore) {
            worstScore = diff;
            worstDay = { date, calories: dayCalories, diff };
        }
    }
    
    return worstDay;
}

// Calculate weekly trend
function calculateWeeklyTrend(diary) {
    const dates = Object.keys(diary).sort().reverse().slice(0, 7);
    const calories = dates.map(date => {
        const meals = diary[date];
        return meals.reduce((sum, meal) => sum + meal.calories, 0);
    }).reverse();
    
    return {
        labels: dates.reverse().map(d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' })),
        data: calories
    };
}

// Calculate monthly trend
function calculateMonthlyTrend(diary) {
    const dates = Object.keys(diary).sort().reverse().slice(0, 30);
    const calories = dates.map(date => {
        const meals = diary[date];
        return meals.reduce((sum, meal) => sum + meal.calories, 0);
    }).reverse();
    
    return {
        labels: dates.reverse().map(d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
        data: calories
    };
}

// Calculate weight progress
function calculateWeightProgress(profile) {
    if (!profile.weightHistory || profile.weightHistory.length === 0) {
        return { total: 0, weekly: 0, monthly: 0 };
    }
    
    const history = profile.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = history[0].weight;
    const last = history[history.length - 1].weight;
    const total = last - first;
    
    // Weekly average
    const lastWeek = history.filter(h => {
        const diff = Date.now() - new Date(h.date).getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
    });
    const weekly = lastWeek.length >= 2 ? lastWeek[lastWeek.length - 1].weight - lastWeek[0].weight : 0;
    
    // Monthly average
    const lastMonth = history.filter(h => {
        const diff = Date.now() - new Date(h.date).getTime();
        return diff <= 30 * 24 * 60 * 60 * 1000;
    });
    const monthly = lastMonth.length >= 2 ? lastMonth[lastMonth.length - 1].weight - lastMonth[0].weight : 0;
    
    return { total, weekly, monthly };
}

// Find favorite category
function findFavoriteCategory(diary) {
    const categories = { breakfast: 0, lunch: 0, snack: 0, dinner: 0 };
    
    for (const meals of Object.values(diary)) {
        for (const meal of meals) {
            categories[meal.category] = (categories[meal.category] || 0) + 1;
        }
    }
    
    const favorite = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return favorite ? favorite[0] : null;
}

// Calculate total calories consumed
function calculateTotalCalories(diary) {
    let total = 0;
    for (const meals of Object.values(diary)) {
        total += meals.reduce((sum, meal) => sum + meal.calories, 0);
    }
    return total;
}

// Get statistics for display
function getStatisticsForDisplay() {
    const stats = calculateStatistics();
    if (!stats) return null;
    
    return {
        overview: {
            totalDays: stats.totalDays,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            totalMeals: stats.totalMeals,
            totalCalories: stats.totalCaloriesConsumed
        },
        averages: {
            dailyCalories: stats.avgCalories,
            weekly: stats.avgCalories7,
            monthly: stats.avgCalories30,
            protein: stats.avgProtein,
            carbs: stats.avgCarbs,
            fats: stats.avgFats
        },
        success: {
            goalRate: stats.goalSuccessRate,
            waterRate: stats.waterSuccessRate
        },
        trends: {
            weekly: stats.weeklyTrend,
            monthly: stats.monthlyTrend,
            weight: stats.weightProgress
        },
        records: {
            bestDay: stats.bestDay,
            worstDay: stats.worstDay,
            favoriteCategory: stats.favoriteCategory
        }
    };
}

// Export
window.statisticsSystem = {
    calculate: calculateStatistics,
    getForDisplay: getStatisticsForDisplay
};
