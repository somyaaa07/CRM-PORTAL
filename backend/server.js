import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize }  from './models/index.js';
import authRoutes     from './routes/authRoutes.js';
import leadRoutes     from './routes/leadRoutes.js';
import callLogRoutes  from './routes/callLogRoutes.js';
import alertRoutes    from './routes/alertRoutes.js';
import adminRoutes    from './routes/adminRoutes.js';
import webhookRoutes  from './routes/webhookRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'
dotenv.config();

const app = express();

// ✅ STEP 1: Webhook SABSE PEHLE — koi middleware nahi


// ✅ STEP 2: Phir baaki middleware
app.use(cors());
app.use(express.json());
app.use('/webhook', webhookRoutes);

// ✅ STEP 3: Phir routes
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/alerts',    alertRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/', (req, res) => {
  res.json({ message: '✅ CRM Backend is running!' });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('✅ MySQL connected & tables synced!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err.message);
  });