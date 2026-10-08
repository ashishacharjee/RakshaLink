require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
const webPath = path.join(__dirname, '../web');
app.use(express.static(webPath));

app.get('/rider', (req, res) => res.sendFile(path.join(webPath, 'rider/index.html')));
app.get('/console', (req, res) => res.sendFile(path.join(webPath, 'console/index.html')));
app.get('/r/:token', (req, res) => res.sendFile(path.join(webPath, 'accept/index.html')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic API scaffolding (to be expanded in next stages)
app.get('/api/events', (req, res) => {
  res.json(store.getEvents());
});

app.get('/api/responders', (req, res) => {
  res.json(store.getResponders());
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RakshaLink API running on http://localhost:${PORT}`);
});
