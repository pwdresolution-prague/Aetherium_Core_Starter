const SYSTEM_ONLINE = true

const diode = document.getElementById('activeDiode')
const raw_progress = document.getElementById('raw_progress')

//TODO: Aplikace funkčního stavu 

function applyState(isOnline) {
    diode.classList.toggle('on', isOnline)
    diode.classList.toggle('off', !isOnline)

}


applyState(SYSTEM_ONLINE)
raw_progress.value = SYSTEM_ONLINE ? 1 : 0










