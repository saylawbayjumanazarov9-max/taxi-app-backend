const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Ride = require('./models/Ride');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB-ga ulanish
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taxidb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB-ga muvaffaqiyatli ulanindi'))
  .catch((err) => console.error('Baza ulanishida xatolik:', err));

// Bosh sahifa
app.get('/', (req, res) => {
  res.send('Taksi ilovasi backend API ishlamoqda!');
});

// 1. Foydalanuvchi/Haydovchini ro'yxatdan o'tkazish
app.post('/api/users/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Taksi buyurtma qilish (Yo'lovchi)
app.post('/api/rides/request', async (req, res) => {
  try {
    const { passengerId, pickupLocation, destination, price } = req.body;
    const ride = new Ride({
      passenger: passengerId,
      pickupLocation,
      destination,
      price
    });
    await ride.save();
    res.status(201).json({ success: true, message: 'Buyurtma yaratildi', ride });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Aktiv buyurtmalarni ko'rish (Haydovchi)
app.get('/api/rides/available', async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'created' }).populate('passenger', 'name phone');
    res.json({ success: true, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Buyurtmani qabul qilish (Haydovchi)
app.post('/api/rides/accept', async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { driver: driverId, status: 'accepted' },
      { new: true }
    );
    res.json({ success: true, message: 'Buyurtma qabul qilindi', ride });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});
