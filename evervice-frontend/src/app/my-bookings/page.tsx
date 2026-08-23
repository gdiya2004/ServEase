"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      alert("Please login to view your bookings.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const fetchUserBookings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/user/${user._id}`);
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed") {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Confirmed by Vendor
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span> Declined
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span> Service Completed
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span> Pending Vendor Response
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center py-12 px-6 md:px-8">
        <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8dfd2] pb-6">
            <div>
              <h1 className="text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
                My <span className="text-gradient italic font-normal text-gradient-glow font-serif">Bookings</span>
              </h1>
              <p className="text-[#6b6258] text-xs mt-1.5 uppercase tracking-wider">
                Track your reserved event services and direct vendor confirmation status.
              </p>
            </div>
            <Link
              href="/"
              className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-none transition duration-200"
            >
              Explore More Events
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#6b6258] animate-pulse uppercase tracking-wider font-semibold text-xs">
              Loading your bookings...
            </div>
          ) : error ? (
            <div className="bg-white border border-[#e8dfd2] text-rose-700 p-6 text-center shadow-none">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white border border-[#e8dfd2] p-12 text-center space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#242424] uppercase tracking-wider">
                You have no active bookings yet
              </h3>
              <p className="text-[#6b6258] text-xs max-w-sm mx-auto font-medium">
                Browse our marketplace to discover luxury wedding decorators, caterers, photographers, and event venues.
              </p>
              <Link
                href="/#services-section"
                className="inline-block bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-none transition duration-200 btn-premium"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, i) => (
                <div key={b._id || i} className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-semibold text-[#c99a24] bg-[#efe7da] px-2.5 py-1 rounded-none">
                        {b.serviceId?.category || "Event"}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-[#242424] mt-2">
                        {b.serviceId?.name || "Reserved Event Service"}
                      </h3>
                      {b.serviceId?.price && (
                        <p className="text-sm font-serif font-bold text-[#c99a24]">
                          Starting from ₹{b.serviceId?.price}
                        </p>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(b.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#faf7f1]/60 border border-[#e8dfd2]/60 p-4 text-[#6b6258]">
                    <div>
                      <p><strong>Your Name:</strong> {b.name}</p>
                      <p><strong>Contact Phone:</strong> {b.phone}</p>
                    </div>
                    <div>
                      <p><strong>Vendor:</strong> {b.vendorId?.name || b.vendorId?.email || "Service Provider"}</p>
                      <p><strong>Booked On:</strong> {new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {b.message && (
                    <div className="text-xs text-[#6b6258] pt-1">
                      <strong>Your Special Instructions:</strong>
                      <p className="text-[#242424] italic mt-1 font-sans">"{b.message}"</p>
                    </div>
                  )}

                  {b.serviceId?._id && (
                    <div className="pt-2 border-t border-[#e8dfd2]/60 flex justify-end">
                      <Link
                        href={`/services/${b.serviceId._id}`}
                        className="text-[10px] text-[#c99a24] hover:text-[#b0841a] font-bold uppercase tracking-wider"
                      >
                        View Event Page →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
