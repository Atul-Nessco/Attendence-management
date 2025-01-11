require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 9008;

if (!PORT) {
  console.error('PORT is not defined in the environment variables');
  process.exit(1);
}

function startServer(port) {
  if (port >= 65536) {
    console.error('No available ports');
    process.exit(1);
  }
  app
    .listen(port, () => {
      console.log(`Server is running on port ${port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use, trying the next one.`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
}

app.use(cors({
  origin: '*', // Allows requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', reportRoutes);
app.use('/testing', (req, res) => {
  res.send('This is a test endpoint');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

startServer(PORT);
