// Na začátku entry pointu (index.js / app.js)
require('dotenv').config();

// Pak kdekoliv v kódu:
const dbHost = process.env.DB_HOST;
const port = process.env.APP_PORT || 3000;