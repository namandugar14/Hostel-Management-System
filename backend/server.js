const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hostels', require('./routes/hostel'));
app.use('/api/rooms', require('./routes/room'));
app.use('/api/mess', require('./routes/mess'));
app.use('/api/complaints', require('./routes/complaint'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dc', require('./routes/dcRoutes'));
app.use('/api/damages', require('./routes/damageRoutes'));
app.use('/api/outings', require('./routes/outingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'API is running',
        environment: process.env.NODE_ENV || 'development',
        database_host: process.env.DB_HOST || 'localhost'
    });
});

if (process.env.VERCEL !== '1' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
