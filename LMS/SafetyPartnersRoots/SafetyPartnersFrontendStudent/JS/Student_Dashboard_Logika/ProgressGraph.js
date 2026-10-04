import Chart from 'chart.js/auto'

const MODULE_STATUS_COLORS = {
    completed: '#f7943c',
    inProgress: '#f7b733',
    notStarted: 'rgba(255, 255, 255, 0.15)',

}

/**
 * COMMENT: Vykresluje Donut graf podle stavu modulů
 * @param  {string} canvasId - id <canvas> elementu
 * @param {string} motivationElId - id <p> elementu pro motivační text
 * @param {Array} modules - pole objektů { id, status: 'completed' | 'inProgress' | 'notStarted' }
 */

//FRONTEND: Funkce ===================================================================
export function renderModuleProgressChart(canvasId, motivationElId, modules) {
    const completed = modules.filter(m => m.status === 'completed').length
    const inProgress = modules.filter(m => m.status === 'inProgress').length
    const notStarted = modules.length - completed - inProgress
    const percent = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0

    const canvas = document.getElementById(canvasId)
    if (!canvas) {
        console.warn(`renderModuleProgressChart: canvas #${canvasId} nenalezen`)
        return
    }

    new Chart(canvas,  {
        type: 'doughnut',
        data: {
            labels: ['Dokončeno', 'Rozpracované', 'Nespuštěné'],
            datasets: [{
                data: [completed, inProgress, notStarted],
                backgroundColor: [
                    MODULE_STATUS_COLORS.completed,
                    MODULE_STATUS_COLORS.inProgress,
                    MODULE_STATUS_COLORS.notStarted,
                ],
                borderWidth: 0,
            }],
        },
        options: {
            cutout: '70%', //Stejný "donut" vzhled, jaký dřív dělal CSS conic-gradient
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'white', font: { size: 11} },
                },
                tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.raw} z ${modules.length} modulů`,
                    },
                },
            },
        },
    })

    const motivationEl = document.getElementById(motivationElId)
    if (motivationEl) {
        motivationEl.textContent = getMotivationText(percent, notStarted + inProgress)

    }

}

function getMotivationText(percent, remainingCount) {
    if (percent === 100) return 'Hotovo! Certifikát je na cestě'
    if (percent >= 75) {
        const word = remainingCount === 1 ? 'module' : 'moduly'
        return `Skvělé, zbývá Vám jen ${remainingCount} ${word}!`

    }
    if (percent >= 40) return 'Fajn práce - Pokračujte '
    if (percent > 0) return 'Dobrý start. Další krok k dokončení'
    return 'Začněte prvním modulem - zabere to chvíli'

}
