"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";

const getCategoryImage = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("wed") || cat.includes("marr") || cat.includes("brid")) {
    return "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("decor") || cat.includes("plan") || cat.includes("design")) {
    return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("cater") || cat.includes("food") || cat.includes("cook")) {
    return "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("photo") || cat.includes("video") || cat.includes("shoot")) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("clean") || cat.includes("maid") || cat.includes("house")) {
    return "https://images.unsplash.com/photo-1603712760398-5fd7143c62ef?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("dj") || cat.includes("music") || cat.includes("band") || cat.includes("entertain")) {
    return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("venue") || cat.includes("hall") || cat.includes("room")) {
    return "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80";
};

export default function AIPlannerPage() {
  const [eventType, setEventType] = useState("Luxury Wedding");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("Delhi");
  const [guestCount, setGuestCount] = useState("150");
  const [budget, setBudget] = useState("100000");
  const [preferences, setPreferences] = useState("Grand floral decor with candid cinematography and buffet dining");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingAllSuccess, setBookingAllSuccess] = useState(false);

  const budgetPresets = [
    { label: "₹50,000", value: "50000" },
    { label: "₹1,00,000", value: "100000" },
    { label: "₹2,50,000", value: "250000" },
    { label: "₹5,00,000", value: "500000" },
  ];

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setBookingAllSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/plan-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          eventDate,
          location,
          guestCount: Number(guestCount) || 100,
          budget: Number(budget) || 100000,
          preferences
        })
      });

      const data = await res.json();
      if (res.ok && data.plan) {
        setPlan(data.plan);
        // Scroll to results
        setTimeout(() => {
          document.getElementById("plan-results")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        setError(data.error || "Could not generate plan. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to AI engine. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAllPackage = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Please login to book this curated package.");
      return;
    }

    if (!plan || !plan.packageItems || plan.packageItems.length === 0) return;

    setLoading(true);
    let successCount = 0;

    for (const item of plan.packageItems) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: item.service._id,
            userId: user._id,
            name: user.name || "Customer",
            phone: "+91 9999999999",
            eventDate: eventDate || plan?.eventDate || "",
            message: `[AI Package Booking] ${eventType} for ${guestCount} guests in ${location}${eventDate ? ` on ${eventDate}` : ""}. Budget quota: ₹${item.actualPrice}`
          })
        });
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      setBookingAllSuccess(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex justify-center py-10 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-5xl space-y-10 animate-fade-in-up">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#efe7da] border border-[#e8dfd2] px-4 py-1 text-[#c99a24] text-[10px] font-bold uppercase tracking-widest">
              <span>✨</span>
              <span>Autonomous AI Event Concierge</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#242424] uppercase">
              Smart Budget <span className="text-gradient italic font-normal text-gradient-glow font-serif">Package Planner</span>
            </h1>

            <p className="text-[#6b6258] text-xs sm:text-sm leading-relaxed font-medium">
              Enter your event vision and total budget. Our AI matches and bundles top-tier verified vendors into an optimized, all-in-one celebration package.
            </p>
          </div>

          {/* AI Planner Input Form */}
          <div className="bg-white border border-[#e8dfd2] p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleGeneratePlan} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Event Type */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                    Celebration Type
                  </label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    className="glass-input w-full px-3.5 py-3 text-xs uppercase tracking-wider bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Luxury Wedding">Luxury Wedding</option>
                    <option value="Engagement Ceremony">Engagement Ceremony</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Corporate Gala">Corporate Gala</option>
                    <option value="Anniversary">Anniversary Celebration</option>
                    <option value="Cocktail & DJ Night">Cocktail & DJ Night</option>
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="glass-input w-full px-3.5 py-3 text-xs uppercase tracking-wider bg-white focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, Amritsar"
                    className="glass-input w-full px-3.5 py-3 text-xs uppercase tracking-wider bg-white focus:outline-none"
                    required
                  />
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                    placeholder="e.g. 150"
                    min="10"
                    max="5000"
                    className="glass-input w-full px-3.5 py-3 text-xs uppercase tracking-wider bg-white focus:outline-none"
                    required
                  />
                </div>

                {/* Total Budget */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                    Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 100000"
                    min="5000"
                    className="glass-input w-full px-3.5 py-3 text-xs uppercase tracking-wider bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quick Budget Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#6b6258]">Budget Presets:</span>
                {budgetPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBudget(preset.value)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                      budget === preset.value
                        ? "bg-[#c99a24] text-white"
                        : "bg-[#faf7f1] text-[#6b6258] hover:bg-[#efe7da] border border-[#e8dfd2]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#6b6258] mb-1.5">
                  Theme, Aesthetic & Special Requirements
                </label>
                <textarea
                  value={preferences}
                  onChange={e => setPreferences(e.target.value)}
                  placeholder="e.g. Floral stage design, candid photography, live acoustic music, buffet dinner..."
                  rows={2}
                  className="glass-input w-full px-3.5 py-3 text-xs bg-white placeholder-[#6b6258]/40 focus:outline-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c99a24] hover:bg-[#b0841a] text-white font-bold text-xs uppercase tracking-widest py-4 transition duration-200 cursor-pointer btn-premium flex items-center justify-center gap-2 shadow-sm shadow-[#c99a24]/20"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-base">✨</span>
                    <span>AI Concierge is Optimizing Your Event Package...</span>
                  </>
                ) : (
                  <>
                    <span>🤖 Generate Optimized AI Event Package</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* AI CURATED RESULTS */}
          {plan && (
            <div id="plan-results" className="space-y-8 animate-fade-in-up">
              {/* Executive Summary Card */}
              <div className="bg-white border-2 border-[#c99a24] p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#e8dfd2] pb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#c99a24] bg-[#efe7da] px-3 py-1">
                      AI Curated Blueprint
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#242424] mt-2">
                      {plan.eventTitle}
                    </h2>
                    <p className="text-[#6b6258] text-xs font-medium mt-1">
                      📍 {plan.location} {plan.eventDate ? `• 📅 ${plan.eventDate}` : ""} • 👥 ~{plan.guestCount} Guests • 🎯 Target Budget: ₹{plan.targetBudget?.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#6b6258] block">Total Package Cost</span>
                    <span className="text-3xl font-serif font-black text-[#c99a24]">
                      ₹{plan.totalPackageCost?.toLocaleString()}
                    </span>
                    {plan.savings > 0 && (
                      <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                        🎉 Estimated Savings: ₹{plan.savings.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Concierge Verdict */}
                <div className="bg-[#faf7f1] border border-[#e8dfd2] p-4 text-xs text-[#242424] leading-relaxed font-sans">
                  <p className="font-semibold text-[11px] text-[#c99a24] uppercase tracking-wider mb-1">
                    AI Concierge Assessment:
                  </p>
                  <p className="text-[#6b6258]">{plan.conciergeVerdict}</p>
                </div>

                {/* 1-Click Request All Action */}
                {bookingAllSuccess ? (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 text-center space-y-2">
                    <p className="text-sm font-bold uppercase tracking-wider">🎉 Full AI Package Requested Successfully!</p>
                    <p className="text-xs text-emerald-800">
                      All vendors in this curated bundle have received your booking request.
                    </p>
                    <Link
                      href="/my-bookings"
                      className="inline-block bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 mt-2 transition hover:bg-emerald-900"
                    >
                      Track Live in My Requests →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-[#6b6258]">
                      Includes <strong>{plan.packageItems?.length || 0} bundled services</strong> ready for coordinated reservation.
                    </div>
                    <button
                      onClick={handleBookAllPackage}
                      disabled={loading}
                      className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 transition cursor-pointer btn-premium"
                    >
                      Request All Bundled Services (1-Click)
                    </button>
                  </div>
                )}
              </div>

              {/* Bundled Vendors Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-serif font-bold text-[#242424] uppercase tracking-wider">
                    Bundled Platform Vendors ({plan.packageItems?.length || 0})
                  </h3>
                  <span className="text-xs text-[#6b6258] uppercase font-semibold">Matched to your budget</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plan.packageItems?.map((item: any, idx: number) => {
                    const service = item.service || {};
                    const imageUrl = getCategoryImage(service.category);

                    return (
                      <div key={idx} className="bg-white border border-[#e8dfd2] p-5 space-y-4 flex flex-col justify-between hover:border-[#c99a24] transition">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#c99a24] bg-[#efe7da] px-2.5 py-1">
                              {item.role}
                            </span>
                            <span className="text-xs font-serif font-bold text-[#242424]">
                              ₹{item.actualPrice?.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex gap-3 items-center">
                            <img
                              src={imageUrl}
                              alt={service.name}
                              className="w-16 h-16 object-cover border border-[#e8dfd2] flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-serif font-bold text-base text-[#242424] leading-tight">
                                {service.name}
                              </h4>
                              <p className="text-[10px] text-[#6b6258] uppercase tracking-wider mt-0.5">
                                📍 {service.location} • {service.category}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-[#6b6258] leading-relaxed font-sans bg-[#faf7f1] p-3 border border-[#e8dfd2]/60">
                            💡 <strong>AI Note:</strong> {item.notes}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-[#e8dfd2]/60">
                          <Link
                            href={`/services/${service._id}`}
                            className="text-[10px] text-[#c99a24] font-bold uppercase tracking-wider hover:underline"
                          >
                            View Event Listing →
                          </Link>
                          <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">
                            ● Verified Vendor
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
