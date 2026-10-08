const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: {
    address: String,
    coordinates: [Number] // [longitude, latitude]
  },
  destination: {
    address: String,
    coordinates: [Number]
  },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['created', 'accepted', 'in_progress', 'completed', 'cancelled'], 
    default: 'created' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
