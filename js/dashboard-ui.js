// ===== Dashboard UI Controller (FIXED) =====

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    checkLogin();
    loadDashboardData();
});

// Load all dashboard data
function loadDashboardData() {
    loadPerformanceScore();
    loadQuickStats();
    loadCharts();
    loadComparisons();
    loadAchievements();
    loadSuggestions();
}

// Load performance score
function loadPerformanceScore() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
        const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
        
        // Calculate simple performance score
        let score = 0;
        const daysLogged = Object.keys(diary).length;
        const goalsSet = Object.keys(goal).length > 0;
        
        score += Math.min(daysLogged * 5, 50); // Max 50 points for logging
        if (goalsSet) score += 30;
        if (daysLogged >= 7) score += 20; // Bonus for 7+ days
        
        score = Math.min(score, 100);
        
        document.getElementById('performanceScore').textContent = score;
        
        let level, emoji, color;
        if (score >= 80) {
            level = '🏆 Excellent';
            color = '#28a745';
        } else if (score >= 60) {
            level = '👍 Bien';
            color = '#17a2b8';
        } else if (score >= 40) {
            level = '📈 En progression';
            color = '#ffc107';
        } else {
            level = '🌱 Débutant';
            color = '#6c757d';
        }
        
        document.getElementById('performanceLevel').textContent = level;
        document.getElementById('performanceCard').style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
    } catch (error) {
        console.error('Erreur performance:', error);
    }
}

// Load quick stats
function loadQuickStats() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
        const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
        
        // Current streak
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        
        while (true) {
            const dateKey = checkDate.toISOString().split('T')[0];
            if (diary[dateKey]) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // Total meals
        let totalMeals = 0;
        Object.values(diary).forEach(day => {
            if (day.meals) totalMeals += day.meals.length;
        });
        
        // Goal rate
        let goalDays = 0;
        let totalDays = Object.keys(diary).length;
        
        Object.entries(diary).forEach(([date, day]) => {
            if (goal.calories && day.totalCalories) {
                const diff = Math.abs(day.totalCalories - goal.calories);
                if (diff <= goal.calories * 0.1) goalDays++;
            }
        });
        
        const goalRate = totalDays > 0 ? Math.round((goalDays / totalDays) * 100) : 0;
        
        document.getElementById('currentStreak').textContent = streak;
        document.getElementById('totalMeals').textContent = totalMeals;
        document.getElementById('goalRate').textContent = goalRate + '%';
        
        // Badges count
        const achievements = JSON.parse(localStorage.getItem(`achievements_${user.email}`) || '[]');
        const unlocked = achievements.filter(a => a.unlocked).length;
        document.getElementById('badgeCount').textContent = `${unlocked}/13`;
    } catch (error) {
        console.error('Erreur stats:', error);
    }
}

// Load charts
function loadCharts() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
        
        // Last 7 days for calories chart
        const last7Days = [];
        const caloriesData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            
            last7Days.push(dayName);
            caloriesData.push(diary[dateKey] ? diary[dateKey].totalCalories || 0 : 0);
        }
        
        // Weekly calories chart
        const weeklyCtx = document.getElementById('weeklyCaloriesChart');
        if (weeklyCtx) {
            new Chart(weeklyCtx, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Calories',
                        data: caloriesData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
        
        // Calculate average macros
        let totalProtein = 0, totalCarbs = 0, totalFats = 0, count = 0;
        
        Object.values(diary).forEach(day => {
            if (day.totalProteins) {
                totalProtein += day.totalProteins;
                totalCarbs += day.totalCarbs || 0;
                totalFats += day.totalFats || 0;
                count++;
            }
        });
        
        const avgProtein = count > 0 ? Math.round(totalProtein / count) : 100;
        const avgCarbs = count > 0 ? Math.round(totalCarbs / count) : 200;
        const avgFats = count > 0 ? Math.round(totalFats / count) : 60;
        
        // Macros chart
        const macrosCtx = document.getElementById('macrosChart');
        if (macrosCtx) {
            new Chart(macrosCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Protéines', 'Glucides', 'Lipides'],
                    datasets: [{
                        data: [avgProtein, avgCarbs, avgFats],
                        backgroundColor: ['#dc3545', '#ffc107', '#0dcaf0']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erreur charts:', error);
    }
}

// Load comparisons
function loadComparisons() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
        const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
        
        // Calculate user stats
        let totalCalories = 0, totalProtein = 0, count = 0, streak = 0;
        
        Object.values(diary).forEach(day => {
            if (day.totalCalories) {
                totalCalories += day.totalCalories;
                totalProtein += day.totalProteins || 0;
                count++;
            }
        });
        
        const avgCalories = count > 0 ? Math.round(totalCalories / count) : 0;
        const avgProtein = count > 0 ? Math.round(totalProtein / count) : 0;
        
        // Benchmarks
        const benchmarks = profile.gender === 'female' ? 
            { calories: 1800, protein: 90 } : 
            { calories: 2200, protein: 120 };
        
        const section = document.getElementById('comparisonSection');
        section.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6 mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-utensils text-success"></i> Calories</span>
                        <span class="badge bg-${avgCalories >= benchmarks.calories ? 'success' : 'warning'}">
                            ${avgCalories} kcal
                        </span>
                    </div>
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar bg-success" style="width: ${Math.min((avgCalories / benchmarks.calories) * 100, 100)}%">
                            ${Math.round((avgCalories / benchmarks.calories) * 100)}%
                        </div>
                    </div>
                    <small class="text-muted">Moyenne: ${benchmarks.calories} kcal</small>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-drumstick-bite text-danger"></i> Protéines</span>
                        <span class="badge bg-${avgProtein >= benchmarks.protein ? 'success' : 'warning'}">
                            ${avgProtein} g
                        </span>
                    </div>
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar bg-danger" style="width: ${Math.min((avgProtein / benchmarks.protein) * 100, 100)}%">
                            ${Math.round((avgProtein / benchmarks.protein) * 100)}%
                        </div>
                    </div>
                    <small class="text-muted">Moyenne: ${benchmarks.protein} g</small>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur comparisons:', error);
    }
}

// Load achievements
function loadAchievements() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const achievements = JSON.parse(localStorage.getItem(`achievements_${user.email}`) || '[]');
        const unlocked = achievements.filter(a => a.unlocked);
        
        const section = document.getElementById('achievementsSection');
        
        if (unlocked.length === 0) {
            section.innerHTML = '<p class="text-muted text-center">Aucun badge débloqué pour le moment</p>';
            return;
        }
        
        let html = '<div class="row g-2">';
        unlocked.slice(-5).reverse().forEach(ach => {
            html += `
                <div class="col-12">
                    <div class="d-flex align-items-center p-2 border rounded">
                        <div class="fs-2 me-3">${ach.icon}</div>
                        <div class="flex-grow-1">
                            <h6 class="mb-0">${ach.title}</h6>
                            <small class="text-muted">${ach.description}</small>
                        </div>
                        <span class="badge bg-warning">${ach.points} pts</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        section.innerHTML = html;
    } catch (error) {
        console.error('Erreur achievements:', error);
    }
}

// Load suggestions
function loadSuggestions() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
        const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
        
        const suggestions = [];
        
        // Check if goal set
        if (!goal.calories) {
            suggestions.push({
                text: 'Définissez vos objectifs nutritionnels pour un suivi personnalisé',
                type: 'warning',
                icon: 'fa-bullseye'
            });
        }
        
        // Check logging frequency
        const daysLogged = Object.keys(diary).length;
        if (daysLogged < 3) {
            suggestions.push({
                text: 'Enregistrez vos repas quotidiennement pour de meilleurs résultats',
                type: 'info',
                icon: 'fa-calendar-check'
            });
        }
        
        // Check recent activity
        const today = new Date().toISOString().split('T')[0];
        if (!diary[today]) {
            suggestions.push({
                text: 'N\'oubliez pas d\'enregistrer vos repas aujourd\'hui !',
                type: 'primary',
                icon: 'fa-utensils'
            });
        }
        
        // Success message
        if (daysLogged >= 7 && goal.calories) {
            suggestions.push({
                text: 'Excellent travail ! Vous êtes sur la bonne voie 🎉',
                type: 'success',
                icon: 'fa-check-circle'
            });
        }
        
        const section = document.getElementById('suggestionsSection');
        
        if (suggestions.length === 0) {
            section.innerHTML = '<p class="text-muted text-center">Tout va bien ! Continuez comme ça.</p>';
            return;
        }
        
        let html = '';
        suggestions.forEach(sug => {
            html += `
                <div class="alert alert-${sug.type} d-flex align-items-center" role="alert">
                    <i class="fas ${sug.icon} me-3"></i>
                    <div>${sug.text}</div>
                </div>
            `;
        });
        
        section.innerHTML = html;
    } catch (error) {
        console.error('Erreur suggestions:', error);
    }
}
