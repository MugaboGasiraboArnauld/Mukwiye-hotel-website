import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api, { formatMoney, imageUrl, nights } from "../api.js";
import { HOTEL_EMAIL, HOTEL_PHONE_DISPLAY, mailtoLink, reservationMessage, whatsappLink } from "../contact.js";

const today = new Date().toISOString().split("T")[0];

export default function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [form, setForm] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: Number(searchParams.get("guests")) || 1,
    guestName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  useEffect(() => {
    api
      .get(`/rooms/${id}`)
      .then((res) => setRoom(res.data))
      .catch(() => setError("Room not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const stay = useMemo(() => nights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const details = useMemo(() => ({
    roomName: room?.name,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: form.guests,
    guestName: form.guestName,
    phone: form.phone,
    specialRequests: form.specialRequests,
    total: stay > 0 && room ? formatMoney(room.price * stay) : "",
  }), [room, form, stay]);

  const waHref = whatsappLink(reservationMessage(details));
  const mailHref = mailtoLink(
    `Reservation request - ${room?.name || "Mukwiye Hotel"}`,
    reservationMessage(details)
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (stay <= 0) {
      setError("Please select a valid check-in and check-out date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", { ...form, roomId: id });
      setConfirmed(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't submit your reservation. Please try again or contact us directly on WhatsApp or email.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="section-wrap py-20 text-brand-500">Loading...</p>;
  if (!room) {
    return (
      <div className="section-wrap py-20">
        <p className="text-brand-500">{error}</p>
        <Link to="/rooms" className="btn-outline mt-6">Back to Rooms</Link>
      </div>
    );
  }

  if (confirmed) {
    const cDetails = {
      bookingId: confirmed.id,
      roomName: confirmed.roomName,
      guestName: confirmed.guestName,
      checkIn: new Date(confirmed.checkIn).toLocaleDateString(),
      checkOut: new Date(confirmed.checkOut).toLocaleDateString(),
      guests: confirmed.guests,
      phone: confirmed.phone,
      specialRequests: confirmed.specialRequests,
      total: formatMoney(confirmed.total),
    };
    const cMsg = reservationMessage(cDetails);
    const hotelWa = whatsappLink(cMsg);
    const hotelMail = mailtoLink(`Reservation ${confirmed.id} - ${confirmed.roomName}`, cMsg);
    const guestWa = confirmed.phone ? `https://wa.me/${String(confirmed.phone).replace(/\D/g, "").replace(/^0/, "250")}?text=${encodeURIComponent(cMsg)}` : "";
    const guestMail = confirmed.email ? `mailto:${confirmed.email}?subject=${encodeURIComponent(`Mukwiye Hotel: Reservation received (${confirmed.roomName})`)}&body=${encodeURIComponent(cMsg)}` : "";
    const n = confirmed.notifications || {};
    const auto = [n.hotelEmail?.sent && "hotel email", n.guestEmail?.sent && "your email", n.hotelWhatsApp?.sent && "hotel WhatsApp", n.guestWhatsApp?.sent && "your WhatsApp"].filter(Boolean);
    return (
      <div className="section-wrap py-16">
        <div className="card mx-auto max-w-3xl p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 font-display text-2xl text-gold-700">&#10003;</div>
            <p className="eyebrow mt-5">Reservation</p>
            <h1 className="mt-2 text-4xl font-semibold text-brand-900">
              {confirmed.status === "confirmed" ? "Booking Confirmed" : "Request Received"}
            </h1>
            <p className="mt-3 text-brand-600">
              Thank you, {confirmed.guestName}. Your request for <strong>{confirmed.roomName}</strong> has been submitted. Your <strong>Booking/Ticket ID: {confirmed.id}</strong> is included in the message below - please save it.
              Your full reservation message has been saved automatically in <Link to="/notifications" className="font-semibold text-gold-700 hover:underline">Notifications</Link>.
              {auto.length ? ` Also sent via: ${auto.join(", ")}.` : " Enable email/WhatsApp delivery in settings, or use the buttons below to send a copy yourself."} Please reply <strong>CONFIRMED {confirmed.id}</strong> via WhatsApp or email so we can acknowledge receipt and both have your ticket on record.
            </p>
          </div>
          <dl className="mt-8 space-y-3 rounded-xl bg-sand p-6 text-left text-sm">
            {[["Room", confirmed.roomName], ["Check in", new Date(confirmed.checkIn).toLocaleDateString()], ["Check out", new Date(confirmed.checkOut).toLocaleDateString()], ["Guests", confirmed.guests], ["Email", confirmed.email], ["Phone", confirmed.phone || "—"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-brand-500">{k}</dt><dd className="font-semibold text-brand-900 text-right">{v}</dd></div>
            ))}
            <div className="flex justify-between border-t border-brand-200 pt-3"><dt className="text-brand-500">Total</dt><dd className="font-display text-xl font-semibold text-brand-900">{formatMoney(confirmed.total)}</dd></div>
          </dl>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gold-300/40 bg-gold-100/30 p-4">
              <p className="text-sm font-semibold text-brand-900">Notify the hotel now</p>
              <p className="mt-1 text-sm text-brand-600">Send this reservation directly to us for fastest confirmation.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={hotelWa} target="_blank" rel="noopener noreferrer" className="btn-gold !px-4 !py-2.5">WhatsApp Hotel</a>
                <a href={hotelMail} className="btn-outline !px-4 !py-2.5">Email Hotel</a>
              </div>
            </div>
            <div className="rounded-xl border border-brand-100 bg-sand p-4">
              <p className="text-sm font-semibold text-brand-900">Get your ticket on your device</p>
              <p className="mt-1 text-sm text-brand-600">Send a copy to your WhatsApp or email, then reply <strong>CONFIRMED {confirmed.id}</strong> so we know you received your ticket.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {guestWa ? <a href={guestWa} target="_blank" rel="noopener noreferrer" className="btn-gold !px-4 !py-2.5">WhatsApp Me</a> : <span className="text-xs text-brand-500">Add a phone number to receive WhatsApp.</span>}
                {guestMail && <a href={guestMail} className="btn-outline !px-4 !py-2.5">Email Me</a>}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/bookings" className="btn-primary">View My Bookings</Link>
            <Link to="/rooms" className="btn-outline">Explore Rooms</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-wrap py-10 sm:py-14">
        <Link to="/rooms" className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500 transition hover:text-brand-900">&larr; Back to Rooms &amp; Suites</Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="group overflow-hidden rounded-3xl">
              <img src={imageUrl(room.image)} alt={room.name} className="h-[460px] w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            </div>
            {room.video && (
              <div className="mt-6 overflow-hidden rounded-3xl bg-black">
                <video src={imageUrl(room.video)} poster={imageUrl(room.image)} controls className="h-[360px] w-full object-contain">Your browser does not support the video tag.</video>
              </div>
            )}
            <div className="mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">{room.type}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${room.booked ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}>{room.booked ? "Booked" : "Available"}</span>
                  </div>
                  <h1 className="mt-4 text-4xl font-semibold text-brand-900 sm:text-5xl">{room.name}</h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.14em] text-brand-500">{room.bed} &middot; Up to {room.capacity} guests{room.size ? ` &middot; ${room.size}` : ""}</p>
                </div>
                <p className="text-right">
                  <span className="font-display text-4xl font-semibold text-brand-900">{formatMoney(room.price)}</span>
                  <span className="block text-[11px] uppercase tracking-[0.14em] text-brand-400">per night</span>
                  {room.monthlyPrice > 0 && <span className="mt-1 block text-sm font-medium text-gold-700">{formatMoney(room.monthlyPrice)} / month</span>}
                </p>
              </div>
              <p className="mt-6 max-w-3xl leading-relaxed text-brand-600">{room.description}</p>
              <h2 className="mt-10 text-2xl font-semibold text-brand-900">Amenities &amp; Features</h2>
              <ul className="mt-4 grid gap-2 text-sm text-brand-600 sm:grid-cols-2">
                {room.amenities?.map((item) => (
                  <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" />{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <form onSubmit={handleSubmit} className="card p-6 sm:p-7">
              <p className="eyebrow">Reservation</p>
              <h2 className="mt-2 text-3xl font-semibold text-brand-900">Reserve this room</h2>
              {room.booked && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">This room is currently unavailable. Please explore other accommodations or contact us for alternatives.</p>}
              {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label" htmlFor="checkIn">Check in</label><input id="checkIn" type="date" required min={today} className="field" value={form.checkIn} onChange={update("checkIn")} /></div>
                  <div><label className="label" htmlFor="checkOut">Check out</label><input id="checkOut" type="date" required min={form.checkIn || today} className="field" value={form.checkOut} onChange={update("checkOut")} /></div>
                </div>
                <div>
                  <label className="label" htmlFor="guests">Guests</label>
                  <select id="guests" className="field" value={form.guests} onChange={update("guests")}>
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                    ))}
                  </select>
                </div>
                <div><label className="label" htmlFor="guestName">Full name</label><input id="guestName" required className="field" placeholder="Your name" value={form.guestName} onChange={update("guestName")} /></div>
                <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="field" placeholder="you@example.com" value={form.email} onChange={update("email")} /></div>
                <div><label className="label" htmlFor="phone">Phone (WhatsApp)</label><input id="phone" className="field" placeholder={HOTEL_PHONE_DISPLAY} value={form.phone} onChange={update("phone")} /></div>
                <div><label className="label" htmlFor="specialRequests">Special requests (optional)</label><textarea id="specialRequests" rows="3" className="field resize-none" placeholder="Arrival time, preferences, etc." value={form.specialRequests} onChange={update("specialRequests")} /></div>
              </div>
              <div className="mt-6 space-y-2 border-t border-brand-100 pt-4 text-sm">
                <div className="flex justify-between text-brand-500"><span>{formatMoney(room.price)} &times; {stay || 0} night{stay === 1 ? "" : "s"}</span><span>{formatMoney(room.price * stay)}</span></div>
                <div className="flex justify-between text-base font-semibold text-brand-900"><span>Total</span><span className="font-display text-xl">{formatMoney(room.price * stay)}</span></div>
              </div>
              <button type="submit" disabled={submitting || stay <= 0 || room.booked} className="btn-primary mt-6 w-full">
                {room.booked ? "Room Unavailable" : submitting ? "Submitting request..." : "Send Reservation Request"}
              </button>
              <p className="mt-3 text-center text-xs text-brand-400">No payment required now. We will confirm your request.</p>

              <div className="mt-5 rounded-xl border border-brand-100 bg-sand p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">Prefer to reserve directly?</p>
                <p className="mt-1 text-sm text-brand-600">Contact us on WhatsApp or email with your details pre-filled.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-gold !px-3 !py-2.5 text-[10px]">WhatsApp {HOTEL_PHONE_DISPLAY}</a>
                  <a href={mailHref} className="btn-outline !px-3 !py-2.5 text-[10px]">Email Reservation</a>
                </div>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}


