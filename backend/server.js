const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes      = require('./routes/auth.routes');
const employeeRoutes  = require('./routes/employee.routes');
const userRoutes      = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

dotenv.config();

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // Allow all vercel.app and netlify.app subdomains
    if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true); // open during setup — tighten after deploy
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

app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API', version: '1.0.0' });
});

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server for local dev
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
