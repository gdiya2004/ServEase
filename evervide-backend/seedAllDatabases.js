const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Service = require("./models/Service");
const VendorRequest = require("./models/VendorRequest");
const Booking = require("./models/Booking");

const ATLAS_BASE = "mongodb+srv://everviceUser:evervice123@cluster0.o0louxz.mongodb.net";
const DB_TARGETS = [
  `${ATLAS_BASE}/test?retryWrites=true&w=majority&appName=Cluster0`,
  `${ATLAS_BASE}/evervice?retryWrites=true&w=majority&appName=Cluster0`,
  `${ATLAS_BASE}/?retryWrites=true&w=majority&appName=Cluster0`
];

const approvedVendorsData = [
  {
    name: "Royal Decorators & Designers",
    email: "royal_decors@servease.com",
    password: "password123",
    businessName: "Royal Decorators & Event Stylists",
    phone: "+91 98111 22334",
    location: "Delhi",
    description: "Specialists in royal destination wedding mandaps, crystal chandeliers, floral arches, and corporate galas with 12+ years experience.",
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Gourmet Flavors Catering Co.",
    email: "gourmet_catering@servease.com",
    password: "password123",
    businessName: "Gourmet Flavors Multi-Cuisine Catering",
    phone: "+91 98222 33445",
    location: "Mumbai",
    description: "5-star bespoke catering featuring live tandoor, authentic Amritsari feasts, coastal fusion, woodfired pizza stations, and artisanal dessert bars.",
    images: ["https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Cinematic Lens Photography",
    email: "cinematic_lens@servease.com",
    password: "password123",
    businessName: "Cinematic Lens Studios",
    phone: "+91 98333 44556",
    location: "Bengaluru",
    description: "Award-winning wedding cinematographers and candid photographers equipped with Sony 4K mirrorless cameras and DJI aerial drones.",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "SoundWave Beats & DJ Lounge",
    email: "soundwave_dj@servease.com",
    password: "password123",
    businessName: "SoundWave DJ & Stage Sound Engineering",
    phone: "+91 98444 55667",
    location: "Goa",
    description: "Celebrity club & wedding DJs, live acoustic bands, JBL line-array sound systems, moving head truss lighting, and dry ice fog machines.",
    images: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Grand Heritage Venues",
    email: "grand_venues@servease.com",
    password: "password123",
    businessName: "Grand Heritage Ballrooms & Lawns",
    phone: "+91 98555 66778",
    location: "Amritsar",
    description: "Sprawling luxury banquets, air-conditioned glasshouses, sea-facing terraces, and heritage courtyards accommodating 100 to 2000 guests.",
    images: ["https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80"]
  },
  // INDIVIDUAL SPECIALIST VENDORS
  {
    name: "Glamour Aura Bridal Studio",
    email: "glamour_mua@servease.com",
    password: "password123",
    businessName: "Glamour Aura Bridal Makeup & Styling (MUA)",
    phone: "+91 98666 77889",
    location: "Delhi",
    description: "Celebrity HD Airbrush bridal makeup artist, engagement hair styling, saree draping, and pre-wedding skin prep.",
    images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Royal Henna & Mehendi Art",
    email: "royal_henna@servease.com",
    password: "password123",
    businessName: "Royal Henna & Bridal Mehendi Artists",
    phone: "+91 98777 88990",
    location: "Delhi",
    description: "Traditional Rajasthani & Arabic bridal mehendi, figure work, organic chemical-free dark stain henna, and guest mehendi squad.",
    images: ["https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "SugarCraft Designer Bakery",
    email: "sugarcraft_cakes@servease.com",
    password: "password123",
    businessName: "SugarCraft Boutique Cakes & Confectionery",
    phone: "+91 98888 99001",
    location: "Mumbai",
    description: "Custom multi-tier wedding cakes, thematic birthday fondant cakes, French macarons, and personalized dessert tables.",
    images: ["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Sharma Event Power & Electricals",
    email: "sharma_power@servease.com",
    password: "password123",
    businessName: "Sharma Power Generators & Event Electricians",
    phone: "+91 98999 00112",
    location: "Delhi",
    description: "Certified on-site event electricians, 3-phase stage wiring, fairy light canopy connections, and silent generator (DG set) power backup.",
    images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "BlackShield Event Security & Bouncers",
    email: "blackshield_security@servease.com",
    password: "password123",
    businessName: "BlackShield VIP Security & Event Bouncers",
    phone: "+91 98000 11223",
    location: "Delhi",
    description: "Trained, black-suited professional event bouncers, crowd control specialists, VIP escorts, and parking security teams.",
    images: ["https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80"]
  }
];

const pendingVendorsData = [
  {
    name: "Elite Aerial Drone Visuals",
    email: "elite_drones@servease.com",
    password: "password123",
    businessName: "Elite Drone Visuals & 360 Photobooths",
    phone: "+91 98777 11223",
    location: "Delhi",
    description: "Licensed DGCA drone operators offering 360-degree interactive photo booths and 4K aerial mapping for mega weddings.",
    images: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Jaipur Royal Turban & Welcome Band",
    email: "jaipur_turbans@servease.com",
    password: "password123",
    businessName: "Jaipur Royal Safa & Turban Band",
    phone: "+91 98888 22334",
    location: "Jaipur",
    description: "Traditional royal Rajasthani Safa tying, welcoming shehnai players, and royal elephant/horse wedding procession coordinators.",
    images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80"]
  },
  {
    name: "Aura Floral & Eco Decor",
    email: "aura_floral@servease.com",
    password: "password123",
    businessName: "Aura Eco-Friendly Floral Styling",
    phone: "+91 98999 33445",
    location: "Bengaluru",
    description: "Zero-plastic organic sustainable wedding decor using terracotta, potted plants, natural handloom drapes, and organic marigolds.",
    images: ["https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80"]
  }
];

const sampleServicesData = [
  // --- DECOR ---
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
    description: "Chic aesthetic pampas grass, custom neon name sign, balloon garland arch, low bohemian wooden picnic tables, and fairy light strings.",
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
    description: "Auspicious yellow and orange marigold floral curtains, vintage brass urns with floating candle diyas, printed ethnic cushions, and warm spotlights.",
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

  // --- CATERING ---
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

  // --- PHOTOGRAPHY ---
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

  // --- MUSIC & DJ ---
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

  // --- VENUES ---
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
  },

  // --- SPECIALIZED INDIVIDUAL SERVICES (MUA, MEHENDI, CAKES, ELECTRICIANS, BOUNCERS, SOLO MUSICIANS) ---
  {
    vendorIndex: 5,
    name: "HD Airbrush Bridal Makeup & Luxury Hair Styling",
    category: "Makeup",
    location: "Delhi",
    price: 12000,
    description: "High-definition sweatproof airbrush bridal makeup with MAC / Huda Beauty products, eyelashes, designer floral hair styling, and saree/lehenga draping.",
    bookedDates: ["2026-09-05", "2026-09-18"]
  },
  {
    vendorIndex: 5,
    name: "Party Glam Makeup & Hairstyling for Family (3 Pax)",
    category: "Makeup",
    location: "Mumbai",
    price: 8500,
    description: "Glamorous cocktail and sangeet makeup package for 3 family members including contouring, eye makeup, and modern blow-dry waves.",
    bookedDates: ["2026-09-08", "2026-09-22"]
  },
  {
    vendorIndex: 6,
    name: "Organic Rajasthani Bridal Henna & Mehendi Art",
    category: "Mehendi",
    location: "Delhi",
    price: 6500,
    description: "Customized figure work bridal mehendi (Doli, Baraat, portraits) up to elbows and feet with 100% natural chemical-free eucalyptus oil dark stain henna.",
    bookedDates: ["2026-09-05", "2026-09-19"]
  },
  {
    vendorIndex: 6,
    name: "Mehendi Party Package for 15 Wedding Guests",
    category: "Mehendi",
    location: "Amritsar",
    price: 5000,
    description: "2 professional speed mehendi artists providing beautiful Arabic & floral palms for up to 15 guests during your mehendi ceremony.",
    bookedDates: ["2026-09-02", "2026-09-16"]
  },
  {
    vendorIndex: 7,
    name: "3-Tier Theme Fondant Wedding & Anniversary Cake (5kg)",
    category: "Bakery",
    location: "Mumbai",
    price: 4500,
    description: "Artisanal 3-tier designer cake (Belgian Chocolate Truffle & Red Velvet) with edible sugar pearls, floral cascade, and customized golden topper.",
    bookedDates: ["2026-09-08", "2026-09-20"]
  },
  {
    vendorIndex: 7,
    name: "Deluxe Birthday Theme Cake & Dessert Platter",
    category: "Bakery",
    location: "Delhi",
    price: 3000,
    description: "Customized 3kg character or drip theme birthday cake paired with 12 designer cupcakes and chocolate cake pops.",
    bookedDates: ["2026-09-07", "2026-09-21"]
  },
  {
    vendorIndex: 3,
    name: "Harmonic Melodies - Live Saxophone & Violinist for Entry",
    category: "Live Music",
    location: "Delhi",
    price: 9500,
    description: "Graceful live solo saxophone or acoustic violinist performance playing romantic English and Bollywood instrumentals during guest arrivals and dinner.",
    bookedDates: ["2026-09-05", "2026-09-12"]
  },
  {
    vendorIndex: 3,
    name: "Celebrity Wedding Emcee & Stand-Up Host",
    category: "Anchor",
    location: "Delhi",
    price: 11000,
    description: "Energetic and humorous wedding anchor to host your sangeet games, couple dance introductions, and keep all age groups entertained throughout the night.",
    bookedDates: ["2026-09-05", "2026-09-20"]
  },
  {
    vendorIndex: 8,
    name: "On-Site Event Electrician & Silent DG Power Backup (25kVA)",
    category: "Operations",
    location: "Delhi",
    price: 5500,
    description: "Full event power management: 2 certified standby electricians, 3-phase stage wiring, fairy light connections, and silent diesel generator backup.",
    bookedDates: ["2026-09-05", "2026-09-12"]
  },
  {
    vendorIndex: 9,
    name: "Elite Black-Uniformed Event Security Bouncers (4 Guards)",
    category: "Operations",
    location: "Delhi",
    price: 8000,
    description: "4 well-built, licensed security bouncers in smart black suits for entrance guest verification, stage VIP protection, and parking crowd control.",
    bookedDates: ["2026-09-05", "2026-09-19"]
  }
];

async function seedTarget(uri, dbName) {
  console.log(`\n========================================`);
  console.log(`📡 Connecting to Target: ${dbName} ...`);
  
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(`✓ Connected to ${dbName}`);

  const UserModel = conn.model("User", User.schema);
  const ServiceModel = conn.model("Service", Service.schema);
  const VendorRequestModel = conn.model("VendorRequest", VendorRequest.schema);

  // 1. Seed / Sync Approved Vendors
  console.log("\n1. Seeding Approved Vendors & Vendor Requests...");
  const vendorUserIds = [];

  for (const v of approvedVendorsData) {
    let u = await UserModel.findOne({ email: v.email });
    if (!u) {
      const hashedPassword = await bcrypt.hash(v.password, 10);
      u = await UserModel.create({
        name: v.name,
        email: v.email,
        password: hashedPassword,
        role: "vendor"
      });
      console.log(`  + Created vendor user: ${u.name}`);
    } else {
      u.role = "vendor";
      await u.save();
    }
    vendorUserIds.push(u._id);

    // Create / Sync Approved VendorRequest
    let req = await VendorRequestModel.findOne({ userId: u._id });
    if (!req) {
      req = await VendorRequestModel.create({
        userId: u._id,
        businessName: v.businessName,
        phone: v.phone,
        location: v.location,
        description: v.description,
        images: v.images,
        status: "approved"
      });
      console.log(`  + Created Approved VendorRequest for: ${v.businessName}`);
    } else {
      req.status = "approved";
      req.businessName = v.businessName;
      req.phone = v.phone;
      req.location = v.location;
      req.description = v.description;
      req.images = v.images;
      await req.save();
    }
  }

  // 2. Seed Pending Vendor Requests (for Admin Demo)
  console.log("\n2. Seeding Pending Vendor Requests (for Admin testing)...");
  for (const pv of pendingVendorsData) {
    let pu = await UserModel.findOne({ email: pv.email });
    if (!pu) {
      const hashedPassword = await bcrypt.hash(pv.password, 10);
      pu = await UserModel.create({
        name: pv.name,
        email: pv.email,
        password: hashedPassword,
        role: "user"
      });
    }

    let preq = await VendorRequestModel.findOne({ userId: pu._id });
    if (!preq) {
      await VendorRequestModel.create({
        userId: pu._id,
        businessName: pv.businessName,
        phone: pv.phone,
        location: pv.location,
        description: pv.description,
        images: pv.images,
        status: "pending"
      });
    }
  }

  // 3. Seed Services Catalog
  console.log("\n3. Seeding 37+ Services Catalog...");
  for (const s of sampleServicesData) {
    const ownerId = vendorUserIds[s.vendorIndex] || vendorUserIds[0];
    let sDoc = await ServiceModel.findOne({ name: s.name });
    if (!sDoc) {
      await ServiceModel.create({
        name: s.name,
        category: s.category,
        location: s.location,
        price: s.price,
        description: s.description,
        owner: ownerId,
        bookedDates: s.bookedDates || []
      });
      console.log(`  ✓ Inserted [${s.category}] "${s.name}" (₹${s.price})`);
    } else {
      sDoc.owner = ownerId;
      sDoc.bookedDates = s.bookedDates || [];
      sDoc.price = s.price;
      sDoc.category = s.category;
      sDoc.location = s.location;
      sDoc.description = s.description;
      await sDoc.save();
    }
  }

  const totalServices = await ServiceModel.countDocuments();
  const totalVendors = await VendorRequestModel.countDocuments({ status: "approved" });
  const totalPending = await VendorRequestModel.countDocuments({ status: "pending" });

  console.log(`\n🎉 [${dbName}] Stats:`);
  console.log(`   - Approved Vendors: ${totalVendors}`);
  console.log(`   - Pending Applications: ${totalPending}`);
  console.log(`   - Total Listed Services: ${totalServices}`);

  await conn.close();
}

async function run() {
  for (let i = 0; i < DB_TARGETS.length; i++) {
    const name = i === 0 ? "Atlas [test database]" : i === 1 ? "Atlas [evervice database]" : "Atlas [default database]";
    try {
      await seedTarget(DB_TARGETS[i], name);
    } catch (e) {
      console.error(`Error on ${name}:`, e.message);
    }
  }
  console.log("\n✅ ALL ATLAS DATABASES FULLY SYNCHRONIZED WITH SPECIALIZED SERVICES!");
  process.exit(0);
}

run();
