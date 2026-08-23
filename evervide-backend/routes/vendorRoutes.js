const express = require("express");
const router = express.Router();
const VendorRequest = require("../models/VendorRequest");
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.post("/request", async (req, res) => {
  try {
    const { userId, businessName, phone, location, description, images } = req.body;

    const request = new VendorRequest({
      userId,
      businessName,
      phone,
      location,
      description,
      images
    });

    await request.save();

    res.json({ message: "Request submitted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requests", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const requests = await VendorRequest.find({
      status: "pending"
    }).populate("userId").sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/approved", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const approvedRequests = await VendorRequest.find({
      status: "approved"
    }).populate("userId").sort({ updatedAt: -1 });
    res.json(approvedRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/approve", verifyToken, verifyAdmin, async (req, res) => {
  const { requestId } = req.body;

  const request = await VendorRequest.findById(requestId);

  await User.findByIdAndUpdate(request.userId, {
    role: "vendor"
  });

  request.status = "approved";
  await request.save();

  res.json({ message: "Approved" });
});

router.post("/reject", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await VendorRequest.findById(requestId);

    request.status = "rejected";
    await request.save();

    res.json({ message: "Rejected" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;