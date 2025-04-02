const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const configureAWS = require('./config/db');

// Load env vars
dotenv.config();

// Configure AWS SDK
configureAWS();

// Route files
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Post-it API is running' });
});

// Port setup
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 