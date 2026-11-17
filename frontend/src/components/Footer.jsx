import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { HOTEL_EMAIL, HOTEL_PHONE, HOTEL_PHONE_DISPLAY, mailtoLink, reservationMessage, whatsappLink } from "../contact.js";

const DEFAULT_MAP = "https://www.google.com/maps?q=Kigali,+Rwanda&output=embed";
const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Mukwiye+Hotel+Kigali+Rwanda";

export function BrandMarkLight() {
  return (
    <span className="group flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-center justify-center">
        <span className="absolute inset-0 rotate-45 rounded-[14px] border border-gold-500/70 bg-gradient-to-br from-brand-100 to-white shadow-soft transition duration-500 group-hover:rotate-[135deg]" />
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3.5c2.8 2.2 4.6 4.7 4.6 7.3 0 2.8-2 4.7-4.6 4.7S7.4 13.6 7.4 10.8c0-2.6 1.8-5.1 4.6-7.3Z" />
          <path d="M12 15.5V21M8.5 21h7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-semibold tracking-[0.08em] text-brand-900 transition group-hover:text-brand-700">MUKWIYE</span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-700">Hotel &amp; Suites</span>
      </span>
    </span>
  );
}

export default function Footer() {
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => { if (res.data.mapEmbedUrl) setMapUrl(res.data.mapEmbedUrl); })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto border-t border-brand-200 bg-[#ece7de] text-brand-700">
      <div className="section-wrap py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr_1.35fr]">
          <div>
            <BrandMarkLight />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-600">
              An elegant address in Kigali offering refined rooms and suites, inspired dining, restorative wellness and warm, attentive service for every guest.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center justify-between gap-4 border-b border-brand-200/70 pb-2"><span className="uppercase tracking-[0.14em] text-brand-500">Reservations</span><a href={whatsappLink(reservationMessage({}))} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-900 hover:text-gold-700">WhatsApp {HOTEL_PHONE_DISPLAY}</a></p>
              <p className="flex items-center justify-between gap-4 border-b border-brand-200/70 pb-2"><span className="uppercase tracking-[0.14em] text-brand-500">Phone</span><a href={`tel:${HOTEL_PHONE}`} className="font-medium text-brand-900 hover:text-gold-700">{HOTEL_PHONE_DISPLAY}</a></p>
              <p className="flex items-center justify-between gap-4 border-b border-brand-200/70 pb-2"><span className="uppercase tracking-[0.14em] text-brand-500">Email</span><a href={mailtoLink("Reservation enquiry", reservationMessage({}))} className="font-medium text-brand-900 hover:text-gold-700">{HOTEL_EMAIL}</a></p>
              <p className="flex items-center justify-between gap-4"><span className="uppercase tracking-[0.14em] text-brand-500">Check-in / out</span><span className="font-medium text-brand-900">14:00 / 11:00</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:gap-10">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-luxe text-brand-900">Explore</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  ["/rooms", "Rooms & Suites"],
                  ["/bookings", "My Bookings"],
                  ["/notifications", "Notifications"],
                  ["/dashboard", "Dashboard"],
                  ["/requests", "Client Requests"],
                  ["/admin", "Manage Property"],
                ].map(([to, label]) => (
                  <li key={to}><Link to={to} className="group inline-flex items-center gap-2 transition hover:text-brand-900"><span className="h-px w-0 bg-gold-500 transition-all duration-300 group-hover:w-3" />{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-luxe text-brand-900">Experience</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {["#experiences", "#dining", "#wellness", "#meetings", "#gallery"].map((href) => (
                  <li key={href}><a href={`/${href}`} className="group inline-flex items-center gap-2 capitalize transition hover:text-brand-900"><span className="h-px w-0 bg-gold-500 transition-all duration-300 group-hover:w-3" />{href.replace("#", "")}</a></li>
                ))}
              </ul>
              <h4 className="mt-8 text-[11px] font-semibold uppercase tracking-luxe text-brand-900">Contact Direct</h4>
              <div className="mt-4 grid gap-2">
                <a href={whatsappLink(reservationMessage({}))} target="_blank" rel="noopener noreferrer" className="btn-gold !w-full !px-4 !py-2.5 text-[10px]">Reserve on WhatsApp</a>
                <a href={mailtoLink("Reservation enquiry", reservationMessage({}))} className="btn-outline !w-full !px-4 !py-2.5 text-[10px]">Reserve by Email</a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-luxe text-brand-900">Location</h4>
                <p className="mt-2 text-sm text-brand-600">Kigali, Rwanda &middot; Find us with ease</p>
              </div>
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-700 transition hover:text-brand-900">Get Directions &rarr;</a>
            </div>
            <div className="group relative mt-4 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-brand-900/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                Mukwiye Hotel &amp; Suites
              </div>
              {!mapLoaded && <div className="absolute inset-0 animate-pulse bg-brand-100" aria-hidden="true" />}
              <iframe
                title="Mukwiye Hotel location"
                src={mapUrl}
                className={`h-64 w-full grayscale-[20%] transition duration-700 group-hover:grayscale-0 sm:h-72 ${mapLoaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoaded(true)}
                allowFullScreen
              />
              <div className="flex items-center justify-between gap-3 border-t border-brand-100 bg-white/95 px-4 py-3 text-xs text-brand-600">
                <span>Interactive map &middot; tap for routes and live details</span>
                <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-gold-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-200/70 bg-[#e5dfd4]">
        <div className="section-wrap flex flex-col items-center justify-between gap-4 py-5 text-xs text-brand-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Mukwiye Hotel &amp; Suites. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href={`tel:${HOTEL_PHONE}`} className="transition hover:text-brand-900">Call</a>
            <a href={whatsappLink("Hello Mukwiye Hotel")} target="_blank" rel="noopener noreferrer" className="transition hover:text-brand-900">WhatsApp</a>
            <a href={mailtoLink()} className="transition hover:text-brand-900">Email</a>
            <Link to="/admin" className="transition hover:text-brand-900">Manage Property</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
