//TODO: Struktura datového modelu identifikačních údajů standartního kurzu v rozhraní Admin


const eventAdminSchema = {
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

const eventAdminType = {
    //TODO: Kurzy ==============================================
    "course_created": {label: "kurz_vytvořen", icon: "ti ti_education" },
    "course_edit_change": {label: "kurz_změněn", icon: "ti ti_education" },
    "course_ready_to_public": {label: "kurz_připraven_k_publikaci", icon: "ti ti_education" },
    "course_ready_to_unlocked": {label: "kurz_odemčen", icon: "ti ti_education" },
    "course_locked": {label: "kurz_uzamčen", icon: "ti ti_education" },
    //TODO: Testy ==============================================
    "test_created": {label: "test_vytvořen", icon: "ti ti_education" },
    "test_edit_change": {label: "test_změněn", icon: "ti ti_exams" },
    "test_ready_to_public": {label: "test_připraven_k_publikaci", icon: "ti ti_exams" },
    "test_ready_to_unlocked": {label: "test_odemčen", icon: "ti ti_education" },
    "test_locked": {label: "test_uzamčen", icon: "ti ti_education" },
    //TODO: Certifikáty ========================================
    "certificate_in_progress": {label: "certifikát_v_procesu", icon: "ti ti_legitimate" },
    "certificate_created": {label: "certifikát_vytvořen", icon: "ti ti_legitimate" },
    "certificate_ready_to_score": {label: "certifikát_připraven_k_náhledu", icon: "ti ti_legitimate" },
    "certificate_downloaded": {label: "stažení_certifikátu", icon: "ti ti_legitimate" },
    "certificate_data_expiration": {label: "certifikát_expirace", icon: "ti ti_legitimate" },
    //TODO: Uživatelé ==========================================
    "created_user": {label: "uživatel_vytvořen", icon: "ti ti_user_active" },
    "delete_user": {label: "uživatel_zrušen", icon: "ti ti_user_active" },
    "login": {label: "uživatel_úspěšně_přihlášen", iconn: "ti ti_user_active" },
    "log_out": {label: "uživatel_úspěšně_odhlášen", icon: "ti ti_user_active"},
    "user_change_password": {label: "uživatel_změna_hesla", icon: "ti ti_user_active" },
    "user_change_data": {label: "uživatel_změna_nastavení", icon: "ti ti_user_active" },
    //TODO: Vstupní integrita ==================================
    "legislative_import_applied": {label: "import_legislativních_dat", icon: "ti ti_data_scale" },
    "legislative_update_applied": {label: "aktualizace_legislativního_rámce", icon: "ti ti_data_scale", },
    




    
}