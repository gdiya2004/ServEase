"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "confirmed" | "rejected" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const router = useRouter();

  const fetchUserBookings = async (isManualRefresh = false) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      if (!isManualRefresh) {
        alert("Please login to view your service requests.");
        router.push("/login");
      }
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/user/${user._id}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setLastSynced(new Date());
    } catch (err: any) {
      console.error(err);
      setError("Failed to load your service requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();

    // Auto-poll every 12 seconds for real-time updates
    const interval = setInterval(() => {
      fetchUserBookings(true);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const pendingCount = bookings.filter(b => !b.status || b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const rejectedCount = bookings.filter(b => b.status === "rejected").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const filteredBookings = bookings.filter(b => {
    const status = (b.status || "pending").toLowerCase();
    const matchesFilter = activeFilter === "all" ? true : status === activeFilter;

    const matchesSearch =
      searchQuery.trim() === "" ||
      (b.serviceId?.name && b.serviceId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.serviceId?.category && b.serviceId.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.vendorId?.name && b.vendorId.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex justify-center py-10 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-5xl space-y-8 animate-fade-in-up">
          {/* Top Header & Live Sync Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8dfd2] pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
                  Live Service Management Platform
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#242424] uppercase">
                My Service <span className="text-gradient italic font-normal text-gradient-glow font-serif">Requests</span>
              </h1>
              <p className="text-[#6b6258] text-xs mt-1 uppercase tracking-wider font-medium">
                Track which event services you have requested, real-time vendor approvals, and next steps.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchUserBookings(true)}
                disabled={refreshing}
                className="bg-white hover:bg-stone-50 border border-[#e8dfd2] text-[#242424] font-semibold text-xs tracking-wider uppercase px-4 py-3 rounded-none transition duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className={`inline-block ${refreshing ? "animate-spin" : ""}`}>🔄</span>
                <span>{refreshing ? "Syncing..." : "Refresh Status"}</span>
              </button>

              <Link
                href="/#services-section"
                className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-none transition duration-200 btn-premium"
              >
                + Request New Service
              </Link>
            </div>
          </div>

          {/* 📊 Interactive KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveFilter("all")}
              className={`p-4 border transition cursor-pointer ${
                activeFilter === "all"
                  ? "bg-white border-[#c99a24] ring-1 ring-[#c99a24] shadow-sm"
                  : "bg-white border-[#e8dfd2] hover:border-[#c99a24]"
              }`}
            >
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#6b6258] block">Total Requests</span>
              <span className="text-2xl font-serif font-bold text-[#242424] block mt-1">{bookings.length}</span>
              <span className="text-[9px] text-[#6b6258] uppercase tracking-wider block mt-0.5">All reservations</span>
            </div>

            <div
              onClick={() => setActiveFilter("pending")}
              className={`p-4 border transition cursor-pointer ${
                activeFilter === "pending"
                  ? "bg-white border-amber-500 ring-1 ring-amber-500 shadow-sm"
                  : "bg-white border-[#e8dfd2] hover:border-amber-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700">Under Review</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              </div>
              <span className="text-2xl font-serif font-bold text-amber-600 block mt-1">{pendingCount}</span>
              <span className="text-[9px] text-[#6b6258] uppercase tracking-wider block mt-0.5">Awaiting vendor</span>
            </div>

            <div
              onClick={() => setActiveFilter("confirmed")}
              className={`p-4 border transition cursor-pointer ${
                activeFilter === "confirmed"
                  ? "bg-white border-emerald-600 ring-1 ring-emerald-600 shadow-sm"
                  : "bg-white border-[#e8dfd2] hover:border-emerald-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-700">Accepted</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-2xl font-serif font-bold text-emerald-600 block mt-1">{confirmedCount}</span>
              <span className="text-[9px] text-emerald-600 uppercase tracking-wider block mt-0.5 font-semibold">Approved by vendor</span>
            </div>

            <div
              onClick={() => setActiveFilter("rejected")}
              className={`p-4 border transition cursor-pointer ${
                activeFilter === "rejected"
                  ? "bg-white border-rose-500 ring-1 ring-rose-500 shadow-sm"
                  : "bg-white border-[#e8dfd2] hover:border-rose-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold text-rose-700">Disapproved</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <span className="text-2xl font-serif font-bold text-rose-600 block mt-1">{rejectedCount}</span>
              <span className="text-[9px] text-[#6b6258] uppercase tracking-wider block mt-0.5">Declined by vendor</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#e8dfd2] p-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: `All (${bookings.length})` },
                { id: "pending", label: `⏳ Under Review (${pendingCount})` },
                { id: "confirmed", label: `✅ Accepted (${confirmedCount})` },
                { id: "rejected", label: `❌ Disapproved (${rejectedCount})` },
                { id: "completed", label: `⭐ Completed (${completedCount})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-2 text-[10px] uppercase font-bold tracking-wider transition ${
                    activeFilter === tab.id
                      ? "bg-[#242424] text-white shadow-xs"
                      : "bg-[#faf7f1] text-[#6b6258] hover:bg-[#efe7da] border border-[#e8dfd2]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by event or vendor..."
                className="glass-input w-full px-3 py-2 text-xs bg-white placeholder-[#6b6258]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Service Requests List */}
          {loading ? (
            <div className="text-center py-20 text-[#6b6258] animate-pulse uppercase tracking-wider font-semibold text-xs">
              Loading your live service requests...
            </div>
          ) : error ? (
            <div className="bg-white border border-[#e8dfd2] text-rose-700 p-6 text-center shadow-none">{error}</div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white border border-[#e8dfd2] p-12 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#efe7da] text-[#c99a24] flex items-center justify-center font-bold text-xl">
                📋
              </div>
              <h3 className="text-lg font-serif font-bold text-[#242424] uppercase tracking-wider">
                No matching service requests found
              </h3>
              <p className="text-[#6b6258] text-xs max-w-md mx-auto font-medium leading-relaxed">
                {bookings.length === 0
                  ? "You haven't requested any event services yet. Browse our marketplace to explore venues, caterers, decorators, and photographers."
                  : "No requests found for this filter. Try switching tabs or clearing your search query."}
              </p>
              {bookings.length === 0 ? (
                <Link
                  href="/#services-section"
                  className="inline-block bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-none transition duration-200 btn-premium mt-2"
                >
                  Explore Marketplace Events
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs font-semibold text-[#c99a24] hover:underline uppercase tracking-wider block mx-auto pt-2"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((b, i) => {
                const status = (b.status || "pending").toLowerCase();
                const service = b.serviceId || {};
                const vendor = b.vendorId || {};
                const imageUrl = getCategoryImage(service.category);
                const vendorPhone = (b.phone || "").replace(/[^0-9]/g, "");

                return (
                  <div
                    key={b._id || i}
                    className={`bg-white border p-6 rounded-none shadow-none space-y-5 transition-all duration-200 ${
                      status === "confirmed"
                        ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
                        : status === "rejected"
                        ? "border-rose-300"
                        : "border-[#e8dfd2]"
                    }`}
                  >
                    {/* Header Row: Thumbnail, Title, Price, Status Badge */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[#e8dfd2]/60">
                      <div className="flex items-start gap-4">
                        <img
                          src={imageUrl}
                          alt={service.name || "Event"}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-[#e8dfd2] flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#c99a24] bg-[#efe7da] px-2.5 py-0.5">
                              {service.category || "Event Service"}
                            </span>
                            <span className="text-[10px] text-[#6b6258] font-mono font-medium">
                              Ref: #{b._id?.slice(-6)?.toUpperCase() || i + 1}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#242424] hover:text-[#c99a24] transition-colors">
                            {service._id ? (
                              <Link href={`/services/${service._id}`}>{service.name || "Event Service"}</Link>
                            ) : (
                              service.name || "Event Service"
                            )}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b6258]">
                            <span>📍 {service.location || "Location on Request"}</span>
                            {service.price && (
                              <span className="font-serif font-bold text-[#c99a24]">
                                Starting from ₹{service.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Prominent Status Badge */}
                      <div className="self-start sm:self-auto">
                        {status === "confirmed" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              ✅ Request Accepted
                            </span>
                            <span className="block text-[10px] text-emerald-700 font-semibold mt-1 uppercase tracking-wider">
                              Vendor Confirmed
                            </span>
                          </div>
                        )}

                        {status === "rejected" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                              ❌ Request Disapproved
                            </span>
                            <span className="block text-[10px] text-rose-700 font-semibold mt-1 uppercase tracking-wider">
                              Vendor Unavailable
                            </span>
                          </div>
                        )}

                        {status === "completed" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              ⭐ Service Completed
                            </span>
                            <span className="block text-[10px] text-blue-700 font-semibold mt-1 uppercase tracking-wider">
                              Delivered
                            </span>
                          </div>
                        )}

                        {status === "pending" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                              ⏳ Under Vendor Review
                            </span>
                            <span className="block text-[10px] text-amber-700 font-semibold mt-1 uppercase tracking-wider">
                              Awaiting Decision
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🗺️ Real-Time Visual Progress Stepper */}
                    <div className="bg-[#faf7f1]/70 border border-[#e8dfd2]/70 p-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#6b6258] block mb-3">
                        Live Fulfillment Stepper:
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase font-bold tracking-wider">
                        {/* Step 1 */}
                        <div className="space-y-1">
                          <div className="w-6 h-6 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </div>
                          <span className="text-emerald-800 block text-[9px]">1. Requested</span>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-1">
                          <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                            status === "pending"
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-emerald-600 text-white"
                          }`}>
                            {status === "pending" ? "●" : "✓"}
                          </div>
                          <span className={`${status === "pending" ? "text-amber-700 font-black" : "text-emerald-800"} block text-[9px]`}>
                            2. Reviewing
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-1">
                          <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                            status === "confirmed"
                              ? "bg-emerald-600 text-white"
                              : status === "rejected"
                              ? "bg-rose-600 text-white"
                              : status === "completed"
                              ? "bg-emerald-600 text-white"
                              : "bg-[#e8dfd2] text-[#6b6258]"
                          }`}>
                            {status === "confirmed" || status === "completed" ? "✓" : status === "rejected" ? "✕" : "3"}
                          </div>
                          <span className={`block text-[9px] ${
                            status === "confirmed"
                              ? "text-emerald-800 font-black"
                              : status === "rejected"
                              ? "text-rose-700 font-black"
                              : "text-[#6b6258]"
                          }`}>
                            {status === "rejected" ? "3. Disapproved" : "3. Decision"}
                          </span>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-1">
                          <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                            status === "completed" ? "bg-blue-600 text-white" : "bg-[#e8dfd2] text-[#6b6258]"
                          }`}>
                            {status === "completed" ? "★" : "4"}
                          </div>
                          <span className={`block text-[9px] ${status === "completed" ? "text-blue-800 font-black" : "text-[#6b6258]"}`}>
                            4. Delivered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Context Status Banner & Direct Actions */}
                    {status === "confirmed" && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <span>🎉</span> Vendor Accepted Your Request!
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            The vendor is ready for your event. You can now call or chat on WhatsApp to coordinate event details.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {vendorPhone && (
                            <>
                              <a
                                href={`tel:${vendorPhone}`}
                                className="bg-[#242424] hover:bg-[#3a3a3a] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 transition flex items-center gap-1.5"
                              >
                                📞 Call Vendor
                              </a>
                              <a
                                href={`https://wa.me/${vendorPhone}?text=${encodeURIComponent(`Hi, I requested "${service.name || 'your event service'}" on ServEase. Excited to connect!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 transition flex items-center gap-1.5"
                              >
                                💬 WhatsApp
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {status === "rejected" && (
                      <div className="bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                            <span>⚠️</span> Vendor Disapproved / Unavailable
                          </p>
                          <p className="text-[11px] text-rose-700">
                            Unfortunately, the vendor is unavailable for this date or requirement. We recommend booking other top-rated vendors.
                          </p>
                        </div>

                        <Link
                          href="/#services-section"
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 transition flex-shrink-0"
                        >
                          Find Alternative Services →
                        </Link>
                      </div>
                    )}

                    {status === "pending" && (
                      <div className="bg-amber-50/70 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-center gap-2">
                        <span className="text-base">⏳</span>
                        <span>
                          <strong>Request Under Review:</strong> The vendor has been notified and will approve or contact you shortly.
                        </span>
                      </div>
                    )}

                    {/* Booking Details Footer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#faf7f1]/50 border border-[#e8dfd2]/60 p-4 text-[#6b6258]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#242424] block">Your Contact</span>
                        <p className="mt-0.5 font-medium">{b.name} ({b.phone})</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#242424] block">Vendor Account</span>
                        <p className="mt-0.5 font-medium">{vendor.name || vendor.email || "Service Provider"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#242424] block">Date Requested</span>
                        <p className="mt-0.5 font-medium">{new Date(b.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {b.message && (
                      <div className="text-xs text-[#6b6258] pt-1">
                        <strong className="text-[#242424]">Your Requirement Note:</strong>
                        <p className="text-[#6b6258] italic mt-0.5 font-sans">"{b.message}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
