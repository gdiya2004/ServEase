"use client";

import { useEffect, useState } from "react";
import Navbar from "../app/components/Navbar";
import ServiceCard from "../app/components/ServiceCard";
import Link from "next/link";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  
  // Local input states for search panel
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [user, setUser] = useState<any>(null);

  const hasActiveFilter = Boolean(
    (filters.location && filters.location !== "") ||
    (filters.category && filters.category !== "") ||
    (filters.minPrice && filters.minPrice !== "") ||
    (filters.maxPrice && filters.maxPrice !== "") ||
    searchLocation || searchCategory || searchMinPrice || searchMaxPrice
  );

  const displayedServices = hasActiveFilter || showAll ? services : services.slice(0, 4);

  const handleClearFilters = () => {
    setSearchLocation("");
    setSearchCategory("");
    setSearchMinPrice("");
    setSearchMaxPrice("");
    setFilters({});
    setShowAll(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Sync vendor status
        if (parsedUser && parsedUser._id) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/user/${parsedUser._id}`)
            .then(res => {
              if (res.ok) {
                return res.json();
              } else {
                if (res.status === 404) {
                  console.warn("Session stale. User not found in database.");
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  setUser(null);
                }
                return null;
              }
            })
            .then(data => {
              if (data && data.user && data.user.role !== parsedUser.role) {
                const updatedUser = { ...parsedUser, role: data.user.role };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            })
            .catch(err => console.error("Error syncing profile:", err));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );

      let query = new URLSearchParams(cleanFilters as any).toString();

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services?${query}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Server returned status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setServices(data);
          } else if (data && typeof data === "object" && (data.error || data.message)) {
            throw new Error(data.error || data.message || "Failed to load services");
          } else {
            setServices([]);
          }
        })
        .catch((err) => {
          console.error("Fetch services error:", err);
          setError(err.message || "Could not connect to the database. Make sure the backend is running and the database URI is correct.");
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters, retryTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      location: searchLocation.toLowerCase().trim(),
      category: searchCategory.toLowerCase().trim(),
      minPrice: Number(searchMinPrice) || "",
      maxPrice: Number(searchMaxPrice) || ""
    });
    
    // Scroll to services
    const el = document.getElementById("services-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryClick = (categoryName: string) => {
    setSearchCategory(categoryName);
    setFilters((prev: any) => ({
      ...prev,
      category: categoryName.toLowerCase().trim()
    }));
    
    const el = document.getElementById("services-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const getVendorCTA = () => {
    if (!user) return "/login";
    if (user.role === "vendor") return "/dashboard";
    return "/vendor-request";
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#faf7f1] text-[#242424] font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative w-full h-[650px] overflow-hidden bg-stone-100 flex items-center">
        {/* Full background event photography */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury Event Setup"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradients to merge background into ivory */}
          <div className="absolute inset-0 bg-[#faf7f1]/80 md:bg-transparent md:bg-gradient-to-r md:from-[#faf7f1] md:via-[#faf7f1]/85 md:to-transparent"></div>
        </div>

        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 items-center z-10">
          {/* Hero left content with elegant slide fade in */}
          <div className="md:col-span-7 space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#242424] leading-[1.05] uppercase">
              Make Every<br />
              Moment<br />
              <span className="text-[#c99a24] italic font-normal font-serif text-gradient text-gradient-glow">Unforgettable</span>
            </h1>
            <p className="text-[#6b6258] text-sm md:text-base max-w-lg leading-relaxed font-medium">
              Discover trusted venues, decorators, photographers, caterers and event professionals for celebrations worth remembering.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ai-planner"
                className="bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-xs tracking-wider uppercase px-8 py-4 rounded-none transition duration-200 cursor-pointer shadow-sm shadow-[#c99a24]/10 btn-premium flex items-center gap-2"
              >
                <span>✨ Try AI Budget Planner</span>
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById("services-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-8 py-4 rounded-none transition duration-200 cursor-pointer btn-premium"
              >
                Explore Events
              </button>
              <Link
                href={getVendorCTA()}
                className="border border-[#242424] hover:bg-stone-50 text-[#242424] font-semibold text-xs tracking-wider uppercase px-6 py-4 rounded-none transition duration-200"
              >
                {user?.role === "vendor" ? "Dashboard" : "List Business"}
              </Link>
            </div>
          </div>

          {/* Hero right overlapping image */}
          <div className="hidden md:col-span-5 relative justify-end flex">
            <div className="w-[280px] h-[380px] rounded-[30px] border-4 border-white shadow-xl overflow-hidden relative rotate-3 hover:rotate-0 hover:scale-[1.01] transition-all duration-500 ease-out bg-stone-200 cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=700&q=80"
                alt="Overlap decor"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH / FILTER AREA */}
      <section className="relative z-20 px-6 md:px-8 -mt-12 md:-mt-16 justify-center flex">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-5xl bg-white border border-[#e8dfd2] p-5 shadow-md rounded-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Location</label>
            <input
              placeholder="e.g. Delhi"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-none text-xs uppercase tracking-wider placeholder-[#6b6258]/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Category</label>
            <input
              placeholder="e.g. Wedding"
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-none text-xs uppercase tracking-wider placeholder-[#6b6258]/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Min Price</label>
            <input
              type="number"
              placeholder="Min (₹)"
              value={searchMinPrice}
              onChange={e => setSearchMinPrice(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-none text-xs uppercase tracking-wider placeholder-[#6b6258]/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Max Price</label>
            <input
              type="number"
              placeholder="Max (₹)"
              value={searchMaxPrice}
              onChange={e => setSearchMaxPrice(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-none text-xs uppercase tracking-wider placeholder-[#6b6258]/40 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase py-3.5 rounded-none transition duration-200 btn-premium cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* 🤖 AI CONCIERGE SPOTLIGHT */}
      <section className="px-6 md:px-8 max-w-5xl mx-auto w-full pt-10">
        <div className="bg-white border-2 border-[#c99a24]/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#efe7da] px-3 py-1 text-[#c99a24] text-[9px] font-bold uppercase tracking-widest">
              <span>✨ Autonomous AI Event Concierge</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black uppercase text-[#242424]">
              Plan & Bundle Your Whole Event in 30 Seconds
            </h3>
            <p className="text-[#6b6258] text-xs max-w-xl font-medium">
              Have a budget in mind? Tell our AI your city, guest count, and vision — we'll assemble an optimized, all-in-one vendor package.
            </p>
          </div>
          <Link
            href="/ai-planner"
            className="bg-[#c99a24] hover:bg-[#b0841a] text-white font-bold text-xs uppercase tracking-wider px-8 py-4 transition flex-shrink-0 btn-premium whitespace-nowrap"
          >
            Launch AI Planner →
          </Link>
        </div>
      </section>

      {/* SERVICES CATALOG */}
      <section id="services-section" className="py-16 px-6 md:px-8 max-w-5xl mx-auto w-full scroll-mt-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
            Find Everything You Need for Your Event
          </h2>
          <p className="text-[#6b6258] text-xs uppercase tracking-widest mt-2 font-medium">
            Browse through our curated collection of verified event professionals and premium events.
          </p>
        </div>

        {error ? (
          <div className="bg-white border border-[#e8dfd2] p-8 rounded-none text-center max-w-2xl mx-auto animate-fade-in-up">
            <h3 className="text-base font-serif font-bold text-[#242424] mb-2 uppercase tracking-wide">
              Something went wrong while loading events.
            </h3>
            <p className="text-[#6b6258] text-xs mb-6 font-medium">
              {error}
            </p>
            <button
              onClick={() => setRetryTrigger(prev => prev + 1)}
              className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded-none btn-premium cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          // Skeleton loaders
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#e8dfd2] rounded-none p-5 h-72 flex flex-col justify-between animate-pulse">
                <div>
                  <div className="aspect-[3/2] w-full bg-[#f8f4ec] mb-4"></div>
                  <div className="h-4 w-16 bg-[#efe7da] mb-2"></div>
                  <div className="h-5 w-40 bg-[#efe7da] mb-1"></div>
                </div>
                <div className="flex justify-between items-center border-t border-[#e8dfd2]/40 pt-4">
                  <div className="h-3.5 w-16 bg-[#efe7da]"></div>
                  <div className="h-4 w-12 bg-[#efe7da]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border border-[#e8dfd2] p-12 rounded-none text-center max-w-md mx-auto animate-fade-in-up">
            <h3 className="text-base font-serif font-bold text-[#242424] mb-2 uppercase tracking-wide">No Events Found</h3>
            <p className="text-[#6b6258] text-xs leading-relaxed font-medium">
              Try adjusting your search filters or check back later for new listings.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter / Catalog status bar */}
            <div className="flex flex-wrap justify-between items-center pb-2 border-b border-[#e8dfd2]/60 text-xs">
              <div className="flex items-center gap-2">
                {hasActiveFilter ? (
                  <span className="bg-[#efe7da] text-[#c99a24] text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                    🔍 Filtered Results: {services.length} Event{services.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-[#6b6258] text-[11px] uppercase tracking-wider font-semibold">
                    ✨ Showing {displayedServices.length} of {services.length} Featured Events
                  </span>
                )}
              </div>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold uppercase tracking-wider underline cursor-pointer"
                >
                  Clear Filters ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedServices.map((service: any) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* View All Toggle when not filtering and more than 4 items exist */}
            {!hasActiveFilter && services.length > 4 && (
              <div className="text-center pt-6">
                <button
                  type="button"
                  onClick={() => setShowAll(prev => !prev)}
                  className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-8 py-3.5 rounded-none transition duration-200 cursor-pointer btn-premium"
                >
                  {showAll ? "Show Top 4 Featured Events ↑" : `View All ${services.length} Available Events ↓`}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* EVENT CATEGORIES SECTION */}
      <section id="categories-section" className="py-20 px-6 md:px-8 bg-white border-t border-b border-[#e8dfd2] scroll-mt-10">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
              Explore Event Categories
            </h2>
            <p className="text-[#6b6258] text-xs uppercase tracking-widest mt-2 font-medium">
              Find specialized events and vendors curated for your specific celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Cards with Photos */}
            {[
              {
                name: "Luxury Weddings",
                query: "wedding",
                img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Corporate Events",
                query: "corporate",
                img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Birthday Celebrations",
                query: "birthday",
                img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Engagements",
                query: "engagement",
                img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Anniversaries",
                query: "anniversary",
                img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Private Parties",
                query: "party",
                img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80"
              }
            ].map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.query)}
                className="group relative h-64 overflow-hidden border border-[#e8dfd2] cursor-pointer hover:border-[#c99a24] transition-all duration-300"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/35 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-lg font-serif font-semibold text-white tracking-wide uppercase">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1 block translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    Explore Services →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EXPERIENCE SECTION */}
      <section id="about-section" className="py-20 px-6 md:px-8 max-w-5xl mx-auto w-full scroll-mt-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 relative border border-[#e8dfd2] p-2 bg-white">
            <img
              src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80"
              alt="Table setting event"
              className="object-cover w-full aspect-[4/3] hover:scale-[1.01] transition-transform duration-500"
            />
          </div>

          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl font-serif font-semibold text-[#242424] leading-tight">
              Everything You Need.<br />
              One Beautiful Place.
            </h2>
            <p className="text-[#6b6258] text-sm leading-relaxed font-sans font-medium">
              ServEase connects you with top-tier decorators, venues, caterers, and entertainers. Whether you are hosting a traditional luxury wedding or a high-end corporate event, our platform ensures verified connections and seamless booking management.
            </p>
            <div>
              <button
                onClick={() => {
                  const el = document.getElementById("services-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-none transition duration-200 btn-premium cursor-pointer"
              >
                Discover Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works-section" className="py-20 px-6 md:px-8 bg-white border-t border-b border-[#e8dfd2] scroll-mt-10">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
              How It Works
            </h2>
            <p className="text-[#6b6258] text-xs uppercase tracking-widest mt-2 font-medium">
              Three simple steps to plan your perfect gathering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Discover",
                desc: "Browse event listings, read reviews, and explore vendor portfolios in detail."
              },
              {
                step: "02",
                title: "Choose",
                desc: "Compare offerings, verify pricing transparency, and ask questions to find your match."
              },
              {
                step: "03",
                title: "Celebrate",
                desc: "Send booking requests directly, coordinate setup details, and enjoy your beautiful event."
              }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 hover:scale-[1.01] transition-transform duration-300">
                <span className="block text-4xl font-serif font-black text-[#c99a24]">{item.step}</span>
                <h3 className="text-lg font-serif font-semibold text-[#242424] uppercase tracking-wider">{item.title}</h3>
                <p className="text-[#6b6258] text-xs leading-relaxed max-w-xs mx-auto font-medium font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative w-full h-[400px] overflow-hidden bg-stone-100 flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1600&q=80"
            alt="Hanging celebration lights"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#242424]/75"></div>
        </div>

        <div className="relative max-w-xl mx-auto px-6 space-y-6 z-10 text-white animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-tight uppercase tracking-wider">
            Your Perfect Event Starts Here.
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed max-w-md mx-auto font-medium font-sans">
            Find the people who can turn your ideas into unforgettable moments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                const el = document.getElementById("services-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-xs tracking-wider uppercase px-8 py-4 rounded-none transition duration-200 cursor-pointer btn-premium"
            >
              Explore ServEase
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1c1917] text-[#efe7da] border-t border-stone-800 py-16 px-6 md:px-8">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
          {/* Logo Column */}
          <div className="md:col-span-4 space-y-4">
            <h2 className="text-xl font-serif font-black tracking-tight text-white flex items-center gap-1">
              <span>Serv</span><span className="text-[#c99a24]">Ease</span>
            </h2>
            <p className="text-stone-400 text-xs leading-relaxed max-w-xs font-medium">
              Connecting customers with top-tier verified vendors to curate luxury events, weddings, and premium corporate experiences.
            </p>
          </div>

          {/* Links Column 1: Services */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-serif font-semibold text-white uppercase tracking-widest">Events</h4>
            <ul className="space-y-2 text-stone-400 text-xs font-medium">
              <li>
                <button onClick={() => handleCategoryClick("wedding")} className="hover:text-white transition-colors duration-200">Weddings</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("decor")} className="hover:text-white transition-colors duration-200">Decorations</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("cater")} className="hover:text-white transition-colors duration-200">Caterers</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("venue")} className="hover:text-white transition-colors duration-200">Venues</button>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Vendors */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-serif font-semibold text-white uppercase tracking-widest">For Vendors</h4>
            <ul className="space-y-2 text-stone-400 text-xs font-medium">
              <li>
                <Link href={getVendorCTA()} className="hover:text-white transition-colors duration-200">Join Marketplace</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors duration-200">Vendor Portal</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors duration-200">Register Business</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: About */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-serif font-semibold text-white uppercase tracking-widest">About</h4>
            <ul className="space-y-2 text-stone-400 text-xs font-medium">
              <li>
                <button onClick={() => {
                  const el = document.getElementById("about-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }} className="hover:text-white transition-colors duration-200">Our Story</button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById("how-it-works-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }} className="hover:text-white transition-colors duration-200">How It Works</button>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-serif font-semibold text-white uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4 text-stone-400 text-xs">
              <span className="hover:text-white cursor-pointer transition-colors duration-200">Instagram</span>
              <span className="hover:text-white cursor-pointer transition-colors duration-200">Pinterest</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full border-t border-stone-800/80 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-stone-500 text-[10px] uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} ServEase. All rights reserved.</span>
          <span className="mt-2 sm:mt-0 font-medium">Planned with refinement.</span>
        </div>
      </footer>
    </main>
  );
}