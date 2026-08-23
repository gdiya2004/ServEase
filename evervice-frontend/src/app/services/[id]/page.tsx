"use client";

import { useEffect, useState, use } from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";

const getCategoryImage = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("wed") || cat.includes("marr") || cat.includes("brid")) {
    return "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"; // Luxury wedding
  }
  if (cat.includes("decor") || cat.includes("plan") || cat.includes("design")) {
    return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"; // Table decor candles
  }
  if (cat.includes("cater") || cat.includes("food") || cat.includes("cook")) {
    return "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80"; // Dining food
  }
  if (cat.includes("photo") || cat.includes("video") || cat.includes("shoot")) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"; // Camera/Photography
  }
  if (cat.includes("clean") || cat.includes("maid") || cat.includes("house")) {
    return "https://images.unsplash.com/photo-1603712760398-5fd7143c62ef?auto=format&fit=crop&w=1200&q=80"; // Luxury interior setup
  }
  if (cat.includes("dj") || cat.includes("music") || cat.includes("band") || cat.includes("entertain")) {
    return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"; // DJ deck/music
  }
  if (cat.includes("venue") || cat.includes("hall") || cat.includes("room")) {
    return "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80"; // Grand ballroom
  }
  return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"; // Default
};

export default function ServicePage({ params }: any) {
  const resolvedParams: any = use(params);
  const id = resolvedParams?.id;

  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`);
        if (!res1.ok) throw new Error("Service not found");
        const serviceData = await res1.json();
        setService(serviceData);

        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`);
        if (res2.ok) {
          const reviewData = await res2.json();
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!text.trim()) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId: id,
          text
        })
      });

      setText("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingSubmit = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!name || !phone) {
      alert("Please provide name and phone number");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId: id,
          userId: currentUser._id,
          name,
          phone,
          message
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        setName("");
        setPhone("");
        setMessage("");
        setTimeout(() => setBookingSuccess(false), 5000);
      } else {
        alert("Failed to submit booking request.");
      }
    } catch (e) {
      console.error(e);
      alert("Server error. Could not complete booking.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center py-12 px-6">
          <div className="w-full max-w-5xl animate-pulse">
            <div className="h-6 w-32 bg-[#efe7da] mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-10 w-3/4 bg-[#efe7da]"></div>
                <div className="h-6 w-1/2 bg-[#efe7da]"></div>
                <div className="h-64 w-full bg-[#efe7da]"></div>
              </div>
              <div className="h-80 bg-[#efe7da]"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-[#e8dfd2] p-8 rounded-none text-center max-w-md shadow-none">
            <h3 className="text-lg font-serif font-semibold text-[#242424] mb-2 uppercase tracking-wide">Error Loading Service</h3>
            <p className="text-[#6b6258] text-sm mb-6">{error || "Service does not exist."}</p>
            <Link href="/" className="bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold px-6 py-3 rounded-none text-xs uppercase tracking-wider transition">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const coverImageUrl = getCategoryImage(service.category);

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#242424] flex flex-col">
      <Navbar />

      {/* Editorial wide photo banner */}
      <div className="w-full h-[250px] md:h-[380px] overflow-hidden bg-stone-100 relative">
        <img
          src={coverImageUrl}
          alt={service.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="flex-1 flex justify-center py-12 px-8">
        <div className="w-full max-w-5xl">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-[#6b6258] hover:text-[#242424] mb-8 text-xs uppercase tracking-wider transition font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6b6258]/80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Events
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Left Column: Details */}
            <div className="md:col-span-8 space-y-8">
              <div className="bg-white border border-[#e8dfd2] p-8 rounded-none shadow-none space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#c99a24] bg-[#efe7da] px-3.5 py-1.5 rounded-none">
                    {service.category}
                  </span>
                  
                  <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#242424] mt-5">
                    {service.name}
                  </h1>

                  <div className="flex items-center gap-1.5 text-[#6b6258] text-xs uppercase tracking-wider mt-3 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#6b6258]/70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span>{service.location}</span>
                  </div>
                </div>

                <div className="border-t border-[#e8dfd2]/60 pt-6">
                  <h3 className="text-sm font-serif font-semibold text-[#242424] uppercase tracking-wider mb-3">Event Description</h3>
                  <p className="text-[#6b6258] text-sm leading-relaxed whitespace-pre-line font-sans">
                    {service.description || "No description provided for this event."}
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white border border-[#e8dfd2] p-8 rounded-none shadow-none space-y-6">
                <h3 className="text-lg font-serif font-semibold text-[#242424] uppercase tracking-wider">Customer Reviews</h3>

                {/* Review Form */}
                <div className="space-y-3">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this event..."
                    rows={3}
                    className="glass-input w-full px-4 py-3 rounded-none text-xs uppercase tracking-wider placeholder-[#6b6258]/40 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    disabled={!text.trim()}
                    className="bg-[#242424] hover:bg-[#3a3a3a] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-none text-xs uppercase tracking-wider transition shadow-none cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 border-t border-[#e8dfd2]/60 pt-6">
                  {reviews.length === 0 ? (
                    <p className="text-[#6b6258] text-xs italic">No reviews yet. Be the first to leave feedback!</p>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={i} className="bg-[#faf7f1]/50 border border-[#e8dfd2]/60 p-5 rounded-none shadow-none">
                        <p className="text-[#6b6258] text-sm leading-relaxed">{r.text}</p>
                        {r.createdAt && (
                          <span className="text-[10px] text-[#6b6258]/60 block mt-2.5 uppercase tracking-wider font-semibold">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Booking Form */}
            <div className="md:col-span-4 space-y-6 md:sticky md:top-24">
              <div className="bg-white border border-[#e8dfd2] p-6 rounded-none shadow-none">
                <span className="text-[#6b6258] text-[10px] uppercase tracking-widest font-semibold block">Pricing</span>
                <span className="text-3xl font-bold text-[#c99a24] block mt-1.5 font-serif">
                  ₹{service.price}
                </span>

                {currentUser ? (
                  !showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold py-3.5 rounded-none mt-6 transition duration-200 shadow-none text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Book Event
                    </button>
                  ) : null
                ) : (
                  <div className="mt-6 p-5 bg-[#faf7f1]/70 border border-[#e8dfd2] rounded-none text-center">
                    <p className="text-[#6b6258] text-[11px] uppercase tracking-wider mb-4">Sign in to book this event or contact the vendor.</p>
                    <Link
                      href="/login"
                      className="inline-block w-full bg-[#242424] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-3 rounded-none border border-[#242424] transition uppercase tracking-wider"
                    >
                      Login to Book
                    </Link>
                  </div>
                )}

                {showForm && currentUser && (
                  <div className="mt-6 border-t border-[#e8dfd2]/60 pt-6 space-y-4">
                    <h4 className="text-xs font-serif font-semibold text-[#242424] uppercase tracking-wider">Booking Details</h4>

                    {bookingSuccess && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-base">🎉</span>
                          <div>
                            <p className="font-bold uppercase tracking-wider text-[11px]">Request Sent to Vendor!</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5 font-normal">
                              The vendor has received your inquiry and will review it in real-time.
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/my-bookings"
                          className="block text-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 transition"
                        >
                          Track Status in My Requests →
                        </Link>
                      </div>
                    )}

                    <div>
                      <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Your Name</label>
                      <input
                        placeholder="e.g. Jane Doe"
                        value={name}
                        className="glass-input w-full px-3 py-2.5 rounded-none text-xs placeholder-[#6b6258]/40 focus:outline-none"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        className="glass-input w-full px-3 py-2.5 rounded-none text-xs placeholder-[#6b6258]/40 focus:outline-none"
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-[#6b6258] uppercase tracking-widest mb-1.5">Custom Message (Optional)</label>
                      <textarea
                        placeholder="Describe your requirements..."
                        value={message}
                        rows={2}
                        className="glass-input w-full px-3 py-2.5 rounded-none text-xs placeholder-[#6b6258]/40 focus:outline-none resize-none"
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={handleBookingSubmit}
                        className="flex-1 bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold py-3 rounded-none text-xs uppercase tracking-wider transition duration-200 cursor-pointer text-center"
                      >
                        Submit Request
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="bg-white hover:bg-stone-50 text-stone-600 font-semibold px-4 py-3 rounded-none text-xs uppercase tracking-wider transition border border-[#e8dfd2] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}