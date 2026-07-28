require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const policyRoutes = require('./routes/policy.routes');
const claimRoutes = require('./routes/claim.routes');
const premiumRoutes = require('./routes/premium.routes');
const documentRoutes = require('./routes/document.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');
const auditRoutes = require('./routes/audit.routes');
const errorHandler = require('./middleware/errorHandler');
const startDueReminderJob = require('./utils/dueReminderCron');

// Import your mongoose/database connection instance and User model if separate
// Example: const connectDB = require('./config/db');
// Example: const User = require('./models/user.model');

const app = express();

// Updated CORS configuration to support your Vercel frontend and local development
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
  'https://insurance-platform-j5gi-7wrfv97ew.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/premiums', premiumRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Root welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Insurance Platform API is running successfully!' });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// --- AUTO-SEED FUNCTION FOR CLOUD DEPLOYMENTS ---
const seedDemoUsersOnStartup = async () => {
  try {
    const User = require('./models/user.model'); // Adjust path to your User model if needed
    const bcrypt = require('bcryptjs');

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('No admin found on live database. Auto-seeding demo accounts...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt); // Change default demo password if needed

      await User.insertMany([
        { name: 'Demo Admin', email: 'admin@insurance.com', password: hashedPassword, role: 'admin' },
        { name: 'Demo Agent', email: 'agent@insurance.com', password: hashedPassword, role: 'agent' },
        { name: 'Demo Customer', email: 'customer@insurance.com', password: hashedPassword, role: 'customer' }
      ]);

      console.log('Demo accounts successfully seeded on live database!');
    }
  } catch (err) {
    console.error('Auto-seed check failed or skipped:', err.message);
  }
};
// ------------------------------------------------

const PORT = process.env.PORT || 5000;

// Run seed function right before starting the listener (or place it inside your mongoose connection callback)
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedDemoUsersOnStartup();
  startDueReminderJob();
});