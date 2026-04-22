import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import callLogRoutes from './routes/callLogRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // ← NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes); // ← NEW

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