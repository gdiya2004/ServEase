"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Live status sync with backend
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
          .catch(err => console.error("Error syncing user profile:", err));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#faf7f1]/95 backdrop-blur-md border-b border-[#e8dfd2] px-6 md:px-8 py-4 flex justify-between items-center shadow-xs">
      {/* Brand logo wordmark */}
      <Link href="/" className="text-xl font-serif font-black tracking-tight text-[#242424] hover:opacity-85 transition-opacity duration-200 flex items-center gap-1">
        <span>Serv</span><span className="text-[#c99a24]">Ease</span>
      </Link>

      {/* Navigation links center/right (Desktop) */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => handleScroll("services-section")}
          className="nav-link-underline text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase cursor-pointer"
        >
          Events
        </button>
        <button
          onClick={() => handleScroll("categories-section")}
          className="nav-link-underline text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase cursor-pointer"
        >
          Categories
        </button>
        <button
          onClick={() => handleScroll("about-section")}
          className="nav-link-underline text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase cursor-pointer"
        >
          About
        </button>
        <Link
          href="/ai-planner"
          className="flex items-center gap-1 text-[#c99a24] hover:text-[#b0841a] font-bold tracking-wider text-[10px] uppercase bg-[#efe7da]/70 border border-[#e8dfd2] px-3 py-1.5 transition hover:scale-105 duration-150"
        >
          <span>✨ AI Concierge</span>
        </Link>
        <Link
          href={user ? (user.role === "vendor" ? "/dashboard" : "/vendor-request") : "/login"}
          className="nav-link-underline text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase"
        >
          For Vendors
        </Link>
      </div>

      {/* Auth Controls right (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        {user?.role === "admin" && (
          <Link href="/admin" className="nav-link-underline text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase">
            Admin
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-4">
            {user.role === "vendor" && (
              <Link
                href="/dashboard"
                className="bg-[#c99a24] hover:bg-[#b0841a] text-white font-semibold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-none transition duration-200 btn-premium mr-2"
              >
                Create Event
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 bg-[#efe7da] border border-[#e8dfd2] text-[#6b6258] flex items-center justify-center font-bold text-xs tracking-wider rounded-none hover:border-[#c99a24] hover:bg-[#efe7da]/80 transition-all duration-300 focus:outline-none cursor-pointer"
              >
                {user?.name?.[0]?.toUpperCase()}
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2.5 w-64 bg-[#faf7f1] border border-[#e8dfd2] shadow-lg rounded-none z-45 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-[#e8dfd2]/60">
                      <p className="text-xs font-serif font-bold text-[#242424] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#6b6258] mt-0.5 lowercase truncate">{user.email}</p>
                    </div>

                    <div className="px-4 py-2 border-b border-[#e8dfd2]/60 flex items-center justify-between">
                      <span className="text-[9px] text-[#6b6258] uppercase tracking-wider font-semibold">Account Type</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-[#efe7da] text-[#c99a24] border border-[#e8dfd2]">
                        {user.role === "admin" ? "Administrator" : user.role === "vendor" ? "Vendor" : "Customer"}
                      </span>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 text-[10px] uppercase font-bold tracking-wider">
                      <Link
                        href="/my-bookings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-2.5 py-2 hover:bg-[#efe7da]/40 text-[#6b6258] hover:text-[#242424] transition-colors"
                      >
                        My Bookings
                      </Link>

                      {user.role === "vendor" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block px-2.5 py-2 hover:bg-[#efe7da]/40 text-[#6b6258] hover:text-[#242424] transition-colors"
                        >
                          Vendor Dashboard
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block px-2.5 py-2 hover:bg-[#efe7da]/40 text-[#6b6258] hover:text-[#242424] transition-colors"
                        >
                          Admin Portal
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-[10px] uppercase transition-colors duration-200">
              Login
            </Link>
            <Link href="/signup" className="btn-premium border border-[#242424] bg-transparent text-[#242424] hover:bg-[#242424] hover:text-white px-4.5 py-2 rounded-none font-semibold text-[10px] tracking-wider uppercase">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Hamburger icon (Mobile) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-[#242424] hover:text-[#c99a24] transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
          <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
        </div>
      </button>

      {/* Mobile Slide-Down Dropdown Menu */}
      <div className={`absolute top-[57px] left-0 right-0 bg-[#faf7f1] border-b border-[#e8dfd2] py-6 px-6 flex flex-col gap-4 shadow-md md:hidden z-50 transition-all duration-300 ease-in-out origin-top ${mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <button
          onClick={() => handleScroll("services-section")}
          className="text-left text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition-colors duration-200 py-1"
        >
          Events
        </button>
        <button
          onClick={() => handleScroll("categories-section")}
          className="text-left text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition-colors duration-200 py-1"
        >
          Categories
        </button>
        <button
          onClick={() => handleScroll("about-section")}
          className="text-left text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition-colors duration-200 py-1"
        >
          About
        </button>
        <Link
          href="/ai-planner"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[#c99a24] font-bold tracking-wider text-xs uppercase transition-colors duration-200 py-1 flex items-center gap-1.5"
        >
          <span>✨ AI Concierge</span>
        </Link>
        <Link
          href={user ? (user.role === "vendor" ? "/dashboard" : "/vendor-request") : "/login"}
          onClick={() => setMobileMenuOpen(false)}
          className="text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition-colors duration-200 py-1"
        >
          For Vendors
        </Link>
        
        {user?.role === "admin" && (
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition-colors duration-200 py-1"
          >
            Admin Portal
          </Link>
        )}

        <div className="border-t border-[#e8dfd2]/60 pt-4 mt-2 flex flex-col gap-4">
          {user ? (
            <div className="bg-[#efe7da]/30 border border-[#e8dfd2]/65 p-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#efe7da] border border-[#e8dfd2] text-[#6b6258] flex items-center justify-center font-bold text-xs tracking-wider rounded-none">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#242424] block truncate">{user?.name}</span>
                  <span className="text-[10px] text-[#6b6258] block lowercase truncate">{user?.email}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider border-t border-b border-[#e8dfd2]/40 py-2">
                <span className="font-semibold text-[#6b6258]">Account Type</span>
                <span className="font-bold text-[#c99a24] bg-[#efe7da] px-2 py-0.5 border border-[#e8dfd2]">
                  {user.role === "admin" ? "Administrator" : user.role === "vendor" ? "Vendor" : "Customer"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-white border border-[#e8dfd2] text-[#6b6258] hover:text-[#242424] font-bold text-[9px] uppercase tracking-wider py-2.5 transition duration-150"
                >
                  My Bookings
                </Link>
                {user.role === "vendor" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center bg-white border border-[#e8dfd2] text-[#6b6258] hover:text-[#242424] font-bold text-[9px] uppercase tracking-wider py-2.5 transition duration-150"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center bg-white border border-[#e8dfd2] text-[#6b6258] hover:text-[#242424] font-bold text-[9px] uppercase tracking-wider py-2.5 transition duration-150"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex-1 text-center bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wider py-2.5 cursor-pointer transition duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-[#6b6258] hover:text-[#242424] font-semibold tracking-wider text-xs uppercase transition py-3 border border-[#e8dfd2] bg-white btn-premium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-[#242424] hover:bg-[#3a3a3a] text-white font-semibold tracking-wider text-xs uppercase transition py-3 btn-premium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
