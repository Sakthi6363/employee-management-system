const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes      = require('./routes/auth.routes');
const employeeRoutes  = require('./routes/employee.routes');
const userRoutes      = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

dotenv.config();

const app = express();

// CORS — allow localhost in dev, Netlify URL in production
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,   // e.g. https://your-app.netlify.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);          // curl / Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Employee Management API is running' });
});

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
