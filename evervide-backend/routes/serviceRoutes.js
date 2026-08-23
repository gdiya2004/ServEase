const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

router.post("/add", async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { location, category, minPrice, maxPrice } = req.query;

    let filter = {};

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i" // ✅ case-insensitive
      };
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i"
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(filter);
    res.json(services);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendor/:id", async (req, res) => {
  try {
    const services = await Service.find({ owner: req.params.id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/availability", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ bookedDates: service.bookedDates || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/availability", async (req, res) => {
  try {
    const { date, action } = req.body; // action: 'block' | 'unblock'
    if (!date) {
      return res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    let dates = service.bookedDates || [];

    if (action === "unblock") {
      dates = dates.filter(d => d !== date);
    } else {
      if (!dates.includes(date)) {
        dates.push(date);
      }
    }

    service.bookedDates = dates;
    await service.save();

    res.json({ message: "Availability updated", bookedDates: service.bookedDates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;