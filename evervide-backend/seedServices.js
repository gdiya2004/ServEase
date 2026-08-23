const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Service = require("./models/Service");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/evervice";

const sampleVendors = [
  { name: "Royal Decorators & Designers", email: "royal_decors@servease.com", password: "password123", role: "vendor" },
  { name: "Gourmet Flavors Catering Co.", email: "gourmet_catering@servease.com", password: "password123", role: "vendor" },
  { name: "Cinematic Lens Photography", email: "cinematic_lens@servease.com", password: "password123", role: "vendor" },
  { name: "SoundWave Beats & DJ Lounge", email: "soundwave_dj@servease.com", password: "password123", role: "vendor" },
  { name: "Grand Heritage Venues", email: "grand_venues@servease.com", password: "password123", role: "vendor" }
];

const sampleServicesData = [
  // --- DECORATION & STYLING ---
  {
    vendorIndex: 0,
    name: "Royal Mandap & Luxury Floral Wedding Stage",
    category: "Decor",
    location: "Delhi",
    price: 45000,
    description: "Extravagant entrance arch, authentic imported fresh flowers, ambient ceiling draping, fairy lighting, and a grand carved sofa setup for bride & groom.",
    bookedDates: ["2026-09-05", "2026-09-12", "2026-09-20"]
  },
  {
    vendorIndex: 0,
    name: "Minimalist Bohemian Birthday & Fairy Lights Setup",
    category: "Decor",
    location: "Mumbai",
    price: 15000,
    description: "Chic aesthetic pampas grass, custom neon name sign, balloon garland arch, low bohemian wooden picnic tables, and fairy fairy light strings.",
    bookedDates: ["2026-09-08", "2026-09-18"]
  },
  {
    vendorIndex: 0,
    name: "Luxury Grand Ballroom Crystal & Chandelier Decor",
    category: "Decor",
    location: "Bengaluru",
    price: 75000,
    description: "High-end corporate & wedding gala decor featuring imported crystal chandeliers, mirror dance floor, LED kinetic lights, and designer floral centerpieces.",
    bookedDates: ["2026-09-15", "2026-09-28"]
  },
  {
    vendorIndex: 0,
    name: "Traditional Marigold & Brass Engagement Setup",
    category: "Decor",
    location: "Amritsar",
    price: 25000,
    description: "Auspicious yellow and orange marigold floral curtains, vintage brass urns with floating candle diyas, printed ethnic cushions, and warm halogen spotlights.",
    bookedDates: ["2026-09-02", "2026-09-19"]
  },
  {
    vendorIndex: 0,
    name: "Beachside Tropical Sunset Canopy & Lounge",
    category: "Decor",
    location: "Goa",
    price: 55000,
    description: "Dreamy oceanfront bamboo gazebo, sheer white flowing fabrics, tiki torches, acoustic sound zone, and low wooden lounge seating right on the sand.",
    bookedDates: ["2026-09-10", "2026-09-22"]
  },
  {
    vendorIndex: 0,
    name: "Contemporary Corporate Stage & LED Screen Backdrop",
    category: "Decor",
    location: "Delhi",
    price: 35000,
    description: "Professional conference stage with high-definition P3 LED video wall, branded podium, truss lighting, and red carpet executive entrance.",
    bookedDates: ["2026-09-07", "2026-09-21"]
  },

  // --- CATERING & GOURMET FOOD ---
  {
    vendorIndex: 1,
    name: "Imperial Multi-Cuisine Royal Wedding Buffet",
    category: "Catering",
    location: "Delhi",
    price: 55000,
    description: "5-course gourmet dining package including live tandoori starters, North Indian curries, Chinese wok station, Italian pasta counter, and 8 dessert varieties.",
    bookedDates: ["2026-09-05", "2026-09-12"]
  },
  {
    vendorIndex: 1,
    name: "Live Street Chaat, Italian & Barbecue Food Stations",
    category: "Catering",
    location: "Mumbai",
    price: 30000,
    description: "Interactive live cooking stations featuring Delhi-style golgappas, stone-baked thin crust pizzas, grilled paneer tikka, burgers, and mocktail bar.",
    bookedDates: ["2026-09-08", "2026-09-25"]
  },
  {
    vendorIndex: 1,
    name: "Traditional South Indian Banana Leaf Feast",
    category: "Catering",
    location: "Bengaluru",
    price: 22000,
    description: "Authentic traditional 24-item satvik meal served on fresh plantain leaves, featuring aromatic sambar, rasam, avial, payasam, and crispy vadas.",
    bookedDates: ["2026-09-15", "2026-09-29"]
  },
  {
    vendorIndex: 1,
    name: "Authentic Amritsari Kulcha & Tandoori Feast",
    category: "Catering",
    location: "Amritsar",
    price: 28000,
    description: "Famous crisp stuffed tandoori kulchas, slow-cooked pindi chole, live paneer tikka, sweet lassi bar, and hot jalebis with rabri.",
    bookedDates: ["2026-09-02", "2026-09-14"]
  },
  {
    vendorIndex: 1,
    name: "Seafood & Coastal Fusion Gourmet Dining",
    category: "Catering",
    location: "Goa",
    price: 48000,
    description: "Fresh coastal prawns, rawa fry fish, authentic Goan curries, coconut rice, woodfired appetizers, and tropical fruit cocktail bar.",
    bookedDates: ["2026-09-10", "2026-09-23"]
  },
  {
    vendorIndex: 1,
    name: "Executive High-Tea & Hors D'oeuvres Package",
    category: "Catering",
    location: "Delhi",
    price: 20000,
    description: "Artisanal bakery assortment, gourmet mini quiches, canapes, fresh fruit tarts, single-origin espresso station, and exotic teas for up to 100 guests.",
    bookedDates: ["2026-09-07", "2026-09-17"]
  },

  // --- PHOTOGRAPHY & CINEMATOGRAPHY ---
  {
    vendorIndex: 2,
    name: "Candid Wedding Cinematography & 4K Drone Film",
    category: "Photography",
    location: "Delhi",
    price: 35000,
    description: "2 Senior Candid Photographers + 2 Cinematographers with Sony A7IV cameras, 4K aerial drone coverage, 3-minute teaser trailer, and full length 45-min film.",
    bookedDates: ["2026-09-05", "2026-09-20"]
  },
  {
    vendorIndex: 2,
    name: "Pre-Wedding Cinematic Story & Scenic Shoot",
    category: "Photography",
    location: "Mumbai",
    price: 22000,
    description: "Full day pre-wedding couple shoot at 2 iconic outdoor locations, including costume change assistance, 30 retouched portraits, and cinematic teaser video.",
    bookedDates: ["2026-09-11", "2026-09-26"]
  },
  {
    vendorIndex: 2,
    name: "Complete Traditional & Candid Event Photo Album",
    category: "Photography",
    location: "Bengaluru",
    price: 30000,
    description: "Unlimited high-resolution digital photographs, live cloud photo gallery for guests via QR code, and 1 luxury leatherette hardbound 50-page album.",
    bookedDates: ["2026-09-15", "2026-09-28"]
  },
  {
    vendorIndex: 2,
    name: "Royal Heritage Golden Temple & Palace Shoot",
    category: "Photography",
    location: "Amritsar",
    price: 18000,
    description: "Specialist heritage portrait photography capturing the vibrant cultural spirit, traditional attires, architecture, and emotional family moments.",
    bookedDates: ["2026-09-02", "2026-09-16"]
  },
  {
    vendorIndex: 2,
    name: "Sunset Beach Destination Wedding Film & Photos",
    category: "Photography",
    location: "Goa",
    price: 45000,
    description: "Complete 3-day destination wedding coverage (Mehendi, Sangeet & Beach Vows) with high-end color grading, drone shots, and Instagram reels package.",
    bookedDates: ["2026-09-10", "2026-09-22"]
  },
  {
    vendorIndex: 2,
    name: "Corporate Event Coverage & Professional Headshots",
    category: "Photography",
    location: "Delhi",
    price: 15000,
    description: "Fast-delivery corporate photo coverage, keynote speaker photos, stage presentations, group portraits, and on-site executive headshot studio booth.",
    bookedDates: ["2026-09-07", "2026-09-18"]
  },

  // --- MUSIC, SOUND & ENTERTAINMENT ---
  {
    vendorIndex: 3,
    name: "Club-Style Live DJ with Trussing, Lasers & Smoke",
    category: "DJ",
    location: "Delhi",
    price: 18000,
    description: "Celebrity club DJ playing latest Bollywood, Punjabi & EDM tracks, high-power JBL line array speakers, bass subwoofers, moving head beam lights, and CO2 smoke.",
    bookedDates: ["2026-09-05", "2026-09-19"]
  },
  {
    vendorIndex: 3,
    name: "Sufi & Bollywood Live Acoustic Band (4-Piece)",
    category: "DJ",
    location: "Mumbai",
    price: 35000,
    description: "Enchanting 4-member live band featuring soulful lead vocalist, acoustic guitar, keyboard, and percussion tabla/cajon for cocktail evenings and sangeet.",
    bookedDates: ["2026-09-12", "2026-09-27"]
  },
  {
    vendorIndex: 3,
    name: "Authentic Punjabi Dhol & Brass Band Baraat",
    category: "DJ",
    location: "Amritsar",
    price: 12000,
    description: "Energetic 6-player Punjabi Dhol troupe with traditional attire, synchronized rhythms, and grand bridal/groom entry music.",
    bookedDates: ["2026-09-02", "2026-09-14"]
  },
  {
    vendorIndex: 3,
    name: "EDM Sundowner DJ Set with Premium JBL Sound",
    category: "DJ",
    location: "Goa",
    price: 25000,
    description: "Beach sunset to midnight DJ set, Pioneer CDJ-3000 console, intelligent sound-activated LED lights, and custom party playlist curation.",
    bookedDates: ["2026-09-10", "2026-09-24"]
  },
  {
    vendorIndex: 3,
    name: "Corporate Event Host (Emcee) & Audio Engineering",
    category: "DJ",
    location: "Bengaluru",
    price: 14000,
    description: "Charismatic bilingual corporate anchor/emcee with wireless Sennheiser lapel microphones, multi-channel mixer, and seamless audio coordination.",
    bookedDates: ["2026-09-09", "2026-09-23"]
  },

  // --- VENUES & BANQUET SPACES ---
  {
    vendorIndex: 4,
    name: "Heritage Lawn & Air-Conditioned Glass House Banquet",
    category: "Venue",
    location: "Delhi",
    price: 85000,
    description: "Sprawling 25,000 sq.ft lush green lawn paired with a luxury climate-controlled glass banquet hall, valet parking for 200 cars, and bridal suite.",
    bookedDates: ["2026-09-05", "2026-09-12", "2026-09-20"]
  },
  {
    vendorIndex: 4,
    name: "Sea-Facing Open Air Rooftop Terrace Venue",
    category: "Venue",
    location: "Mumbai",
    price: 65000,
    description: "Panoramic Arabian sea sunset views, dedicated bar lounge, wooden deck flooring, and acoustic sound allowance until 11 PM for up to 250 guests.",
    bookedDates: ["2026-09-08", "2026-09-22"]
  },
  {
    vendorIndex: 4,
    name: "Lush Green Palm Garden Resort for Destination Weddings",
    category: "Venue",
    location: "Goa",
    price: 95000,
    description: "Private 5-star beachfront resort garden with swaying coconut palms, direct beach access, swimming pool patio, and Portuguese heritage villa backdrop.",
    bookedDates: ["2026-09-10", "2026-09-25"]
  },
  {
    vendorIndex: 4,
    name: "Boutique Heritage Haveli Courtyard",
    category: "Venue",
    location: "Amritsar",
    price: 40000,
    description: "Charming traditional brickwork courtyard haveli with heritage arches, ambient central fountain, fairy light canopy, and royal Punjabi ambiance.",
    bookedDates: ["2026-09-02", "2026-09-18"]
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB.");

    // 1. Create or Find Verified Vendor Accounts
    const createdVendorIds = [];

    for (const v of sampleVendors) {
      let existing = await User.findOne({ email: v.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(v.password, 10);
        existing = await User.create({
          name: v.name,
          email: v.email,
          password: hashedPassword,
          role: "vendor"
        });
        console.log(`+ Created vendor: ${existing.name} (${existing.email})`);
      } else {
        console.log(`= Vendor already exists: ${existing.name}`);
      }
      createdVendorIds.push(existing._id);
    }

    // 2. Clear old duplicate sample services if needed or insert new ones
    console.log("\nInserting 25+ realistic event services...");
    let addedCount = 0;

    for (const s of sampleServicesData) {
      const ownerId = createdVendorIds[s.vendorIndex] || createdVendorIds[0];

      // Check if service with same name exists
      const existingService = await Service.findOne({ name: s.name });
      if (!existingService) {
        await Service.create({
          name: s.name,
          category: s.category,
          location: s.location,
          price: s.price,
          description: s.description,
          owner: ownerId,
          bookedDates: s.bookedDates || []
        });
        addedCount++;
        console.log(`  ✓ Added [${s.category}] "${s.name}" (₹${s.price}) in ${s.location}`);
      } else {
        // Update bookedDates and price if already there
        existingService.bookedDates = s.bookedDates || [];
        existingService.price = s.price;
        existingService.category = s.category;
        existingService.location = s.location;
        existingService.description = s.description;
        await existingService.save();
        console.log(`  ~ Updated [${s.category}] "${s.name}"`);
      }
    }

    const totalInDb = await Service.countDocuments();
    console.log(`\n🎉 Database Seeding Complete! Total services in database: ${totalInDb}`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
