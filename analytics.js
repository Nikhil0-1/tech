// EDUTUG INDIA - Analytics Module

class AnalyticsEngine {
    constructor() {
        this.db = window.edutugDb;
    }

    async getSchoolPerformance(schoolId) {
        // Mock returning data since Firebase DB is not populated yet
        return {
            total_games: 145,
            avg_score_team1: 450,
            avg_score_team2: 420,
            top_performing_class: 'Class 10',
            weakest_topic: 'Geometry'
        };
    }

    async getClassHeatmap(classId) {
        // Generates data for a heatmap visualization
        return {
            'Algebra': 85, // 85% correct rate
            'Geometry': 45,
            'Trigonometry': 60,
            'Statistics': 90
        };
    }

    downloadCSV(data, filename) {
        const csvRows = [];

        // Get headers
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        // Loop over rows
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

window.edutugAnalytics = new AnalyticsEngine();
