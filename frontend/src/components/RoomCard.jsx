import { Link } from "react-router-dom";
import { formatMoney, imageUrl } from "../api.js";

export default function RoomCard({ room }) {
  return (
    <article className="card group overflow-hidden transition duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl(room.image)}
          alt={room.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          {room.type}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            room.booked ? "bg-red-700 text-white" : "bg-gold-500 text-brand-900"
          }`}
        >
          {room.booked ? "Booked" : "Available"}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight text-brand-900">
              {room.name}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-brand-500">
              {room.bed} Â· Up to {room.capacity} guests{room.size ? ` Â· ${room.size}` : ""}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-display text-2xl font-semibold text-brand-900">
              {formatMoney(room.price)}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-brand-400">
              per night
            </span>
          </p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-brand-600">
          {room.description}
        </p>
        {room.monthlyPrice > 0 && (
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-gold-700">
            Extended stay: {formatMoney(room.monthlyPrice)} / month
          </p>
        )}
        <Link to={`/rooms/${room.id}`} className="btn-outline mt-5 w-full">
          View Details &amp; Reserve
        </Link>
      </div>
    </article>
  );
}


