const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB-ga ulanish
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taxidb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB-ga ulanildi'))
  .catch((err) => console.error('Baza ulanishida xatolik:', err));

// Bosh sahifa uchun test API
app.get('/', (req, res) => {
  res.send('Taksi ilovasi backend API ishlamoqda!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});
