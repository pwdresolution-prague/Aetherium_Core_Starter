//TODO: Struktura datového modelu identifikačních údajů standartního kurzu v rozhraní Student


const eventSchema = {
  id: "uuid",
  type: "test_completed",
  user_id: "uuid",
  client_id: "uuid", // Pro vazbu na firmu (Klient) [8]
  course_id: "bozp-001", // Konkrétní typ kurzu [4]
  created_at: "2025-06-26T10:30:00Z",
  meta: {
    score: 100,
    attempt: 1,
    duration_seconds: 450,
    status: "active", // Status studenta v poměru k firmě [9]
    is_recertification: true // Zda jde o opakované školení po expiraci [7]
  }
}



//TODO: Struktura procesů standartního uživatelského účtu "Student" z hlediska probíhajícícch událostí v panelu "Frontend_Student"


const eventTypes = {
    //TODO: Kurzy ====================================================
    "course_created": {label: "kurz_vytvořen", icon: "ti ti_education" },
    "course_in_process": {label: "kurz_v_processu", icon: "ti ti_education" },
    "course_reloaded": {label: "kurz_znovu_načten", icon: "ti ti_education"},
    "course_unlocked": {label: "kurz_k_dispozici", icon: "ti ti_education" },
    "course_finished": {label: "kurz_dokončen", icon: "ti ti_education" },
    //TODO: Test ====================================================
    "test_created": {label: "test_vytvořen", icon: "ti ti_education" },
    "test_in_process": {label: "test_v_processu", icon: "ti ti_exams" },
    "test_reloaded": {label: "test_znovu_načten", icon: "ti ti_exams" },
    "test_unlocked": {label: "test_k_dispozici", icon: "ti ti_education" },
    "test_finished": {label: "test_dokončen", icon: "ti ti_exams" },
    //TODO: Certifkáty ==============================================
    "certificate_in_progress": {label: "certifikát_v_procesu", icon: "ti ti_legitimate" },
    "certificate_created": {label: "certifikát_vytvořen", icon: "ti ti_legitimate" },
    "certificate_ready_to_score": {label: "certifikát_připraven_k_náhledu", icon: "ti ti_legitimate" },
    "certificate_downloaded": {label: "stažení_certifikátu", icon: "ti ti_legitimate" },
    "certificate_data_expiration": {label: "certifikát_expirace", icon: "ti ti_legitimate" },
    //TODO: Uživatel ===============================================
    "created_user": {label: "uživatel_vytvořen", icon: "ti ti_user_active" },
    "delete_user": {label: "uživatel_zrušen", icon: "ti ti_user_active" },
    "login": {label: "uživatel_úspěšně_přihlášen", icon: "ti ti_user_active" },
    "log_out": {label: "uživatel_úspěšně_odhlášen", icon: "ti ti_user_active"},
    "user_change_password": {label: "uživatel_změna_hesla", icon: "ti ti_user_active" },
    "user_change_data": {label: "uživatel_změna_nastavení", icon: "ti ti_user_active" },
    //TODO: System_Log_Change =======================================
    "system_created_client_role": {label: "uživatel_klient_vytvořen_systémem", icon: "ti ti_user_role_active" },
    "system_send_new_message": {label: "nová_zpráva_generována_systémem", icon: "ti_ti_system_active" },
    "system_send_new_document": {label: "nový_přijatý_document", icon: "ti ti_system_active" },
    "system_unlocked_new_report": {label: "nový_report_připraven_k_náhledu", icon: "ti ti_system_active" },




    }



//TODO: Funkce pro vykreslení událostí v panelu "Frontend_Student" na základě datového modelu "eventSchema" a typů událostí "eventTypes"
function renderEvents(events) {
    const list = document.getElementById("event-list")


    list.innerHTML = ""

    if(!events || events.length === 0) {
        list.innerHTML = `<li class="event-time event-item--empty"> 
        <p class="event-items">Žádné události k zobrazení</p>
        </li>`
        return
            
    }



events.forEach(event => {
    const type = eventTypes[event.type] ?? { label: event.type, icon: "ti ti_management"}


    const date = new Date(event.created_at)
    const formattedDate = date.toLocaleString("cs-CZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    })


    //<li> s data - atributy pro pozdější filtrování / styling

    const li = document.createElement("li")

    li.className = `event-time event-item--${event.type}`
    li.dataset.eventId = event.id
    li.dataset.eventType = event.type
    li.dataset.userId = event.user_id
    li.dataset.message = event.message

    

    li.innerHTML = `
                <span class="event-icon ${type.icon}" aria-hidden="true"></span>
                <div class="event-body">
                <p class="event-news">${event.message}</p>
                <time class="event-time" date-time="${event.created_at}">${formattedDate}</time>
                </div>`

list.appendChild(li)


})







}


//BACKEND: Připojení jako událostní typ dat 

const mock_events = [
    {
        id: "1",
        type: "course_completed",
        message: "Právě jste dokončil/a kurz BOZP",
        user_id: "user_001",
        created_at: "2025-06-26T10:30:00Z",

    }, 

    {
        id: "2",
        type: "test_passed",
        message: "Úspěšně jste složil test Požární ochrana",
        user_id: "User_001",
        created_at: "2025-06-26T10:30:00Z",

    },

     {
        id: "3",
        type: "Certificated_issued",
        message: "Právě je generován certifikát...",
        user_id: "User_001",
        created_at: "2025-06-26T10:30:00Z",
         

     }



   
]



document.addEventListener("DOMContentLoaded", () => {
    renderEvents(mock_events)

})
