const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { setupLogger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const fraudRoutes = require('./routes/fraud');
const simulationRoutes = require('./routes/simulation');
const chatbotRoutes = require('./routes/chatbot');

// Initialize express app
const app = express();

// Setup logger
const logger = setupLogger();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling middleware
app.use(errorHandler);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Telecom Fraud Awareness Platform API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;
