const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Public papkasidagi index.html faylini ko'rsatish
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io real vaqt aloqasi
io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  // Haydovchi GPS lokatsiyasini yuborganda
  socket.on('updateLocation', (data) => {
    console.log('GPS ma\'lumoti keldi:', data);
    io.emit('driverLocationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
});
