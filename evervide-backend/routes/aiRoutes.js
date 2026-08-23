const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// 🤖 AI Event Concierge & Smart Budget Package Planner
router.post("/plan-event", async (req, res) => {
  try {
    const { eventType, location, guestCount, budget, preferences } = req.body;

    const numBudget = Number(budget) || 50000;
    const numGuests = Number(guestCount) || 100;
    const cleanLocation = (location || "").trim();
    const eventName = eventType || "Celebration Event";

    // 1. Fetch available services from DB matching location or general catalog
    let filter = {};
    if (cleanLocation) {
      filter.location = { $regex: cleanLocation, $options: "i" };
    }

    let availableServices = await Service.find(filter).populate("owner", "name email");
    
    // If no services in that specific location, fallback to all available services
    if (availableServices.length === 0) {
      availableServices = await Service.find().populate("owner", "name email");
    }

    // 2. Budget distribution percentages by event category
    // Typical event industry allocation benchmarks
    const budgetAllocations = {
      decor: 0.30,      // 30% on Decor & Venue styling
      catering: 0.35,   // 35% on Catering & Food
      photography: 0.20,// 20% on Photography & Videography
      music: 0.10,      // 10% on DJ / Music / Entertainment
      buffer: 0.05      // 5% contingency buffer
    };

    // 3. Intelligent Category Matcher & Optimizer
    const categorizedServices = {
      decor: availableServices.filter(s => /decor|stage|flower|design|hall|venue/i.test(s.category + " " + s.name)),
      catering: availableServices.filter(s => /cater|food|dinner|buffet|lunch|chef/i.test(s.category + " " + s.name)),
      photography: availableServices.filter(s => /photo|video|shoot|camera|album/i.test(s.category + " " + s.name)),
      music: availableServices.filter(s => /dj|music|band|sound|entertain/i.test(s.category + " " + s.name)),
      other: availableServices
    };

    const selectedPackage = [];
    let allocatedTotal = 0;

    // Helper to pick closest fitting service within budget quota
    const pickBestFit = (list, targetBudget, categoryName) => {
      if (!list || list.length === 0) return null;
      // Sort by price ascending
      const sorted = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
      // Try to find highest price under targetBudget, or lowest price available
      const fits = sorted.filter(s => (s.price || 0) <= targetBudget);
      const chosen = fits.length > 0 ? fits[fits.length - 1] : sorted[0];
      return chosen;
    };

    // Select Decor
    const targetDecorBudget = numBudget * budgetAllocations.decor;
    const decorPick = pickBestFit(categorizedServices.decor.length ? categorizedServices.decor : categorizedServices.other, targetDecorBudget, "Decor");
    if (decorPick) {
      selectedPackage.push({
        role: "Event Styling & Decoration",
        category: "Decoration",
        service: decorPick,
        allocatedBudget: targetDecorBudget,
        actualPrice: decorPick.price,
        notes: `Selected for ${numGuests} guests setup with full thematic aesthetics.`
      });
      allocatedTotal += decorPick.price;
    }

    // Select Catering
    const targetCateringBudget = numBudget * budgetAllocations.catering;
    const cateringPick = pickBestFit(categorizedServices.catering.length ? categorizedServices.catering : categorizedServices.other, targetCateringBudget, "Catering");
    if (cateringPick && (!decorPick || cateringPick._id.toString() !== decorPick._id.toString())) {
      selectedPackage.push({
        role: "Gourmet Catering & Dining",
        category: "Catering",
        service: cateringPick,
        allocatedBudget: targetCateringBudget,
        actualPrice: cateringPick.price,
        notes: `Crafted multi-course dining package tailored for ~${numGuests} attendees.`
      });
      allocatedTotal += cateringPick.price;
    }

    // Select Photography
    const targetPhotoBudget = numBudget * budgetAllocations.photography;
    const photoPick = pickBestFit(categorizedServices.photography.length ? categorizedServices.photography : categorizedServices.other, targetPhotoBudget, "Photography");
    if (photoPick && !selectedPackage.some(p => p.service._id.toString() === photoPick._id.toString())) {
      selectedPackage.push({
        role: "Cinematic Photography & Film",
        category: "Photography",
        service: photoPick,
        allocatedBudget: targetPhotoBudget,
        actualPrice: photoPick.price,
        notes: "Full-day candid coverage, high-resolution digital gallery, and portraits."
      });
      allocatedTotal += photoPick.price;
    }

    // Select DJ / Entertainment if budget allows
    const targetMusicBudget = numBudget * budgetAllocations.music;
    const musicPick = pickBestFit(categorizedServices.music.length ? categorizedServices.music : categorizedServices.other, targetMusicBudget, "Music");
    if (musicPick && !selectedPackage.some(p => p.service._id.toString() === musicPick._id.toString())) {
      selectedPackage.push({
        role: "Sound & Entertainment",
        category: "Entertainment",
        service: musicPick,
        allocatedBudget: targetMusicBudget,
        actualPrice: musicPick.price,
        notes: "Premium audio system and curated party playlist."
      });
      allocatedTotal += musicPick.price;
    }

    const remainingSavings = Math.max(0, numBudget - allocatedTotal);

    // AI Concierge Executive Summary & Event Itinerary
    const aiSummary = {
      eventTitle: `Custom AI Curated ${eventName}`,
      location: cleanLocation || "Selected Region",
      guestCount: numGuests,
      targetBudget: numBudget,
      totalPackageCost: allocatedTotal,
      savings: remainingSavings,
      budgetUtilization: `${Math.min(100, Math.round((allocatedTotal / numBudget) * 100))}%`,
      conciergeVerdict: allocatedTotal <= numBudget
        ? `✨ Excellent fit! We successfully optimized your ₹${numBudget.toLocaleString()} budget with an estimated saving of ₹${remainingSavings.toLocaleString()} for contingency.`
        : `⚠️ Your selections total ₹${allocatedTotal.toLocaleString()}, slightly exceeding the target by ₹${(allocatedTotal - numBudget).toLocaleString()}. Consider adjusting requirements.`,
      recommendedTimeline: [
        { time: "03:00 PM", activity: "Vendor Arrival & Stage Setup by Decoration Crew" },
        { time: "05:30 PM", activity: "Guest Arrival, Welcome Mocktails & Ambient Music" },
        { time: "07:00 PM", activity: "Main Ceremony / Keynote / Grand Entrance & Photo Session" },
        { time: "08:30 PM", activity: "Gourmet Buffet Dining & Dessert Station Open" },
        { time: "10:30 PM", activity: "Celebration Dance Floor & Concluding Photos" }
      ],
      packageItems: selectedPackage
    };

    res.json({ success: true, plan: aiSummary });

  } catch (err) {
    console.error("AI Planner error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI event plan" });
  }
});

module.exports = router;
