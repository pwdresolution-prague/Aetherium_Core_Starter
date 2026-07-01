<!--TODO: Datové parametry napojení kurzů na backendový systém -->
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
