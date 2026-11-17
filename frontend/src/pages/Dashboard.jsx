import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatMoney, imageUrl } from "../api.js";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-brand-100 text-brand-700",
};

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/rooms"), api.get("/bookings")])
      .then(([roomsRes, bookingsRes]) => {
        setRooms(roomsRes.data);
        setBookings(bookingsRes.data);
      })
      .catch(() => setError("Could not load the dashboard. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const available = rooms.filter((r) => !r.booked).length;
  const booked = rooms.filter((r) => r.booked).length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const declined = bookings.filter((b) => b.status === "declined").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const revenue = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.total || 0), 0);
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Management</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Dashboard</h1>
          <p className="mt-4 max-w-2xl text-brand-200">Overview of accommodations, reservations and guest requests.</p>
        </div>
      </section>

      <div className="section-wrap py-12">
        {loading && <p className="text-brand-500">Loading...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Rooms", rooms.length, `${available} available`],
                ["Booked Rooms", booked, `${rooms.length - booked} open`],
                ["Pending Requests", pending, "awaiting response"],
                ["Confirmed Revenue", formatMoney(revenue), `${confirmed} confirmed`],
              ].map(([label, value, note]) => (
                <div key={label} className="card p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-500">{label}</p>
                  <p className="mt-3 font-display text-3xl font-semibold text-brand-900">{value}</p>
                  <p className="mt-1 text-sm text-brand-500">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[["Declined", declined], ["Cancelled", cancelled], ["Awaiting Action", pending]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white px-6 py-4">
                  <span className="text-sm font-medium text-brand-600">{label}</span>
                  <span className="font-display text-2xl font-semibold text-brand-900">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-3xl font-semibold text-brand-900">Recent Requests</h2>
                  <Link to="/requests" className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700 hover:text-brand-900">View All</Link>
                </div>
                <div className="mt-5 space-y-3">
                  {recent.map((booking) => (
                    <div key={booking.id} className="card flex items-center gap-4 p-3">
                      <img src={imageUrl(booking.roomImage)} alt={booking.roomName} className="h-16 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-brand-900">{booking.guestName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyles[booking.status] || statusStyles.pending}`}>{booking.status}</span>
                        </div>
                        <p className="truncate text-sm text-brand-500">
                          {booking.roomName} &middot; {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-semibold text-brand-900">{formatMoney(booking.total)}</p>
                    </div>
                  ))}
                  {recent.length === 0 && <p className="text-sm text-brand-500">No bookings yet.</p>}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-brand-900">Quick Actions</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ["/admin", "Rooms & Media", "Add rooms, photos, videos and availability"],
                    ["/requests", "Client Requests", "Review and respond to booking requests"],
                    ["/notifications", "Notifications", "View updates sent to guests"],
                    ["/bookings", "All Bookings", "Browse reservations across the property"],
                  ].map(([to, title, desc]) => (
                    <Link key={to} to={to} className="card flex items-center justify-between p-5 transition hover:border-gold-500/60">
                      <span>
                        <span className="block font-semibold text-brand-900">{title}</span>
                        <span className="text-sm text-brand-500">{desc}</span>
                      </span>
                      <span className="text-gold-700">&rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
