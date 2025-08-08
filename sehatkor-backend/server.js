import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/index.js';
import uploadRoutes from './routes/upload.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'], // Allow both ports
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/admin', adminRoutes);

console.log('🟢 server.js starting...');
let PORT = process.env.PORT;
if (!PORT || isNaN(Number(PORT))) {
  console.warn('⚠️  Invalid or missing PORT in .env. Using default port 4000.');
  PORT = 4000;
} else {
  PORT = Number(PORT);
}
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
