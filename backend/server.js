require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const caseRoutes = require('./routes/cases');
const investigationRoutes = require('./routes/investigations');
const userRoutes = require('./routes/users');

const app = express();

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: config.nodeEnv === 'production' ? false : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api', userRoutes); // /api/leaderboard and /api/dashboard

// API health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MindMaze API is running.', timestamp: new Date().toISOString() });
});

// Serve frontend for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`\n🔍 MindMaze Server running in ${config.nodeEnv} mode`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   App: http://localhost:${PORT}\n`);
});

module.exports = { app, server };
