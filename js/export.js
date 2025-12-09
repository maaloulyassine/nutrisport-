// ===== Export System (PDF & CSV) =====

// Export diary to CSV
function exportDiaryToCSV() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const diary = JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}');
    
    let csv = 'Date,Catégorie,Repas,Calories,Protéines (g),Glucides (g),Lipides (g),Heure\n';
    
    for (const [date, meals] of Object.entries(diary).sort()) {
        for (const meal of meals) {
            csv += `${date},${meal.category},${meal.name},${meal.calories},${meal.proteins},${meal.carbs},${meal.fats},${meal.time || 'N/A'}\n`;
        }
    }
    
    downloadFile(csv, `nutrisport-journal-${user.email}-${Date.now()}.csv`, 'text/csv');
}

// Export weight history to CSV
function exportWeightToCSV() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const history = profile.weightHistory || [];
    
    let csv = 'Date,Poids (kg)\n';
    
    for (const entry of history) {
        csv += `${entry.date},${entry.weight}\n`;
    }
    
    downloadFile(csv, `nutrisport-poids-${user.email}-${Date.now()}.csv`, 'text/csv');
}

// Export statistics report as text
function exportStatisticsReport() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const stats = window.statisticsSystem ? window.statisticsSystem.getForDisplay() : null;
    if (!stats) return;
    
    let report = `═══════════════════════════════════════
    RAPPORT NUTRITIONNEL - NUTRISPORT
═══════════════════════════════════════

Utilisateur: ${user.fullName}
Email: ${user.email}
Date du rapport: ${new Date().toLocaleDateString('fr-FR')}

═══════════════════════════════════════
            VUE D'ENSEMBLE
═══════════════════════════════════════

Jours de suivi: ${stats.overview.totalDays}
Série actuelle: ${stats.overview.currentStreak} jours
Meilleure série: ${stats.overview.longestStreak} jours
Total repas: ${stats.overview.totalMeals}
Calories totales: ${stats.overview.totalCalories.toLocaleString()} kcal

═══════════════════════════════════════
            MOYENNES
═══════════════════════════════════════

Calories/jour: ${stats.averages.dailyCalories} kcal
Derniers 7 jours: ${stats.averages.weekly} kcal
Derniers 30 jours: ${stats.averages.monthly} kcal

Protéines/jour: ${stats.averages.protein}g
Glucides/jour: ${stats.averages.carbs}g
Lipides/jour: ${stats.averages.fats}g

═══════════════════════════════════════
        TAUX DE RÉUSSITE
═══════════════════════════════════════

Objectif calorique: ${stats.success.goalRate}%
Objectif d'hydratation: ${stats.success.waterRate}%

═══════════════════════════════════════
            RECORDS
═══════════════════════════════════════

Meilleur jour: ${stats.records.bestDay ? new Date(stats.records.bestDay.date).toLocaleDateString('fr-FR') + ' (' + stats.records.bestDay.calories + ' kcal)' : 'N/A'}
Catégorie favorite: ${stats.records.favoriteCategory || 'N/A'}

═══════════════════════════════════════
    Rapport généré par NutriSport
═══════════════════════════════════════
`;
    
    downloadFile(report, `nutrisport-rapport-${user.email}-${Date.now()}.txt`, 'text/plain');
}

// Generate PDF report (simple HTML to PDF)
function exportToPDF() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const stats = window.statisticsSystem ? window.statisticsSystem.getForDisplay() : null;
    if (!stats) return;
    
    const profile = JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}');
    const goal = JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport NutriSport - ${user.fullName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #0d6efd; border-bottom: 3px solid #0d6efd; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; }
        .stat-label { color: #6c757d; font-size: 14px; }
        .stat-value { font-size: 28px; font-weight: bold; color: #0d6efd; }
        .footer { text-align: center; margin-top: 50px; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <h1>📊 Rapport Nutritionnel NutriSport</h1>
    
    <div class="info-box">
        <strong>Utilisateur:</strong> ${user.fullName}<br>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}<br>
        <strong>Poids actuel:</strong> ${profile.currentWeight || 'N/A'} kg<br>
        <strong>Objectif:</strong> ${goal.type === 'lose' ? 'Perte de poids' : goal.type === 'gain' ? 'Prise de poids' : 'Maintien'}
    </div>
    
    <h2>Vue d'ensemble</h2>
    <div class="stat-grid">
        <div class="stat-card">
            <div class="stat-label">Jours de suivi</div>
            <div class="stat-value">${stats.overview.totalDays}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Série actuelle</div>
            <div class="stat-value">${stats.overview.currentStreak} 🔥</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total repas</div>
            <div class="stat-value">${stats.overview.totalMeals}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total calories</div>
            <div class="stat-value">${stats.overview.totalCalories.toLocaleString()}</div>
        </div>
    </div>
    
    <h2>Moyennes quotidiennes</h2>
    <div class="stat-grid">
        <div class="stat-card">
            <div class="stat-label">Calories</div>
            <div class="stat-value">${stats.averages.dailyCalories}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Protéines</div>
            <div class="stat-value">${stats.averages.protein}g</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Glucides</div>
            <div class="stat-value">${stats.averages.carbs}g</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Lipides</div>
            <div class="stat-value">${stats.averages.fats}g</div>
        </div>
    </div>
    
    <h2>Taux de réussite</h2>
    <div class="stat-grid">
        <div class="stat-card">
            <div class="stat-label">Objectif calorique</div>
            <div class="stat-value">${stats.success.goalRate}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Hydratation</div>
            <div class="stat-value">${stats.success.waterRate}%</div>
        </div>
    </div>
    
    <div class="footer">
        <p>Rapport généré par NutriSport - ${new Date().toLocaleString('fr-FR')}</p>
        <p>© 2025 NutriSport. Votre partenaire nutrition pour la performance sportive.</p>
    </div>
</body>
</html>
    `;
    
    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Auto print dialog
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export all data as JSON backup
function exportAllDataJSON() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const allData = {
        user: user,
        profile: JSON.parse(localStorage.getItem(`profile_${user.email}`) || '{}'),
        goal: JSON.parse(localStorage.getItem(`goal_${user.email}`) || '{}'),
        diary: JSON.parse(localStorage.getItem(`foodDiary_${user.email}`) || '{}'),
        waterHistory: JSON.parse(localStorage.getItem(`waterHistory_${user.email}`) || '{}'),
        achievements: JSON.parse(localStorage.getItem(`achievements_${user.email}`) || '{}'),
        favorites: JSON.parse(localStorage.getItem(`foodFavorites_${user.email}`) || '[]'),
        chatHistory: JSON.parse(localStorage.getItem(`chatHistory_${user.email}`) || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(allData, null, 2);
    downloadFile(json, `nutrisport-backup-${user.email}-${Date.now()}.json`, 'application/json');
}

// Export functions
window.exportSystem = {
    toPDF: exportToPDF,
    diaryToCSV: exportDiaryToCSV,
    weightToCSV: exportWeightToCSV,
    statsReport: exportStatisticsReport,
    allDataJSON: exportAllDataJSON
};
