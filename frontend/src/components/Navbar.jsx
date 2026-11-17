import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import api from "../api.js";
import { HOTEL_PHONE, HOTEL_PHONE_DISPLAY, whatsappLink } from "../contact.js";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/rooms", label: "Rooms & Suites" },
  { to: "/bookings", label: "My Bookings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/requests", label: "Requests" },
  { to: "/admin", label: "Manage" },
];

export function BrandMark({ compact = false }) {
  return (
    <span className="group flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-center justify-center">
        <span className="absolute inset-0 rotate-45 rounded-[14px] border border-gold-300/80 bg-gradient-to-br from-gold-700/50 via-brand-700 to-brand-800 shadow-[0_0_24px_-6px_rgba(220,200,154,0.75)] transition duration-300 ease-out group-hover:rotate-[225deg] group-hover:scale-110" />
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-gold-100 drop-shadow-[0_0_8px_rgba(220,200,154,0.7)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3.5c2.8 2.2 4.6 4.7 4.6 7.3 0 2.8-2 4.7-4.6 4.7S7.4 13.6 7.4 10.8c0-2.6 1.8-5.1 4.6-7.3Z" />
          <path d="M12 15.5V21M8.5 21h7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-semibold tracking-[0.08em] text-white transition group-hover:text-gold-100">MUKWIYE</span>
        {!compact && <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300 2xl:block">Hotel &amp; Suites · Kigali</span>}
      </span>
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadUnread() {
      try {
        const res = await api.get("/bookings");
        if (!alive) return;
        const seenAt = Number(localStorage.getItem("notifications-seen-at") || 0);
        const count = res.data.reduce((total, booking) => {
          const notes = booking.notifications || [];
          if (notes.length) {
            return total + notes.filter((note) => note.channel === "in-app" && new Date(note.createdAt).getTime() > seenAt).length;
          }
          return total + (booking.respondedAt && new Date(booking.respondedAt).getTime() > seenAt ? 1 : 0);
        }, 0);
        setUnread(count);
      } catch {
        if (alive) setUnread(0);
      }
    }
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    const onSeen = () => loadUnread();
    window.addEventListener("notifications-seen", onSeen);
    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener("notifications-seen", onSeen);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-white/10 bg-brand-900 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]" : "border-transparent bg-brand-900"}`}>
      <div className="hidden border-b border-white/10 text-brand-200 lg:block">
        <div className="section-wrap flex items-center justify-between gap-6 py-2.5 text-[11px] tracking-[0.08em]">
          <p className="shrink-0 uppercase">Refined hospitality in the heart of Kigali</p>
          <div className="flex items-center gap-5 whitespace-nowrap">
            <a href={`tel:${HOTEL_PHONE}`} className="transition hover:text-gold-300 hover:underline">Call {HOTEL_PHONE_DISPLAY}</a>
            <a href={whatsappLink("Hello Mukwiye Hotel, I'd like to make a reservation.")} target="_blank" rel="noopener noreferrer" className="transition hover:text-gold-300 hover:underline">WhatsApp</a>
            <a href="mailto:gasiraboarnauld@gmail.com" className="transition hover:text-gold-300 hover:underline">gasiraboarnauld@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="section-wrap">
        <div className={`flex items-center justify-between gap-4 transition-[height] duration-300 ${scrolled ? "h-[72px]" : "h-20"}`}>
          <Link to="/" aria-label="Mukwiye Hotel & Suites home">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative shrink-0 whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-medium uppercase leading-none tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    isActive ? "text-white" : "text-brand-200 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`absolute inset-0 rounded-full transition duration-300 ${isActive ? "bg-white/10" : "bg-white/0 group-hover:bg-white/5"}`} />
                    <span className="relative">{item.label}</span>
                    {item.to === "/notifications" && unread > 0 && (
                      <span className="relative ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1.5 align-middle text-[10px] font-bold leading-none text-brand-900">{unread}</span>
                    )}
                    <span className={`pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left bg-gradient-to-r from-gold-300 to-gold-600 transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center lg:flex">
            <Link to="/rooms" className="group relative overflow-hidden whitespace-nowrap rounded-full bg-gold-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-900 shadow-[0_10px_30px_-12px_rgba(191,164,106,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-[0_18px_40px_-14px_rgba(191,164,106,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900">
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 group-hover:translate-x-full" />
              <span className="relative">Reserve Now</span>
            </Link>
          </div>

          <button
            type="button"
            className="group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-gold-500 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">Menu</span>
            <span className="relative h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition duration-300 ${open ? "top-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition duration-300 ${open ? "top-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={`overflow-hidden border-t border-white/10 bg-brand-900 transition-[max-height,opacity,visibility] duration-300 xl:hidden ${
          open ? "visible max-h-[calc(100vh-5rem)] opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <nav className="section-wrap max-h-[calc(100vh-5rem)] space-y-1 overflow-y-auto overscroll-contain py-4" aria-label="Mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-[48px] items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-[13px] font-medium uppercase leading-snug tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                  isActive ? "bg-white/10 text-white" : "text-brand-200 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="min-w-0 flex-1">{item.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                {item.to === "/notifications" && unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[10px] font-bold leading-none text-brand-900">{unread}</span>
                )}
                <span className="text-gold-500" aria-hidden="true">&rarr;</span>
              </span>
            </NavLink>
          ))}
          <div className="grid gap-2 pt-2 sm:grid-cols-3">
            <a href={whatsappLink("Hello Mukwiye Hotel, I'd like to reserve a room.")} target="_blank" rel="noopener noreferrer" className="btn-gold w-full">WhatsApp</a>
            <a href={`tel:${HOTEL_PHONE}`} className="btn-light w-full">Call {HOTEL_PHONE_DISPLAY}</a>
            <Link to="/rooms" className="btn-light w-full">Reserve</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
