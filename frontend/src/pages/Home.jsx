import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { formatMoney, imageUrl } from "../api.js";
import RoomCard from "../components/RoomCard.jsx";
import { HOTEL_EMAIL, HOTEL_PHONE_DISPLAY, mailtoLink, reservationMessage, whatsappLink } from "../contact.js";

const today = new Date().toISOString().split("T")[0];
const coverUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2200&q=80`;
const DEFAULT_COVERS = [
  coverUrl("photo-1566073771259-6a8506099945"),
  coverUrl("photo-1611892440504-42a792e24d32"),
  coverUrl("photo-1582719508461-905c673771fd"),
  coverUrl("photo-1542314831-068cd1dbfeeb"),
  coverUrl("photo-1571896349842-33c89424de2d"),
];
const HERO_FALLBACK = DEFAULT_COVERS[0];
const EXTRA_COVERS = DEFAULT_COVERS.slice(1);

const amenities = [
  ["Outdoor Pool", "A serene poolside setting for relaxation throughout your stay."],
  ["Signature Dining", "Curated restaurants and bars serving international and local flavors."],
  ["Saray Spa & Wellness", "Restorative treatments, steam, sauna and a tranquil atmosphere."],
  ["Fitness Center", "Modern equipment to keep your routine on track, day or night."],
  ["Meetings & Events", "Elegant venues and attentive service for gatherings of every scale."],
  ["Complimentary Wi-Fi", "Stay connected across guest rooms and public spaces."],
];

const dining = [
  {
    name: "The Garden Table",
    type: "International",
    desc: "All-day dining with seasonal ingredients, generous breakfast spreads and refined evening plates.",
  },
  {
    name: "Cucina",
    type: "Italian",
    desc: "Handcrafted pasta, risotto and regional Italian classics in an intimate setting.",
  },
  {
    name: "Terrace & Pool Bar",
    type: "Grill & Cocktails",
    desc: "Light fare and signature drinks beside the pool, perfect for unhurried afternoons.",
  },
];

const highlights = [
  ["Instant Contact", "Reserve or enquire directly on WhatsApp or email with pre-filled details."],
  ["Curated Comfort", "Elegant rooms and suites prepared for rest, work and unhurried stays."],
  ["Prime Kigali Setting", "An inviting base close to the city's business, culture and experiences."],
  ["Attentive Service", "A warm team ready to personalize your arrival and every moment in between."],
];

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hero, setHero] = useState(HERO_FALLBACK);
  const [slideIndex, setSlideIndex] = useState(0);
  const [garden, setGarden] = useState("");
  const [hotelPhotos, setHotelPhotos] = useState([]);
  const [guestVideos, setGuestVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingGarden, setUploadingGarden] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [gardenError, setGardenError] = useState("");
  const [search, setSearch] = useState({ checkIn: "", checkOut: "", guests: 1 });

  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data.slice(0, 3))).catch(() => setRooms([]));
    api
      .get("/settings")
      .then((res) => {
        if (res.data.heroImage) setHero(res.data.heroImage);
        if (res.data.gardenImage) setGarden(res.data.gardenImage);
        setHotelPhotos(res.data.hotelPhotos || []);
        setGuestVideos(res.data.guestVideos || []);
      })
      .catch(() => {});
  }, []);

  async function uploadSetting(event, target) {
    const selected = event.target.files?.[0] || null;
    event.target.value = "";
    if (!selected) return;
    const setBusy = target === "garden" ? setUploadingGarden : setUploading;
    const setErr = target === "garden" ? setGardenError : setHeroError;
    setBusy(true);
    setErr("");
    try {
      const data = new FormData();
      data.append("image", selected);
      data.append("target", target === "garden" ? "garden" : "hero");
      const res = await api.put("/settings", data);
      if (target === "garden") setGarden(res.data.gardenImage);
      else {
        setHero(res.data.heroImage);
        setSlideIndex(0);
      }
    } catch (err) {
      setErr(err.response?.data?.message || "Could not update the photo.");
    } finally {
      setBusy(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.checkIn) params.set("checkIn", search.checkIn);
    if (search.checkOut) params.set("checkOut", search.checkOut);
    if (search.guests) params.set("guests", search.guests);
    navigate(`/rooms?${params.toString()}`);
  }

  const covers = hero && hero !== HERO_FALLBACK ? [hero, ...EXTRA_COVERS] : DEFAULT_COVERS;

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((index) => (index + 1) % covers.length), 3000);
    return () => clearInterval(timer);
  }, [covers.length]);

  const quickMsg = reservationMessage({ checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests });

  return (
    <div>
      <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden bg-brand-900">
        {covers.map((cover, index) => (
          <img
            key={`${cover}-${index}`}
            src={imageUrl(cover)}
            alt={index === slideIndex ? "Mukwiye Hotel & Suites" : ""}
            aria-hidden={index !== slideIndex}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === slideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/55 to-brand-900/20" />
        <div className="absolute right-4 top-6 z-20 sm:right-8">
          <label className="btn-light cursor-pointer !px-4 !py-2 text-[10px]">
            {uploading ? "Uploading..." : "Change cover photo"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => uploadSetting(e, "hero")} />
          </label>
          {heroError && <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">{heroError}</p>}
        </div>
        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-2 sm:right-8" aria-label="Cover photos">
          {covers.map((cover, index) => (
            <button
              key={`${cover}-dot-${index}`}
              type="button"
              onClick={() => setSlideIndex(index)}
              aria-label={`Show cover photo ${index + 1}`}
              aria-current={index === slideIndex}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 ${
                index === slideIndex ? "w-8 bg-gold-300" : "w-1.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
        <div className="section-wrap relative z-10 pb-28 pt-32">
          <p className="eyebrow text-gold-300">Kigali, Rwanda</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Experience Refined Hospitality in the Heart of Kigali
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
            Discover elegant rooms and suites, inspired dining, restorative wellness and seamless service crafted for business and leisure travelers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/rooms" className="btn-gold">Explore Rooms</Link>
            <a href={whatsappLink(quickMsg)} target="_blank" rel="noopener noreferrer" className="btn-light">Reserve on WhatsApp</a>
            <a href={mailtoLink("Reservation enquiry", quickMsg)} className="btn-light">Email Reservation</a>
          </div>
          <p className="mt-4 text-sm text-brand-200">Direct: <a href={`tel:+250792318368`} className="font-semibold text-white hover:text-gold-300">{HOTEL_PHONE_DISPLAY}</a> · <a href={`mailto:${HOTEL_EMAIL}`} className="font-semibold text-white hover:text-gold-300">{HOTEL_EMAIL}</a></p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
        <form onSubmit={handleSearch} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label className="label" htmlFor="checkIn">Check in</label>
            <input id="checkIn" type="date" min={today} className="field" value={search.checkIn} onChange={(e) => setSearch({ ...search, checkIn: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="checkOut">Check out</label>
            <input id="checkOut" type="date" min={search.checkIn || today} className="field" value={search.checkOut} onChange={(e) => setSearch({ ...search, checkOut: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="guests">Guests</label>
            <select id="guests" className="field" value={search.guests} onChange={(e) => setSearch({ ...search, guests: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full lg:w-auto">Check Availability</button>
        </form>
      </section>

      <section id="experiences" className="section-wrap py-20">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
              A distinctive address for comfort, connection and calm
            </h2>
          </div>
          <p className="text-base leading-relaxed text-brand-600">
            Perfectly placed for business, culture and exploration, Mukwiye Hotel &amp; Suites blends contemporary elegance with warm Rwandan hospitality. From spacious accommodations to thoughtful amenities, every detail is designed around your stay.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-brand-100 bg-brand-100 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(([title, text]) => (
            <div key={title} className="group bg-white p-7 transition duration-300 hover:-translate-y-1 hover:bg-sand">
              <p className="font-display text-2xl font-semibold text-brand-900">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-brand-100 bg-brand-100 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map(([title, text]) => (
            <div key={title} className="group bg-white p-7 transition duration-300 hover:bg-sand/60">
              <p className="font-display text-2xl font-semibold text-brand-900 transition group-hover:text-gold-700">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="section-wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Rooms &amp; Suites</p>
              <h2 className="mt-3 text-4xl font-semibold text-brand-900 sm:text-5xl">Stay in comfort and style</h2>
              <p className="mt-3 max-w-2xl text-brand-600">Thoughtfully appointed spaces with plush bedding, modern conveniences and serene views.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={whatsappLink(reservationMessage({}))} target="_blank" rel="noopener noreferrer" className="btn-gold">Reserve on WhatsApp</a>
              <Link to="/rooms" className="btn-outline">View All Rooms</Link>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          {rooms.length === 0 && (
            <p className="mt-8 text-brand-500">Rooms will appear here once added. <Link to="/admin" className="underline">Manage rooms</Link>.</p>
          )}
        </div>
      </section>

      <section id="dining" className="section-wrap py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Dining</p>
            <h2 className="mt-3 text-4xl font-semibold text-brand-900 sm:text-5xl">Flavors for every moment</h2>
            <p className="mt-4 max-w-xl text-brand-600">From leisurely breakfasts to elegant dinners and relaxed poolside bites, our venues bring global cuisine and local character to the table.</p>
            <div className="mt-8 space-y-5">
              {dining.map((item) => (
                <div key={item.name} className="group border-l-2 border-gold-500 pl-4 transition hover:border-gold-700">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-700">{item.type}</p>
                  <h3 className="mt-1 text-2xl font-semibold text-brand-900 transition group-hover:text-gold-700">{item.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80" alt="Dining" className="h-72 w-full rounded-2xl object-cover shadow-soft transition duration-500 hover:-translate-y-1 sm:h-96" />
            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80" alt="Restaurant" className="mt-8 h-72 w-full rounded-2xl object-cover shadow-soft transition duration-500 hover:-translate-y-1 sm:h-96" />
          </div>
        </div>
      </section>

      <section id="wellness" className="bg-brand-900 py-20 text-white">
        <div className="section-wrap grid items-center gap-10 lg:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-brand-800 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
            {garden ? (
              <img src={imageUrl(garden)} alt="Garden and wellness" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center p-8 text-center text-brand-200">
                Add a garden or wellness photo to showcase this space.
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <label className="btn-light cursor-pointer !px-4 !py-2 text-[10px]">
                {uploadingGarden ? "Uploading..." : "Upload wellness photo"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingGarden} onChange={(e) => uploadSetting(e, "garden")} />
              </label>
              {gardenError && <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">{gardenError}</p>}
            </div>
          </div>
          <div>
            <p className="eyebrow text-gold-300">Spa &amp; Wellness</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Restore, recharge, renew</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-brand-200">
              Unwind with soothing spa treatments, a refreshing dip in the outdoor pool, or an energizing session in the fitness center. Our wellness spaces are designed to bring balance to every stay.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-brand-100 sm:grid-cols-2">
              {["Signature massages & facials", "Outdoor swimming pool", "Fully equipped fitness center", "Steam & sauna facilities"].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" />{item}</li>
              ))}
            </ul>
            <Link to="/rooms" className="btn-gold mt-8">Plan Your Stay</Link>
          </div>
        </div>
      </section>

      <section id="meetings" className="section-wrap py-20">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-soft transition hover:shadow-[0_30px_70px_-40px_rgba(23,20,17,0.5)] sm:p-12 lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-10">
          <div>
            <p className="eyebrow">Meetings &amp; Events</p>
            <h2 className="mt-3 text-4xl font-semibold text-brand-900 sm:text-5xl">Gather with confidence</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-brand-600">
              Host productive meetings and memorable celebrations in versatile spaces supported by attentive planning, modern technology and tailored catering in the heart of Kigali.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[["Flexible Venues", "Spaces for board meetings to grand receptions"], ["Dedicated Support", "A team focused on seamless execution"], ["Central Location", "Easy access for local and international guests"]].map(([t, d]) => (
                <div key={t} className="group">
                  <p className="font-display text-xl font-semibold text-brand-900 transition group-hover:text-gold-700">{t}</p>
                  <p className="mt-1 text-sm text-brand-600">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 rounded-2xl bg-sand p-8 lg:mt-0">
            <p className="font-display text-2xl font-semibold text-brand-900">Plan or reserve directly</p>
            <p className="mt-2 text-sm text-brand-600">Reach our team instantly for reservations, events or special requests.</p>
            <ul className="mt-5 space-y-2 text-sm text-brand-700">
              <li><a href={`tel:+250792318368`} className="font-medium hover:text-gold-700">Call/WhatsApp: {HOTEL_PHONE_DISPLAY}</a></li>
              <li><a href={mailtoLink("Reservation / Event enquiry", reservationMessage({}))} className="font-medium hover:text-gold-700">{HOTEL_EMAIL}</a></li>
              <li>Kigali, Rwanda</li>
            </ul>
            <div className="mt-6 grid gap-2">
              <a href={whatsappLink(reservationMessage({}))} target="_blank" rel="noopener noreferrer" className="btn-gold w-full">WhatsApp Us</a>
              <a href={mailtoLink("Reservation enquiry", reservationMessage({}))} className="btn-outline w-full">Email Us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white py-12">
        <div className="section-wrap grid gap-6 text-center sm:grid-cols-3">
          {[["14:00 / 11:00", "Check-in / Check-out"], ["24/7", "Front Desk & Concierge"], [rooms.length ? `${rooms.length}+` : "Elegant", "Rooms & Suites"]].map(([v, l]) => (
            <div key={l} className="rounded-xl p-4 transition hover:bg-sand">
              <p className="font-display text-3xl font-semibold text-brand-900">{v}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {(hotelPhotos.length > 0 || guestVideos.length > 0) && (
        <section id="gallery" className="section-wrap py-20">
          {hotelPhotos.length > 0 && (
            <div>
              <p className="eyebrow">Gallery</p>
              <h2 className="mt-3 text-4xl font-semibold text-brand-900 sm:text-5xl">Moments at Mukwiye</h2>
              <p className="mt-3 max-w-2xl text-brand-600">A glimpse of our spaces, experiences and the warm hospitality our guests enjoy.</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hotelPhotos.map((photo, i) => (
                  <figure key={`${photo.url}-${i}`} className="group overflow-hidden rounded-2xl bg-brand-100 shadow-soft">
                    <img src={imageUrl(photo.url)} alt={photo.caption || "Hotel photo"} className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
                    {photo.caption && <figcaption className="bg-white px-4 py-3 text-sm text-brand-600">{photo.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}
          {guestVideos.length > 0 && (
            <div className={hotelPhotos.length > 0 ? "mt-16" : ""}>
              <p className="eyebrow">Guest Moments</p>
              <h2 className="mt-3 text-4xl font-semibold text-brand-900 sm:text-5xl">Stories from our guests</h2>
              <p className="mt-3 max-w-2xl text-brand-600">Watch highlights and experiences shared from stays at our hotel.</p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {guestVideos.map((video, i) => (
                  <div key={`${video.url}-${i}`} className="card overflow-hidden">
                    {video.type === "embed" ? (
                      <div className="aspect-video">
                        <iframe src={video.url} title={video.title || "Guest video"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <video src={imageUrl(video.url)} controls className="aspect-video w-full bg-black object-contain" />
                    )}
                    {video.title && <p className="px-4 py-3 text-sm font-medium text-brand-700">{video.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <a href={whatsappLink(reservationMessage({}))} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)] transition duration-300 hover:-translate-y-1 hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M19.11 17.53c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.11 2.8c.14.18 1.92 2.94 4.66 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.29.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.52-.32zM16.03 5.33c-5.88 0-10.67 4.76-10.67 10.62 0 1.87.5 3.7 1.45 5.31l-1.54 5.61 5.75-1.51a10.67 10.67 0 0 0 5.01 1.27h.01c5.88 0 10.66-4.77 10.66-10.63 0-2.84-1.11-5.51-3.13-7.53a10.59 10.59 0 0 0-7.54-3.14zm0 19.44h-.01a8.84 8.84 0 0 1-4.5-1.23l-.32-.19-3.41.89.91-3.32-.21-.34a8.8 8.8 0 0 1-1.36-4.63c0-4.87 3.98-8.84 8.9-8.84 2.38 0 4.61.93 6.29 2.61a8.78 8.78 0 0 1 2.6 6.28c0 4.88-3.99 8.77-8.89 8.77z"/></svg>
      </a>
    </div>
  );
}
