// TelemetryCharts.js
import Chart from 'chart.js/auto'

//TODO: Barevná paleta - stejná jako v ProgressGraph.js, at je to vizuálně jednotné
const PALETTE = {
    primary: '#FF6700',
    secondary: '#f7b733',
    muted: 'rgba(255, 255, 255, 0.15)',
    danger: '#E24B4A',
}

//IMPORTANT: Registr aktivních instancí grafů - podle canvas id
// Bez tohohle by druhé otevření dialogu spadlo na "Canvas is already in use"
const activeCharts = new Map()

function renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
        console.warn(`renderChart: canvas #${canvasId} nenalezen`)
        return
    }

    // Zničit předchozí instanci, pokud existuje (re-render při dalším otevření)
    if (activeCharts.has(canvasId)) {
        activeCharts.get(canvasId).destroy()
    }

    const chart = new Chart(canvas, config)
    activeCharts.set(canvasId, chart)
}

//FRONTEND: Aktuální návštěvnost ==========================================
export function renderAttendanceCharts(data) {
    renderChart('attendanceTimeLineChart', {
        type: 'line',
        data: {
            labels: data.timeline.labels, // ['00:00', '04:00', '08:00', ...]
            datasets: [{
                label: 'Uživatelé online',
                data: data.timeline.values,
                borderColor: PALETTE.primary,
                backgroundColor: 'rgba(255, 103, 0, 0.15)',
                fill: true,
                tension: 0.3,
            }],
        },
        options: baseLineOptions(),
    })

    renderChart('attendanceRoleChart', {
        type: 'doughnut',
        data: {
            labels: ['Studenti', 'Klienti', 'Subscriberi'],
            datasets: [{
                data: data.byRole, // [12, 4, 1]
                backgroundColor: [PALETTE.primary, PALETTE.secondary, PALETTE.muted],
                borderWidth: 0,
            }],
        },
        options: baseDoughnutOptions(),
    })

    renderChart('attendanceDeviceChart', {
        type: 'bar',
        data: {
            labels: ['Desktop', 'Mobil', 'Tablet'],
            datasets: [{
                data: data.byDevice, // [10, 6, 1]
                backgroundColor: PALETTE.primary,
            }],
        },
        options: baseBarOptions(),
    })

    document.getElementById('avgSessionValue').textContent = data.avgSessionMinutes + ' min'
}

//FRONTEND: Aktivní kurzy ==================================================
export function renderCourseCharts(data) {
    renderChart('coursesTopChart', {
        type: 'bar',
        data: {
            labels: data.topCourses.map(c => c.name),
            datasets: [{
                data: data.topCourses.map(c => c.activeStudents),
                backgroundColor: PALETTE.primary,
            }],
        },
        options: { ...baseBarOptions(), indexAxis: 'y' },
    })

    renderChart('coursesCompletionChart', {
        type: 'doughnut',
        data: {
            labels: ['Dokončeno', 'Rozpracováno', 'Nezahájeno'],
            datasets: [{
                data: data.completion, // [45, 30, 25]
                backgroundColor: [PALETTE.primary, PALETTE.secondary, PALETTE.muted],
                borderWidth: 0,
            }],
        },
        options: baseDoughnutOptions(),
    })

    renderChart('coursesEnrollmentChart', {
        type: 'line',
        data: {
            labels: data.enrollments.labels, // posledních 7 dní
            datasets: [{
                data: data.enrollments.values,
                borderColor: PALETTE.secondary,
                backgroundColor: 'rgba(247, 183, 51, 0.15)',
                fill: true,
                tension: 0.3,
            }],
        },
        options: baseLineOptions(),
    })

    document.getElementById('avgCompletionValue').textContent = data.avgCompletionDays + ' dní'
}

//FRONTEND: Obsahová databáze ==============================================
export function renderContentCharts(data) {
    renderChart('contentTypeChart', {
        type: 'doughnut',
        data: {
            labels: ['Kurzy', 'Testy', 'Certifikáty', 'Legislativa'],
            datasets: [{
                data: data.byType,
                backgroundColor: [PALETTE.primary, PALETTE.secondary, PALETTE.danger, PALETTE.muted],
                borderWidth: 0,
            }],
        },
        options: baseDoughnutOptions(),
    })

    renderChart('contentStorageChart', {
        type: 'bar',
        data: {
            labels: ['Kurzy', 'Testy', 'Certifikáty', 'Legislativa'],
            datasets: [{
                data: data.storageMb,
                backgroundColor: PALETTE.secondary,
            }],
        },
        options: baseBarOptions(),
    })

    renderChart('contentGrowthChart', {
        type: 'line',
        data: {
            labels: data.growth.labels, // posledních 30 dní
            datasets: [{
                data: data.growth.values,
                borderColor: PALETTE.primary,
                fill: false,
                tension: 0.3,
            }],
        },
        options: baseLineOptions(),
    })

    const list = document.getElementById('contentRecentList')
    list.innerHTML = data.recent
        .map(item => `<li>${item.updatedAt} — ${item.title}</li>`)
        .join('')
}

//FRONTEND: Behaviorální biometrie =========================================
export function renderBiometryCharts(data) {
    renderChart('biometryScoreChart', {
        type: 'line',
        data: {
            labels: data.scoreTrend.labels, // posledních 20 pokusů
            datasets: [{
                data: data.scoreTrend.values,
                borderColor: PALETTE.primary,
                backgroundColor: 'rgba(255, 103, 0, 0.15)',
                fill: true,
                tension: 0.2,
            }],
        },
        options: baseLineOptions(100), // max osa Y = 100 (%)
    })

    renderChart('biometryEventsChart', {
        type: 'bar',
        data: {
            labels: ['Ztráta pozornosti', 'Paste detekce', 'Podezřelý vzorec'],
            datasets: [{
                data: data.eventsToday,
                backgroundColor: PALETTE.danger,
            }],
        },
        options: baseBarOptions(),
    })

    renderChart('biometryRhythmChart', {
        type: 'line',
        data: {
            labels: data.rhythm.labels, // pořadí kláves
            datasets: [{
                label: 'Dwell time (ms)',
                data: data.rhythm.dwell,
                borderColor: PALETTE.secondary,
                tension: 0.1,
            }],
        },
        options: baseLineOptions(),
    })

    const list = document.getElementById('biometryFlaggedList')
    list.innerHTML = data.flagged
        .map(f => `<li>${f.studentName} — ${f.testName} (${f.score}%)</li>`)
        .join('')
}

//TODO: Sdílené výchozí options - jednotný vzhled napříč všemi grafy =========
function baseLineOptions(maxY) {
    return {
        scales: {
            y: { max: maxY, ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { ticks: { color: 'white' }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
    }
}

function baseBarOptions() {
    return {
        scales: {
            y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { ticks: { color: 'white' }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
    }
}

function baseDoughnutOptions() {
    return {
        cutout: '65%',
        plugins: {
            legend: { position: 'bottom', labels: { color: 'white', font: { size: 10 } } },
        },
    }
}
