import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import RoomCard from "../components/RoomCard.jsx";

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .catch(() => setError("Could not load rooms. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => ["All", ...new Set(rooms.map((r) => r.type))], [rooms]);
  const filtered = rooms.filter((room) => {
    const matchesType = type === "All" || room.type === type;
    const matchesPrice = !maxPrice || room.price <= Number(maxPrice);
    return matchesType && matchesPrice;
  });

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Accommodations</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">Rooms &amp; Suites</h1>
          <p className="mt-4 max-w-2xl text-brand-200">
            Refined spaces designed for rest and productivity, with thoughtful amenities and warm, attentive service.
          </p>
          {(checkIn || checkOut || guests) && (
            <p className="mt-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-brand-100">
              {checkIn && `From ${checkIn}`} {checkOut && `to ${checkOut}`} {guests && `Â· ${guests} guest${guests === "1" ? "" : "s"}`}
            </p>
          )}
        </div>
      </section>

      <div className="section-wrap py-12">
        <div className="card flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {types.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  type === item
                    ? "bg-brand-900 text-white"
                    : "border border-brand-200 bg-white text-brand-600 hover:border-gold-500 hover:text-brand-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <label htmlFor="price" className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
              Max nightly rate
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="10"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {loading && <p className="mt-10 text-brand-500">Loading roomsâ€¦</p>}
        {error && <div className="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!loading && !error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="mt-10 text-brand-500">No rooms match your selection. Please adjust your filters.</p>
        )}
      </div>
    </div>
  );
}


