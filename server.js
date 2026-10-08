const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const user = require('./models/User');
const ride = require('./models/Ride');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(cors());

// MongoDB-ga ulanish
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taxidb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB-ga muvaffaqiyatli ulanindi'))
  .catch((err) => console.error('Baza ulanishida xatolik:', err));

// --- WebSocket (Real-vaqt rejimida muloqot) ---
io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  // Haydovchi o'z geolokatsiyasini yuborganda
  socket.on('updateLocation', async (data) => {
    const { driverId, latitude, longitude } = data;
    
    // Haydovchining koordinatasini yangilash
    await User.findByIdAndUpdate(driverId, {
      location: { type: 'Point', coordinates: [longitude, latitude] },
      isOnline: true
    });

    // Atrofdagilarga haydovchining yangi o'rnini uzatish
    io.emit('driverMoved', { driverId, latitude, longitude });
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

// --- REST API Yo'nalishlari ---

app.get('/', (req, res) => {
  res.send('Taksi ilovasi WebSocket Serveri ishlamoqda!');
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

// 2. Taksi buyurtma qilish (Yo'lovchi) va Real-vaqtda haydovchilarga bildirishnoma yuborish
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

    // Barcha onlayn haydovchilarga yangi buyurtma kelganini e'lon qilish
    io.emit('newRideAvailable', ride);

    res.status(201).json({ success: true, message: 'Buyurtma yaratildi', ride });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Buyurtmani qabul qilish (Haydovchi)
app.post('/api/rides/accept', async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { driver: driverId, status: 'accepted' },
      { new: true }
    );

    // Yo'lovchiga buyurtmasi qabul qilinganligini xabar qilish
    io.emit('rideAccepted', ride);

    res.json({ success: true, message: 'Buyurtma qabul qilindi', ride });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});
