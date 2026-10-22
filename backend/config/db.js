const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'svkm_hostel_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 5 : 10,
    queueLimit: 0,
    connectTimeout: 10000
};

// Enable SSL if explicitly requested or if connecting to a remote host (e.g., Aiven, TiDB, PlanetScale, Clever Cloud)
if (process.env.DB_SSL === 'true' || (!isLocal && process.env.DB_SSL !== 'false')) {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
