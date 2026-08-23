const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Service = require("../models/Service");
const {verifyToken,verifyAdmin} = require("../middleware/auth");

router.post("/add", async (req, res) => {
  try {
    const { serviceId, name, phone, message, userId, eventDate } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check date availability if specified
    if (eventDate && service.bookedDates && service.bookedDates.includes(eventDate)) {
      return res.status(400).json({ message: "Selected event date is already booked or unavailable." });
    }

    const booking = new Booking({
      serviceId,
      userId,
      vendorId: service.owner,
      name,
      phone,
      message,
      eventDate: eventDate || ""
    });

    await booking.save();

    res.json({ message: "Booking request created successfully", booking });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendor/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({
      vendorId: req.params.id
    })
      .populate("serviceId")
      .populate("userId")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.params.id
    })
      .populate("serviceId")
      .populate("vendorId")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("serviceId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If confirmed, lock the event date on the Service
    if (status === "confirmed" && booking.eventDate && booking.serviceId) {
      await Service.findByIdAndUpdate(booking.serviceId._id || booking.serviceId, {
        $addToSet: { bookedDates: booking.eventDate }
      });
    }

    // If rejected, unblock date if desired
    if (status === "rejected" && booking.eventDate && booking.serviceId) {
      await Service.findByIdAndUpdate(booking.serviceId._id || booking.serviceId, {
        $pull: { bookedDates: booking.eventDate }
      });
    }

    res.json({ message: "Status updated", booking });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/service/:serviceId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      serviceId: req.params.serviceId
    }).sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("serviceId")
      .populate("userId")
      .populate("vendorId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;