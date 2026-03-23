// src/index.js
require('dotenv').config(); // charger les variables du .env
const express = require('express');
const authRoutes = require('./routes/auth'); 
const livreRoutes = require('./routes/livres'); 

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/livres', livreRoutes);


// Récupération du port depuis .env ou fallback à 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});