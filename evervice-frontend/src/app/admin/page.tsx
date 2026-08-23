"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../app/components/Navbar";
import Link from "next/link";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "vendors" | "bookings">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user || user.role !== "admin") {
      alert("Access denied. Admin portal only.");
      router.push("/");
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Pending Vendor Requests
        const resRequests = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataRequests = await resRequests.json();
        setRequests(Array.isArray(dataRequests) ? dataRequests : []);

        // 2. Approved Vendors Directory
        const resApproved = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/approved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataApproved = await resApproved.json();
        setApprovedVendors(Array.isArray(dataApproved) ? dataApproved : []);

        // 3. Customer Bookings Feed
        const resBookings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataBookings = await resBookings.json();
        setBookings(Array.isArray(dataBookings) ? dataBookings : []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: id })
      });
      if (res.ok) {
        const approvedReq = requests.find(r => r._id === id);
        setRequests(prev => prev.filter(r => r._id !== id));
        if (approvedReq) {
          setApprovedVendors(prev => [{ ...approvedReq, status: "approved" }, ...prev]);
        }
      } else {
        alert("Failed to approve request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: id })
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
      } else {
        alert("Failed to reject request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed") {
      return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Confirmed</span>;
    }
    if (s === "rejected") {
      return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Declined</span>;
    }
    if (s === "completed") {
      return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Completed</span>;
    }
    return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Pending</span>;
  };

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center py-12 px-6 md:px-8">
        <div className="w-full max-w-6xl space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8dfd2] pb-6">
            <div>
              <h1 className="text-3xl font-serif font-semibold text-[#242424] uppercase tracking-wider">
                Admin <span className="text-gradient italic font-normal text-gradient-glow font-serif">Command Center</span>
              </h1>
              <p className="text-[#6b6258] text-xs mt-1.5 uppercase tracking-wider">
                Moderate vendor permissions, view verified vendors directory, and audit all customer bookings.
              </p>
            </div>
            <Link
              href="/"
              className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-none transition duration-200"
            >
              Back to Portal
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab("pending")}
              className={`p-6 border cursor-pointer transition duration-200 ${
                activeTab === "pending"
                  ? "bg-white border-[#c99a24] shadow-sm ring-1 ring-[#c99a24]"
                  : "bg-white border-[#e8dfd2] hover:border-[#c99a24]"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold">Pending Applications</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">Action Needed</span>
              </div>
              <span className="text-3xl font-bold font-serif text-[#242424]">{requests.length}</span>
              <span className="text-[10px] text-[#6b6258] uppercase tracking-wider block mt-1">Awaiting verification</span>
            </div>

            <div
              onClick={() => setActiveTab("vendors")}
              className={`p-6 border cursor-pointer transition duration-200 ${
                activeTab === "vendors"
                  ? "bg-white border-[#c99a24] shadow-sm ring-1 ring-[#c99a24]"
                  : "bg-white border-[#e8dfd2] hover:border-[#c99a24]"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold">Approved Vendors</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">Verified</span>
              </div>
              <span className="text-3xl font-bold font-serif text-[#c99a24]">{approvedVendors.length}</span>
              <span className="text-[10px] text-[#6b6258] uppercase tracking-wider block mt-1">Allowed by admin</span>
            </div>

            <div
              onClick={() => setActiveTab("bookings")}
              className={`p-6 border cursor-pointer transition duration-200 ${
                activeTab === "bookings"
                  ? "bg-white border-[#c99a24] shadow-sm ring-1 ring-[#c99a24]"
                  : "bg-white border-[#e8dfd2] hover:border-[#c99a24]"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold">Total Bookings Done</span>
                <span className="bg-[#efe7da] text-[#6b6258] text-[10px] font-bold px-2 py-0.5">Platform</span>
              </div>
              <span className="text-3xl font-bold font-serif text-[#242424]">{bookings.length}</span>
              <span className="text-[10px] text-[#6b6258] uppercase tracking-wider block mt-1">Customer reservations</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#e8dfd2] gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3.5 text-xs uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "pending"
                  ? "border-[#c99a24] text-[#c99a24] bg-white"
                  : "border-transparent text-[#6b6258] hover:text-[#242424]"
              }`}
            >
              Pending Applications ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`px-6 py-3.5 text-xs uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "vendors"
                  ? "border-[#c99a24] text-[#c99a24] bg-white"
                  : "border-transparent text-[#6b6258] hover:text-[#242424]"
              }`}
            >
              Approved Vendors Directory ({approvedVendors.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-3.5 text-xs uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "bookings"
                  ? "border-[#c99a24] text-[#c99a24] bg-white"
                  : "border-transparent text-[#6b6258] hover:text-[#242424]"
              }`}
            >
              Customer Bookings Feed ({bookings.length})
            </button>
          </div>

          {/* Content Loading & Error States */}
          {loading ? (
            <div className="text-center py-16 text-[#6b6258] animate-pulse uppercase tracking-wider font-semibold text-xs">
              Loading platform management data...
            </div>
          ) : error ? (
            <div className="bg-white border border-[#e8dfd2] text-rose-700 p-6 text-center shadow-none">{error}</div>
          ) : (
            <div className="space-y-6">
              {/* TAB 1: PENDING REQUESTS */}
              {activeTab === "pending" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-serif font-semibold text-[#242424] uppercase tracking-wider">
                      Pending Vendor Applications
                    </h2>
                    <span className="text-xs text-[#6b6258] uppercase tracking-wider">
                      {requests.length} Application{requests.length !== 1 ? "s" : ""} pending review
                    </span>
                  </div>

                  {requests.length === 0 ? (
                    <div className="bg-white border border-[#e8dfd2] p-12 text-center text-[#6b6258] text-xs uppercase tracking-wider font-semibold">
                      🎉 All caught up! There are no pending vendor applications.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {requests.map((r) => {
                        const imgSource = r.images?.[0] || r.image;
                        return (
                          <div key={r._id} className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h3 className="text-lg font-serif font-bold text-[#242424]">{r.businessName}</h3>
                                  <p className="text-[#6b6258] text-xs mt-0.5 font-medium">{r.userId?.email || "Unknown User"}</p>
                                </div>
                                {imgSource && (
                                  <img
                                    src={imgSource}
                                    alt={r.businessName}
                                    className="w-16 h-16 rounded-none object-cover border border-[#e8dfd2]"
                                  />
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-[#e8dfd2]/60 py-3 text-[#6b6258]">
                                <p><strong>Phone:</strong> {r.phone}</p>
                                <p><strong>Location:</strong> {r.location}</p>
                              </div>

                              <p className="text-[#6b6258] text-xs leading-relaxed font-sans">{r.description}</p>
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-[#e8dfd2]/60">
                              <button
                                onClick={() => handleApprove(r._id)}
                                className="flex-1 bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold py-3 text-xs uppercase tracking-wider transition cursor-pointer btn-premium"
                              >
                                ✓ Approve as Vendor
                              </button>
                              <button
                                onClick={() => handleReject(r._id)}
                                className="flex-1 border border-[#e8dfd2] hover:bg-stone-50 text-[#6b6258] hover:text-rose-600 font-semibold py-3 text-xs uppercase tracking-wider transition cursor-pointer"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: APPROVED VENDORS DIRECTORY */}
              {activeTab === "vendors" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-serif font-semibold text-[#242424] uppercase tracking-wider">
                      Approved Vendors Allowed by Admin
                    </h2>
                    <span className="text-xs text-[#6b6258] uppercase tracking-wider">
                      {approvedVendors.length} Verified Vendor{approvedVendors.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {approvedVendors.length === 0 ? (
                    <div className="bg-white border border-[#e8dfd2] p-12 text-center text-[#6b6258] text-xs uppercase tracking-wider font-semibold">
                      No approved vendors yet. Approve pending applications to build your vendor network.
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e8dfd2] overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#f8f4ec] border-b border-[#e8dfd2] text-[#6b6258] uppercase text-[10px] tracking-widest font-semibold">
                            <th className="py-4 px-6">Business / Vendor</th>
                            <th className="py-4 px-6">Owner Account</th>
                            <th className="py-4 px-6">Phone</th>
                            <th className="py-4 px-6">Location</th>
                            <th className="py-4 px-6">Description</th>
                            <th className="py-4 px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8dfd2]/60">
                          {approvedVendors.map((v, i) => (
                            <tr key={v._id || i} className="hover:bg-[#faf7f1]/60 transition">
                              <td className="py-4 px-6 font-serif font-bold text-[#242424] whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#efe7da] text-[#c99a24] flex items-center justify-center font-bold font-serif text-xs">
                                    {(v.businessName || "V")[0].toUpperCase()}
                                  </div>
                                  <span>{v.businessName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-[#6b6258]">{v.userId?.email || v.userId?.name || "Registered Vendor"}</td>
                              <td className="py-4 px-6 text-[#6b6258] whitespace-nowrap">{v.phone}</td>
                              <td className="py-4 px-6 text-[#6b6258] whitespace-nowrap">{v.location}</td>
                              <td className="py-4 px-6 text-[#6b6258] max-w-xs truncate">{v.description}</td>
                              <td className="py-4 px-6 whitespace-nowrap">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                                  ● Allowed / Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOMER BOOKINGS TABLE */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-serif font-semibold text-[#242424] uppercase tracking-wider">
                      Customer Bookings Overview
                    </h2>
                    <span className="text-xs text-[#6b6258] uppercase tracking-wider">
                      {bookings.length} Total Booking{bookings.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-white border border-[#e8dfd2] p-12 text-center text-[#6b6258] text-xs uppercase tracking-wider font-semibold">
                      No customer bookings made yet.
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e8dfd2] overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#f8f4ec] border-b border-[#e8dfd2] text-[#6b6258] uppercase text-[10px] tracking-widest font-semibold">
                            <th className="py-4 px-6">Booking #</th>
                            <th className="py-4 px-6">Service / Event</th>
                            <th className="py-4 px-6">Customer Info</th>
                            <th className="py-4 px-6">Customer Phone</th>
                            <th className="py-4 px-6">Assigned Vendor</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Client Note / Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8dfd2]/60">
                          {bookings.map((b, i) => (
                            <tr key={b._id || i} className="hover:bg-[#faf7f1]/60 transition">
                              <td className="py-4 px-6 font-mono font-bold text-[#c99a24]">#{i + 1}</td>
                              <td className="py-4 px-6 font-serif font-bold text-[#242424]">
                                {b.serviceId?.name || "Deleted Service"}
                                {b.serviceId?.price && (
                                  <span className="block text-[10px] font-sans font-normal text-[#6b6258]">
                                    ₹{b.serviceId?.price} ({b.serviceId?.category})
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-[#242424]">
                                <div className="font-semibold">{b.name}</div>
                                <div className="text-[10px] text-[#6b6258]">{b.userId?.email || "Guest Client"}</div>
                              </td>
                              <td className="py-4 px-6 text-[#6b6258] font-mono whitespace-nowrap">{b.phone}</td>
                              <td className="py-4 px-6 text-[#6b6258]">
                                {b.vendorId?.name || b.vendorId?.email || "Assigned Vendor"}
                              </td>
                              <td className="py-4 px-6 whitespace-nowrap">
                                {getStatusBadge(b.status)}
                              </td>
                              <td className="py-4 px-6 text-[#6b6258] max-w-xs text-[11px] leading-relaxed">
                                {b.message || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}