"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../app/components/Navbar";
import Link from "next/link";
import CalendarPicker from "../components/CalendarPicker";

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [calendarService, setCalendarService] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user || user.role !== "vendor") {
      alert("Access denied. Vendors only.");
      router.push("/");
      return;
    }

    setLoading(true);
    const loadData = async () => {
      try {
        // Fetch ONLY vendor services
        const resServices = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/vendor/${user._id}`);
        const dataServices = await resServices.json();
        setServices(Array.isArray(dataServices) ? dataServices : []);

        // Fetch ONLY vendor bookings
        const resBookings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/vendor/${user._id}`);
        const dataBookings = await resBookings.json();
        setBookings(Array.isArray(dataBookings) ? dataBookings : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // ❌ Delete service
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event listing?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setServices(services.filter(s => s._id !== id));
      } else {
        alert("Failed to delete service.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔄 Update Booking Status (Accept / Decline / Complete)
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setBookings(prev =>
          prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        alert("Failed to update booking status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 📅 Vendor toggle date block / unblock
  const handleToggleBlockDate = async (dateStr: string, isCurrentlyBlocked: boolean) => {
    if (!calendarService) return;
    const action = isCurrentlyBlocked ? "unblock" : "block";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${calendarService._id}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, action })
      });

      if (res.ok) {
        const data = await res.json();
        setCalendarService((prev: any) => ({ ...prev, bookedDates: data.bookedDates }));
        setServices(prev =>
          prev.map(s => s._id === calendarService._id ? { ...s, bookedDates: data.bookedDates } : s)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalValue = services.reduce((acc, s) => acc + (s.price || 0), 0);

  const pendingBookings = bookings.filter(b => !b.status || b.status === "pending");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const filteredBookings = bookings.filter(b => {
    const status = b.status || "pending";
    if (bookingFilter === "all") return true;
    return status === bookingFilter;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed") {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Confirmed
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Declined
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Completed
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span> Pending Response
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 text-[#6b6258] animate-pulse uppercase tracking-wider font-semibold text-xs">
            Loading vendor workspace...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center py-12 px-6 md:px-8">
        <div className="w-full max-w-6xl space-y-10 animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8dfd2] pb-6">
            <div>
              <h1 className="text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
                Vendor <span className="text-gradient italic font-normal text-gradient-glow font-serif">Workspace</span>
              </h1>
              <p className="text-[#6b6258] text-xs mt-1.5 uppercase tracking-wider">
                Manage your event listings, calendar availability, and client booking requests.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/create"
                className="bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-none transition duration-200 btn-premium"
              >
                + List New Event
              </Link>
              <Link
                href="/"
                className="border border-[#e8dfd2] hover:bg-stone-50 text-[#6b6258] hover:text-[#242424] font-semibold text-xs tracking-wider uppercase px-5 py-3.5 rounded-none transition duration-200"
              >
                Back to Portal
              </Link>
            </div>
          </div>

          {/* 📊 Metrics Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-2">
              <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold block">Total Events Listed</span>
              <span className="text-3xl font-bold font-serif text-[#242424] block">{services.length}</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">● Live on Marketplace</span>
            </div>

            <div className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-2">
              <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold block">Pending Inquiries</span>
              <span className="text-3xl font-bold font-serif text-amber-600 block">{pendingBookings.length}</span>
              <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider block">● Awaiting Response</span>
            </div>

            <div className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-2">
              <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold block">Confirmed Bookings</span>
              <span className="text-3xl font-bold font-serif text-emerald-700 block">{confirmedBookings.length}</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">● Ready to Deliver</span>
            </div>

            <div className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-2">
              <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold block">Portfolio Value</span>
              <span className="text-3xl font-bold font-serif text-[#c99a24] block">₹{totalValue.toLocaleString()}</span>
              <span className="text-[10px] text-[#6b6258] font-medium uppercase tracking-wider block">Combined listing prices</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Services list (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#e8dfd2]/60">
                <h2 className="text-base font-serif font-bold text-[#242424] uppercase tracking-wider">Your Listed Events</h2>
                <span className="text-[10px] uppercase font-bold text-[#6b6258] bg-[#efe7da] px-2.5 py-1">{services.length} Listings</span>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-[#6b6258] text-xs italic font-medium">You haven't listed any events yet.</p>
                  <Link
                    href="/dashboard/create"
                    className="inline-block bg-[#242424] hover:bg-[#3a3a3a] text-white text-[10px] uppercase font-bold tracking-wider px-5 py-3 rounded-none transition duration-200"
                  >
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#e8dfd2]/60 space-y-4">
                  {services.map((s, i) => (
                    <div
                      key={s._id}
                      className={`flex flex-col gap-3 ${i > 0 ? "pt-4" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] text-[#c99a24] font-semibold uppercase tracking-widest bg-[#efe7da] px-2 py-0.5 rounded-none">
                            {s.category}
                          </span>
                          <h4 className="text-sm font-serif font-bold text-[#242424] mt-1">{s.name}</h4>
                          <p className="text-[11px] text-[#6b6258] font-sans font-medium">₹{s.price} • {s.location}</p>
                        </div>

                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-500 bg-white hover:bg-stone-50 border border-[#e8dfd2] rounded-none px-2.5 py-1 transition cursor-pointer uppercase tracking-wider text-[10px]"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[#6b6258]">
                          📅 {s.bookedDates?.length || 0} Locked Dates
                        </span>
                        <button
                          onClick={() => setCalendarService(s)}
                          className="text-[10px] uppercase font-bold text-[#c99a24] hover:text-[#b0841a] bg-[#efe7da]/50 hover:bg-[#efe7da] border border-[#e8dfd2] px-3 py-1.5 transition cursor-pointer"
                        >
                          📅 Manage Calendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Interactive Bookings Pipeline (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-[#e8dfd2]/60">
                <h2 className="text-base font-serif font-bold text-[#242424] uppercase tracking-wider">Client Inquiries & Bookings</h2>
                
                {/* Filter Tabs for Bookings */}
                <div className="flex gap-1">
                  {(["all", "pending", "confirmed", "completed"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBookingFilter(tab)}
                      className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                        bookingFilter === tab
                          ? "bg-[#242424] text-white"
                          : "bg-[#f8f4ec] text-[#6b6258] hover:bg-[#efe7da]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <p className="text-[#6b6258] text-xs italic font-medium py-8 text-center">
                  No {bookingFilter !== "all" ? bookingFilter : ""} booking requests found.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b, i) => {
                    const status = (b.status || "pending").toLowerCase();
                    const cleanPhone = (b.phone || "").replace(/[^0-9]/g, "");

                    return (
                      <div key={b._id || i} className="bg-[#faf7f1]/60 border border-[#e8dfd2] p-5 rounded-none shadow-none space-y-4">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-semibold text-[#c99a24] bg-[#efe7da] px-2 py-0.5 rounded-none">
                              {b.serviceId?.name || "Event Listing"}
                            </span>
                            <h4 className="text-base font-serif font-bold text-[#242424] mt-1.5">{b.name}</h4>
                            <p className="text-[#6b6258] text-xs font-medium">Customer Email: {b.userId?.email || "Guest"}</p>
                          </div>
                          <div>
                            {getStatusBadge(status)}
                          </div>
                        </div>

                        <div className="bg-white border border-[#e8dfd2]/60 p-3.5 rounded-none space-y-1.5 text-xs text-[#6b6258]">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8dfd2]/40 pb-2">
                            <p><strong>Contact Phone:</strong> <span className="font-mono text-[#242424]">{b.phone}</span></p>
                            {b.eventDate && (
                              <span className="bg-[#efe7da] text-[#c99a24] font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                📅 Target Date: {b.eventDate}
                              </span>
                            )}
                          </div>

                          {b.message && (
                            <p className="text-[11px] leading-relaxed pt-1 font-sans">
                              <strong>Client Message:</strong> "{b.message}"
                            </p>
                          )}
                        </div>

                        {/* Direct Contact & Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e8dfd2]/60">
                          <div className="flex items-center gap-2">
                            {cleanPhone && (
                              <>
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="border border-[#e8dfd2] hover:bg-white text-[#242424] text-[10px] uppercase font-bold px-3 py-2 transition flex items-center gap-1.5"
                                >
                                  📞 Call
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border border-[#e8dfd2] hover:bg-white text-emerald-700 text-[10px] uppercase font-bold px-3 py-2 transition flex items-center gap-1.5"
                                >
                                  💬 WhatsApp
                                </a>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {status === "pending" && (
                              <>
                                <button
                                  disabled={updatingId === b._id}
                                  onClick={() => handleUpdateStatus(b._id, "confirmed")}
                                  className="bg-[#242424] hover:bg-[#3a3a3a] text-white text-[10px] uppercase font-bold px-4 py-2 transition cursor-pointer btn-premium"
                                >
                                  ✓ Accept Booking
                                </button>
                                <button
                                  disabled={updatingId === b._id}
                                  onClick={() => handleUpdateStatus(b._id, "rejected")}
                                  className="border border-rose-300 text-rose-700 hover:bg-rose-50 text-[10px] uppercase font-bold px-3 py-2 transition cursor-pointer"
                                >
                                  ✕ Decline
                                </button>
                              </>
                            )}

                            {status === "confirmed" && (
                              <button
                                disabled={updatingId === b._id}
                                onClick={() => handleUpdateStatus(b._id, "completed")}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-bold px-4 py-2 transition cursor-pointer"
                              >
                                ✓ Mark as Completed
                              </button>
                            )}

                            {status === "completed" && (
                              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                                ★ Service Delivered
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📅 Vendor Date Availability Modal */}
      {calendarService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8dfd2] max-w-lg w-full p-6 space-y-4 shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-[#e8dfd2] pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#c99a24] bg-[#efe7da] px-2 py-0.5">
                  Slot Management
                </span>
                <h3 className="text-base font-serif font-bold text-[#242424] mt-1">
                  {calendarService.name}
                </h3>
                <p className="text-[11px] text-[#6b6258]">
                  Click any date to toggle between 🟢 Available and 🔴 Blocked / Reserved.
                </p>
              </div>
              <button
                onClick={() => setCalendarService(null)}
                className="text-[#6b6258] hover:text-[#242424] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <CalendarPicker
              isVendorMode={true}
              bookedDates={calendarService.bookedDates || []}
              onToggleDateBlock={handleToggleBlockDate}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCalendarService(null)}
                className="bg-[#242424] hover:bg-[#3a3a3a] text-white text-xs uppercase font-bold px-6 py-2.5 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}