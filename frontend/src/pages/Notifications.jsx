import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatMoney, imageUrl } from "../api.js";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-brand-100 text-brand-700",
};

function defaultReply(status) {
  if (status === "confirmed") return "Your request has been approved.";
  if (status === "declined") return "Unfortunately, your request could not be accommodated.";
  if (status === "cancelled") return "This booking was cancelled.";
  return "Your booking has been updated.";
}

export default function Notifications() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/bookings")
      .then((res) => {
        const latest = (b) => {
          const times = (b.notifications || []).map((n) => new Date(n.createdAt).getTime());
          if (b.respondedAt) times.push(new Date(b.respondedAt).getTime());
          return times.length ? Math.max(...times) : 0;
        };
        const withMessages = res.data
          .filter((b) => (b.notifications || []).length || b.respondedAt)
          .sort((a, b) => latest(b) - latest(a));
        setBookings(withMessages);
        localStorage.setItem("notifications-seen-at", String(Date.now()));
        window.dispatchEvent(new Event("notifications-seen"));
      })
      .catch(() => setError("Could not load notifications. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Updates</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Notifications</h1>
          <p className="mt-4 max-w-2xl text-brand-200">Responses and updates regarding your reservations and requests.</p>
        </div>
      </section>

      <div className="section-wrap py-12">
        {loading && <p className="text-brand-500">Loadingâ€¦</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!loading && !error && bookings.length === 0 && (
          <div className="card p-10 text-center">
            <h2 className="text-2xl font-semibold text-brand-900">No notifications yet</h2>
            <p className="mt-2 text-brand-500">Updates from the hotel will appear here.</p>
            <Link to="/bookings" className="btn-outline mt-6">View My Bookings</Link>
          </div>
        )}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
              <img src={imageUrl(booking.roomImage)} alt={booking.roomName} className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-36" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-brand-900">{booking.roomName}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[booking.status] || statusStyles.pending}`}>{booking.status}</span>
                </div>
                <p className="mt-1 text-sm text-brand-500">
                  {new Date(booking.checkIn).toLocaleDateString()} â†’ {new Date(booking.checkOut).toLocaleDateString()} Â· {formatMoney(booking.total)}
                </p>
                {(booking.notifications || []).filter((n) => n.channel === "in-app").map((note, index) => (
                  <div key={`${note.createdAt}-${index}`} className="mt-3 rounded-lg border border-gold-300/40 bg-gold-100/30 px-4 py-3">
                    <p className="text-sm font-semibold text-brand-900">{note.title}</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-brand-800">{note.message}</p>
                  </div>
                ))}
                {!(booking.notifications || []).some((n) => n.channel === "in-app") && (
                  <p className="mt-3 rounded-lg border border-gold-300/40 bg-gold-100/30 px-4 py-3 text-sm text-brand-800">
                    <span className="font-semibold">Hotel reply: </span>{booking.managerReply || defaultReply(booking.status)}
                  </p>
                )}
                {(booking.notifications || []).filter((n) => n.channel !== "in-app").map((note, index) => (
                  <span key={`${note.channel}-${index}`} className={`mt-2 mr-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${note.status === "sent" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {note.channel === "email" ? "Email" : "WhatsApp"} {note.status}
                  </span>
                ))}
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-brand-400">
                  Updated {new Date((booking.notifications || []).at(-1)?.createdAt || booking.respondedAt).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


