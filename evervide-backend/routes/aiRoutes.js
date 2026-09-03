const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// 🤖 AI Event Concierge & Smart Budget Package Planner
router.post("/plan-event", async (req, res) => {
  try {
    const { eventType, location, guestCount, budget, preferences, eventDate } = req.body;

    const numBudget = Number(budget) || 50000;
    const numGuests = Number(guestCount) || 100;
    const cleanLocation = (location || "").trim();
    const eventName = eventType || "Celebration Event";
    const userPref = (preferences || "").toLowerCase();
    const selectedEventDate = (eventDate || "").trim();

    // 1. Fetch available services from DB matching location or general catalog
    let filter = {};
    if (cleanLocation) {
      filter.location = { $regex: cleanLocation, $options: "i" };
    }

    let availableServices = await Service.find(filter).populate("owner", "name email");
    
    // Fallback to all available if location has very few
    if (availableServices.length === 0) {
      availableServices = await Service.find().populate("owner", "name email");
    }

    // 📅 Availability Filter: Exclude vendors already booked on the selected event date
    if (selectedEventDate) {
      availableServices = availableServices.filter(s => !s.bookedDates || !s.bookedDates.includes(selectedEventDate));
      
      // 🛡️ Edge-Case Guard: If 100% of vendors are booked on this date
      if (availableServices.length === 0) {
        return res.json({
          success: true,
          plan: {
            eventTitle: `Custom AI Curated ${eventName}`,
            location: cleanLocation || "Selected Region",
            eventDate: selectedEventDate,
            guestCount: numGuests,
            targetBudget: numBudget,
            totalPackageCost: 0,
            savings: numBudget,
            budgetUtilization: "0%",
            conciergeVerdict: `⚠️ Peak Date Alert: All verified vendors in this region are fully booked on ${selectedEventDate}. Please consider selecting an alternate date (e.g. an adjacent weekend or date) to view available packages.`,
            packageItems: []
          }
        });
      }
    }

    // 2. Classify services into distinct categories
    const categorized = {
      decor: availableServices.filter(s => /decor|stage|flower|mandap|canopy|design|hall|venue/i.test(s.category + " " + s.name)),
      catering: availableServices.filter(s => /cater|food|dinner|buffet|lunch|feast|chef|chaat/i.test(s.category + " " + s.name)),
      photography: availableServices.filter(s => /photo|video|cinemat|shoot|camera|album|drone/i.test(s.category + " " + s.name)),
      music: availableServices.filter(s => /dj|band|sound|dhol|edm|music/i.test(s.category + " " + s.name)),
      makeup: availableServices.filter(s => /makeup|mua|hair|salon|groom|bridal|beauty/i.test(s.category + " " + s.name)),
      mehendi: availableServices.filter(s => /mehendi|mehndi|henna/i.test(s.category + " " + s.name)),
      cake: availableServices.filter(s => /cake|baker|pastry|dessert|confection/i.test(s.category + " " + s.name)),
      anchor: availableServices.filter(s => /anchor|emcee|host|mc|speaker/i.test(s.category + " " + s.name)),
      soloMusician: availableServices.filter(s => /violin|sax|flute|acoustic|guitar|singer|solo/i.test(s.category + " " + s.name)),
      securityPower: availableServices.filter(s => /bouncer|security|guard|electric|power|generator/i.test(s.category + " " + s.name)),
      all: availableServices
    };

    // 3. Adaptive Dynamic Allocation based on Event Type & Preferences
    const isWeddingOrEngagement = /wed|marr|engag|ring|sangeet|reception/i.test(eventName);
    const isBirthdayOrAnniv = /birth|anniv|kid|party/i.test(eventName);
    const wantsMehendi = /mehendi|mehndi|henna/i.test(userPref) || isWeddingOrEngagement;
    const wantsMakeup = /makeup|mua|glam|beauty/i.test(userPref) || isWeddingOrEngagement;
    const wantsCake = /cake|baker|pastry/i.test(userPref) || isBirthdayOrAnniv;
    const wantsAnchor = /anchor|emcee|host|mc/i.test(userPref);
    const wantsSoloMusician = /violin|sax|flute|acoustic|solo/i.test(userPref);
    const wantsSecurityPower = /bouncer|security|guard|electric|power|generator/i.test(userPref);

    const selectedPackage = [];
    let allocatedTotal = 0;

    // Helper to pick closest fitting service within budget quota without duplicates
    const pickBestFit = (list, targetBudget) => {
      if (!list || list.length === 0) return null;
      // Filter out already selected services
      const available = list.filter(item => !selectedPackage.some(p => p.service._id.toString() === item._id.toString()));
      if (available.length === 0) return null;

      const sorted = [...available].sort((a, b) => (a.price || 0) - (b.price || 0));
      const fits = sorted.filter(s => (s.price || 0) <= targetBudget);
      return fits.length > 0 ? fits[fits.length - 1] : sorted[0];
    };

    // A. Main Decor (25-30%)
    const decorPick = pickBestFit(categorized.decor.length ? categorized.decor : categorized.all, numBudget * 0.28);
    if (decorPick) {
      selectedPackage.push({
        role: "Event Styling & Decor",
        category: "Decoration",
        service: decorPick,
        allocatedBudget: numBudget * 0.28,
        actualPrice: decorPick.price,
        notes: `Thematic stage and ambient setup planned for ${numGuests} guests.`
      });
      allocatedTotal += decorPick.price;
    }

    // B. Gourmet Catering (30-35%)
    const caterPick = pickBestFit(categorized.catering.length ? categorized.catering : categorized.all, numBudget * 0.32);
    if (caterPick) {
      selectedPackage.push({
        role: "Gourmet Catering & Dining",
        category: "Catering",
        service: caterPick,
        allocatedBudget: numBudget * 0.32,
        actualPrice: caterPick.price,
        notes: `Curated multi-course dining package tailored for ~${numGuests} attendees.`
      });
      allocatedTotal += caterPick.price;
    }

    // C. Photography & Film (15-20%)
    const photoPick = pickBestFit(categorized.photography.length ? categorized.photography : categorized.all, numBudget * 0.18);
    if (photoPick) {
      selectedPackage.push({
        role: "Cinematic Photography & Film",
        category: "Photography",
        service: photoPick,
        allocatedBudget: numBudget * 0.18,
        actualPrice: photoPick.price,
        notes: "Full candid coverage, high-resolution digital gallery, and portraits."
      });
      allocatedTotal += photoPick.price;
    }

    // D. Bridal / Party Makeup (MUA) (if requested or wedding)
    if (wantsMakeup && categorized.makeup.length > 0) {
      const makeupPick = pickBestFit(categorized.makeup, numBudget * 0.08);
      if (makeupPick) {
        selectedPackage.push({
          role: "Bridal & Party Makeup (MUA)",
          category: "Makeup",
          service: makeupPick,
          allocatedBudget: numBudget * 0.08,
          actualPrice: makeupPick.price,
          notes: "Professional HD / Airbrush makeup with hairstyling & draping."
        });
        allocatedTotal += makeupPick.price;
      }
    }

    // E. Mehendi / Henna Artist (if requested or wedding)
    if (wantsMehendi && categorized.mehendi.length > 0) {
      const mehendiPick = pickBestFit(categorized.mehendi, numBudget * 0.05);
      if (mehendiPick) {
        selectedPackage.push({
          role: "Bridal Mehendi & Henna Art",
          category: "Mehendi",
          service: mehendiPick,
          allocatedBudget: numBudget * 0.05,
          actualPrice: mehendiPick.price,
          notes: "Intricate bridal henna design and family guest packages with natural organic henna."
        });
        allocatedTotal += mehendiPick.price;
      }
    }

    // F. Custom Theme Cake & Bakery (if requested or birthday)
    if (wantsCake && categorized.cake.length > 0) {
      const cakePick = pickBestFit(categorized.cake, numBudget * 0.05);
      if (cakePick) {
        selectedPackage.push({
          role: "Custom Celebration Cake",
          category: "Bakery",
          service: cakePick,
          allocatedBudget: numBudget * 0.05,
          actualPrice: cakePick.price,
          notes: "Multi-tier designer fondant cake customized to your event theme."
        });
        allocatedTotal += cakePick.price;
      }
    }

    // G. Solo Musician (Violin / Saxophone / Flute)
    if (wantsSoloMusician && categorized.soloMusician.length > 0) {
      const soloPick = pickBestFit(categorized.soloMusician, numBudget * 0.07);
      if (soloPick) {
        selectedPackage.push({
          role: "Solo Instrumental Musician",
          category: "Live Music",
          service: soloPick,
          allocatedBudget: numBudget * 0.07,
          actualPrice: soloPick.price,
          notes: "Soulful live saxophone / violin performance for guest entry and cocktail hour."
        });
        allocatedTotal += soloPick.price;
      }
    }

    // H. Event Anchor / Emcee
    if (wantsAnchor && categorized.anchor.length > 0) {
      const anchorPick = pickBestFit(categorized.anchor, numBudget * 0.06);
      if (anchorPick) {
        selectedPackage.push({
          role: "Professional Event Host / Emcee",
          category: "Anchor",
          service: anchorPick,
          allocatedBudget: numBudget * 0.06,
          actualPrice: anchorPick.price,
          notes: "Engaging crowd interaction, itinerary coordination, and ceremony hosting."
        });
        allocatedTotal += anchorPick.price;
      }
    }

    // I. Event Bouncers, Security & Electricians
    if (wantsSecurityPower && categorized.securityPower.length > 0) {
      const secPick = pickBestFit(categorized.securityPower, numBudget * 0.05);
      if (secPick) {
        selectedPackage.push({
          role: "Event Power & Security Management",
          category: "Operations",
          service: secPick,
          allocatedBudget: numBudget * 0.05,
          actualPrice: secPick.price,
          notes: "Certified on-site electricians, DG power backup, and professional VIP security bouncers."
        });
        allocatedTotal += secPick.price;
      }
    }

    // J. DJ & Sound (Fallback if entertainment not yet added)
    if (!selectedPackage.some(p => p.category === "Entertainment" || p.category === "Live Music")) {
      const musicPick = pickBestFit(categorized.music.length ? categorized.music : categorized.all, numBudget * 0.08);
      if (musicPick) {
        selectedPackage.push({
          role: "Sound & DJ Entertainment",
          category: "Entertainment",
          service: musicPick,
          allocatedBudget: numBudget * 0.08,
          actualPrice: musicPick.price,
          notes: "Premium audio system and curated party dance playlist."
        });
        allocatedTotal += musicPick.price;
      }
    }

    const remainingSavings = Math.max(0, numBudget - allocatedTotal);

    // AI Concierge Executive Summary & Event Itinerary
    const aiSummary = {
      eventTitle: `Custom AI Curated ${eventName}`,
      location: cleanLocation || "Selected Region",
      eventDate: selectedEventDate,
      guestCount: numGuests,
      targetBudget: numBudget,
      totalPackageCost: allocatedTotal,
      savings: remainingSavings,
      budgetUtilization: `${Math.min(100, Math.round((allocatedTotal / numBudget) * 100))}%`,
      conciergeVerdict: allocatedTotal <= numBudget
        ? `✨ Excellent fit! We successfully assembled a complete ${selectedPackage.length}-service package within your ₹${numBudget.toLocaleString()} budget with estimated savings of ₹${remainingSavings.toLocaleString()}.`
        : `⚠️ Your custom bundle totals ₹${allocatedTotal.toLocaleString()}, slightly exceeding the target by ₹${(allocatedTotal - numBudget).toLocaleString()}.`,
      packageItems: selectedPackage
    };

    res.json({ success: true, plan: aiSummary });

  } catch (err) {
    console.error("AI Planner error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI event plan" });
  }
});

module.exports = router;
