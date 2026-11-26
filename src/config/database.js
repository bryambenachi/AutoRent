
const { Pool } = require('pg');

const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5433),
    database: process.env.DB_NAME || 'autorent',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123'
});

db.on('error', (error) => {
    console.error('Error en PostgreSQL:', error);
});

module.exports = db;
