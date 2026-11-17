import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatMoney, imageUrl } from "../api.js";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-brand-100 text-brand-700",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.get("/bookings").then((res) => setBookings(res.data)).catch(() => setError("Could not load bookings. Is the API running?")).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function cancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try { await api.delete(`/bookings/${id}`); load(); } catch { setError("Could not cancel the booking."); }
  }

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Your Stay</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">My Bookings</h1>
          <p className="mt-4 max-w-2xl text-brand-200">Review your reservations, requests and responses from our team.</p>
        </div>
      </section>

      <div className="section-wrap py-12">
        {loading && <p className="text-brand-500">Loadingâ€¦</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {!loading && bookings.length === 0 && (
          <div className="card p-10 text-center">
            <h2 className="text-2xl font-semibold text-brand-900">No reservations yet</h2>
            <p className="mt-2 text-brand-500">Discover our rooms and suites to begin your stay.</p>
            <Link to="/rooms" className="btn-primary mt-6">Explore Rooms</Link>
          </div>
        )}

        <div className="space-y-5">
          {bookings.map((booking) => (
            <article key={booking.id} className="card flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
              <img src={imageUrl(booking.roomImage)} alt={booking.roomName} className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-44" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-brand-900">{booking.roomName}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[booking.status] || statusStyles.pending}`}>{booking.status}</span>
                </div>
                <p className="mt-1 text-sm text-brand-500">
                  {new Date(booking.checkIn).toLocaleDateString()} â†’ {new Date(booking.checkOut).toLocaleDateString()} Â· {booking.guests} guest{booking.guests === 1 ? "" : "s"} Â· {booking.nights} night{booking.nights === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-sm text-brand-500">{booking.guestName} Â· {booking.email}</p>
                {booking.specialRequests && (
                  <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-sm text-brand-700"><span className="font-semibold">Your request: </span>{booking.specialRequests}</p>
                )}
                {booking.managerReply && (
                  <p className="mt-2 rounded-lg border border-gold-300/50 bg-gold-100/40 px-3 py-2 text-sm text-brand-800"><span className="font-semibold">Hotel reply: </span>{booking.managerReply}</p>
                )}
                {booking.status === "pending" && !booking.managerReply && (
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-gold-700">Awaiting response from the hotel</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-brand-100 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <p className="font-display text-2xl font-semibold text-brand-900">{formatMoney(booking.total)}</p>
                {(booking.status === "confirmed" || booking.status === "pending") && (
                  <button type="button" onClick={() => cancel(booking.id)} className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:text-red-800">Cancel</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


