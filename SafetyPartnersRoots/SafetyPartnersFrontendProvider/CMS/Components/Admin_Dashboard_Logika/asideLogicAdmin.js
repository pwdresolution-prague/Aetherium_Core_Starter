const SYSTEM_ONLINE = true

const diode = document.getElementById('activeDiode')
const raw_progress = document.getElementById('raw_progress')

//TODO: Aplikace funkčního stavu lED indikace aktivity......

function applyState(isOnline) {
    diode.classList.toggle('on', isOnline)
    diode.classList.toggle('off', !isOnline)

}

applyState(SYSTEM_ONLINE)
raw_progress.value = SYSTEM_ONLINE ? 1 : 0



//TODO:
//IMPORTANT: JS Logika násobení monitoringu aktivních prvků led indikace provozu 
// 


const diodeContainer = document.querySelector('.activeDashboard')
const eventList = document.getElementById('event-list')

const indicationSignal = [

    { id: 'diode_Db', label: 'Databáze', status: 'off' },
    { id: 'diode_api', label: 'Api_Vrstva', status: 'off' },
    { id: 'diode_Auth', label: 'Authorizace_Připojení', status: 'off' },
    
]


indicationSignal.forEach(sig => {
    //TODO: Vytvoření nové indikační diody
    
    const diodeIndication = document.createElement('div')
    diodeIndication.className = `diodeLed ${sig.status}`
    diodeIndication.id = sig.id
    diodeIndication.setAttribute(`aria-live`, `polite`)
    diodeIndication.setAttribute(`aria-label`, sig.label)
    diodeContainer.appendChild(diodeIndication)

    //TODO: Nový event řádek 
    
    const liAdmin = document.createElement(`li`)
    liAdmin.className = 'eventActive'
    liAdmin.innerHTML = `<p class="eventActivePart">${sig.label}</p>`
    eventList.appendChild(liAdmin)

    




const row = document.createElement('div')

row.className = 'signal-row'
row.innerHTML = `
  <div class="diodeLed ${sig.status}" 
       id="${sig.id}" 
       aria-live="polite" 
       aria-label="${sig.label}">
  </div>
  <span class="eventActivePart">${sig.label}</span>
`
diodeContainer.appendChild(row)

})

//TODO: Dvojité přidání elementu v části row class
//       