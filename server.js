const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Public papkasini statik fayllar uchun ochamiz
app.use(express.static(path.join(__dirname, 'public')));

// Bosh sahifa uchun client.html ni yuboramiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// Socket.io ulanishlari
io.on('connection', (socket) => {
    console.log('Yangi foydalanuvchi ulandi:', socket.id);

    // 1. Haydovchidan kelgan GPS koordinatalarni mijozlarga uzatish
    socket.on('updateLocation', (data) => {
        io.emit('driverLocationUpdated', data);
    });

    // 2. Mijozdan yangi buyurtma kelganida haydovchilar uchun e'lon qilish
    socket.on('new_order', (orderData) => {
        console.log('Yangi buyurtma qabul qilindi:', orderData);
        
        // Barcha ulandan haydovchilarga buyurtmani yuboramiz
        io.emit('order_received', {
            orderId: socket.id,
            pickup: orderData.pickup,
            destination: orderData.destination
        });
    });

    socket.on('disconnect', () => {
        console.log('Foydalanuvchi uzildi:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishlamoqda...`);
});
