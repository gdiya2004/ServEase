const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },

  // 👤 Who booked
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🏢 Which vendor gets this booking
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🧾 Booking details
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "completed"],
    default: "pending"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);