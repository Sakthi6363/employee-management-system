const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes      = require('./routes/auth.routes');
const employeeRoutes  = require('./routes/employee.routes');
const userRoutes      = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Employee Management API is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API v1.0' });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Only listen when running locally (not as serverless function)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
