// MockTelemetryData.js
// FRONTEND: Simulovaná telemetrická data pro vývoj UI, dokud není napojený Supabase.
// LOGIKA: Tvar musí přesně sedět na to, co čekají render funkce v TelemetryLogic.js.

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function last7Days() {
    const labels = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        labels.push(d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }))
    }
    return labels
}

export function generateAttendanceData() {
    return {
        timeline: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            values: Array.from({ length: 6 }, () => randomInt(2, 25)),
        },
        byRole: [randomInt(5, 20), randomInt(1, 8), randomInt(0, 4)],
        byDevice: [randomInt(5, 15), randomInt(2, 10), randomInt(0, 3)],
        avgSessionMinutes: randomInt(8, 40),
    }
}

export function generateCourseData() {
    const names = ['BOZP základní', 'Požární ochrana', 'Práce ve výškách', 'První pomoc', 'Řidiči referenti']
    return {
        topCourses: names.map((name) => ({ name, activeStudents: randomInt(3, 30) })),
        completion: [randomInt(30, 60), randomInt(15, 35), randomInt(10, 25)],
        enrollments: { labels: last7Days(), values: Array.from({ length: 7 }, () => randomInt(1, 12)) },
        avgCompletionDays: randomInt(2, 14),
    }
}

export function generateContentData() {
    return {
        byType: [randomInt(20, 80), randomInt(10, 40), randomInt(5, 25), randomInt(2, 15)],
        storageMb: [randomInt(50, 400), randomInt(20, 150), randomInt(10, 80), randomInt(5, 40)],
        growth: {
            labels: Array.from({ length: 10 }, (_, i) => `Den ${i + 1}`),
            values: Array.from({ length: 10 }, (_, i) => randomInt(100, 100 + i * 20)),
        },
        recent: [
            { updatedAt: '13.09.2026', title: 'BOZP základní — aktualizace testu' },
            { updatedAt: '12.09.2026', title: 'Požární ochrana — nový modul' },
            { updatedAt: '10.09.2026', title: 'Práce ve výškách — oprava obrázku' },
        ],
    }
}

export function generateBiometryData() {
    return {
        scoreTrend: {
            labels: Array.from({ length: 20 }, (_, i) => `#${i + 1}`),
            values: Array.from({ length: 20 }, () => randomInt(70, 100)),
        },
        eventsToday: [randomInt(0, 10), randomInt(0, 5), randomInt(0, 3)],
        rhythm: {
            labels: Array.from({ length: 15 }, (_, i) => `${i + 1}`),
            dwell: Array.from({ length: 15 }, () => randomInt(80, 220)),
        },
        flagged: [
            { studentName: 'Jan Novák', testName: 'BOZP základní', score: 62 },
            { studentName: 'Petra Svobodová', testName: 'Požární ochrana', score: 71 },
        ],
    }
}
