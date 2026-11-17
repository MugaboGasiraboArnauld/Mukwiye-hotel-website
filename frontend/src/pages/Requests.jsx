import { useEffect, useState } from "react";
import api, { formatMoney, imageUrl } from "../api.js";
import { reservationMessage, whatsappLink } from "../contact.js";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-brand-100 text-brand-700",
};

export default function Requests() {
  const [bookings, setBookings] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    api.get("/bookings")
      .then((res) => {
        setBookings(res.data);
        setReplies(Object.fromEntries(res.data.map((b) => [b.id, b.managerReply || ""])));
      })
      .catch(() => setError("Could not load client requests. Is the API running?"))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function respond(booking, status) {
    setError(""); setMessage(""); setSavingId(booking.id);
    try {
      const res = await api.put(`/bookings/${booking.id}`, { status, managerReply: replies[booking.id] || "" });
      const n = res.data?.notifications || {};
      const sent = [n.guestEmail?.sent && "guest email", n.guestWhatsApp?.sent && "guest WhatsApp", n.hotelEmail?.sent && "hotel email"].filter(Boolean);
      const note = sent.length ? ` Notifications sent: ${sent.join(", ")}.` : " Use WhatsApp/Email buttons to notify the guest instantly.";
      setMessage((status === "confirmed" ? `Request from ${booking.guestName} approved.` : `Request from ${booking.guestName} declined.`) + note);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send your response.");
    } finally { setSavingId(null); }
  }

  function guestMsg(booking) {
    return reservationMessage({
      bookingId: booking.id,
      roomName: booking.roomName,
      guestName: booking.guestName,
      checkIn: new Date(booking.checkIn).toLocaleDateString(),
      checkOut: new Date(booking.checkOut).toLocaleDateString(),
      guests: booking.guests,
      phone: booking.phone,
      specialRequests: booking.specialRequests,
      total: formatMoney(booking.total),
    }) + (booking.managerReply || replies[booking.id] ? `\nHotel reply: ${booking.managerReply || replies[booking.id]}` : "");
  }

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Management</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Client Requests</h1>
          <p className="mt-4 max-w-2xl text-brand-200">Review reservations and respond to guests. Approving/declining triggers guest notifications (when email/WhatsApp delivery is configured) and you can always notify them directly.</p>
        </div>
      </section>

      <div className="section-wrap py-12">
        {message && <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-brand-500">Loading...</p>}
        {!loading && bookings.length === 0 && <div className="card p-10 text-center"><p className="text-brand-500">No client requests yet.</p></div>}

        <div className="space-y-5">
          {bookings.map((booking) => {
            const gMsg = guestMsg(booking);
            const waGuest = booking.phone ? whatsappLink(gMsg).replace("wa.me/250792318368", `wa.me/${String(booking.phone).replace(/\D/g, "").replace(/^0/, "250")}`) : "";
            const mailGuest = booking.email ? `mailto:${booking.email}?subject=${encodeURIComponent(`Mukwiye Hotel: Reservation ${booking.status}`)}&body=${encodeURIComponent(gMsg)}` : "";
            return (
            <article key={booking.id} className="card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <img src={imageUrl(booking.roomImage)} alt={booking.roomName} className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-40" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-brand-900">{booking.roomName}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[booking.status] || statusStyles.pending}`}>{booking.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-brand-500">{booking.guestName} &middot; {booking.email}{booking.phone ? ` · ${booking.phone}` : ""}</p>
                  <p className="mt-1 text-sm text-brand-500">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()} &middot; {booking.guests} guest{booking.guests === 1 ? "" : "s"} &middot; {booking.nights} night{booking.nights === 1 ? "" : "s"} &middot; {formatMoney(booking.total)}
                  </p>
                  {booking.specialRequests && (
                    <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-sm text-brand-700"><span className="font-semibold">Guest request: </span>{booking.specialRequests}</p>
                  )}
                </div>
              </div>
              <div className="mt-5 border-t border-brand-100 pt-5">
                <label className="label" htmlFor={`reply-${booking.id}`}>Response to guest</label>
                <textarea id={`reply-${booking.id}`} rows="3" className="field resize-none" placeholder="e.g. Your request is confirmed. We look forward to welcoming you." value={replies[booking.id] || ""} onChange={(e) => setReplies({ ...replies, [booking.id]: e.target.value })} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={savingId === booking.id || booking.status === "confirmed"} onClick={() => respond(booking, "confirmed")} className="btn-primary !px-5 !py-2.5">
                    {savingId === booking.id ? "Sending..." : "Approve & Notify"}
                  </button>
                  <button type="button" disabled={savingId === booking.id || booking.status === "declined"} onClick={() => respond(booking, "declined")} className="btn-outline !border-red-200 !px-5 !py-2.5 !text-red-700 hover:!bg-red-50">
                    Decline & Notify
                  </button>
                  {waGuest && <a href={waGuest} target="_blank" rel="noopener noreferrer" className="btn-gold !px-4 !py-2.5">WhatsApp Guest</a>}
                  {mailGuest && <a href={mailGuest} className="btn-outline !px-4 !py-2.5">Email Guest</a>}
                </div>
              </div>
            </article>
          );})}
        </div>
      </div>
    </div>
  );
}
