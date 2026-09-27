import { renderAttendanceCharts, renderCourseCharts, renderContentCharts, renderBiometryCharts } from './TelemetryLogic.js'
import { generateAttendanceData, generateCourseData, generateContentData, generateBiometryData } from './MockTelemetryData.js'

//LOGIKA: Mapa dialogId → co se má stát po otevření. Nové okno = jeden řádek sem.
const DIALOG_HANDLERS = {
    currentAttendanceDialog: () => renderAttendanceCharts(generateAttendanceData()),
    activeCoursesDialog:     () => renderCourseCharts(generateCourseData()),
    contentDatabaseDialog:   () => renderContentCharts(generateContentData()),
    biometryDialog:          () => renderBiometryCharts(generateBiometryData()),
}

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.telemetryCard')

    cards.forEach(card => {
        card.style.cursor = 'pointer'

        card.addEventListener('click', (event) => {
            if (event.target.closest('dialog')) return

            const dialogId = card.dataset.dialogId
            const dialog = document.getElementById(dialogId)

            if (dialog && !dialog.open) {
                dialog.showModal()

                //LOGIKA: Render AŽ PO showModal() — dokud je dialog zavřený, canvasy
                // mají nulovou výšku/šířku a Chart.js by je vykreslil prázdné
                DIALOG_HANDLERS[dialogId]?.()
            }
        })
    })

    document.querySelectorAll('.detailModal .modalClose').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation()
            btn.closest('dialog').close()
        })
    })

    document.querySelectorAll('.detailModal').forEach(dialog => {
        dialog.addEventListener('click', (event) => {
            const rect = dialog.getBoundingClientRect()
            const clickedInside =
                event.clientX >= rect.left && event.clientX <= rect.right &&
                event.clientY >= rect.top && event.clientY <= rect.bottom
            if (!clickedInside) dialog.close()
        })
    })
})
