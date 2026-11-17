import { useEffect, useRef, useState } from "react";
import api, { formatMoney, imageUrl } from "../api.js";

const emptyForm = { name: "", type: "Standard", price: "", monthlyPrice: "", capacity: "", size: "", bed: "", description: "", amenities: "" };

export default function Admin() {
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState({ hotelPhotos: [], guestVideos: [], mapEmbedUrl: "" });
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mediaSaving, setMediaSaving] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const fileInput = useRef(null);
  const videoInput = useRef(null);
  const hotelPhotoInput = useRef(null);
  const guestVideoInput = useRef(null);

  function loadRooms() {
    api.get("/rooms").then((res) => setRooms(res.data)).catch(() => setError("Could not load rooms. Is the API running?"));
  }
  function loadSettings() {
    api.get("/settings").then((res) => { setSettings(res.data); setMapUrl(res.data.mapEmbedUrl || ""); }).catch(() => {});
  }
  useEffect(() => { loadRooms(); loadSettings(); }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  function handleFile(e) { const s = e.target.files?.[0] || null; setFile(s); setPreview(s ? URL.createObjectURL(s) : ""); }
  function resetForm() {
    setForm(emptyForm); setFile(null); setPreview(""); setVideoFile(null);
    if (fileInput.current) fileInput.current.value = "";
    if (videoInput.current) videoInput.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (file) data.append("image", file);
      if (videoFile) data.append("video", videoFile);
      await api.post("/rooms", data);
      setMessage("Room added successfully."); resetForm(); loadRooms();
    } catch (err) { setError(err.response?.data?.message || "Could not save the room."); }
    finally { setSaving(false); }
  }

  async function replaceAsset(roomId, selected, key, okMsg, failMsg) {
    if (!selected) return;
    setError(""); setMessage("");
    try { const data = new FormData(); data.append(key, selected); await api.put(`/rooms/${roomId}`, data); setMessage(okMsg); loadRooms(); }
    catch (err) { setError(err.response?.data?.message || failMsg); }
  }
  async function removeVideo(room) {
    if (!window.confirm(`Remove the video for "${room.name}"?`)) return;
    setError(""); setMessage("");
    try { const data = new FormData(); data.append("removeVideo", "true"); await api.put(`/rooms/${room.id}`, data); setMessage("Room video removed."); loadRooms(); }
    catch (err) { setError(err.response?.data?.message || "Could not remove the video."); }
  }
  async function toggleBooked(room) {
    setError(""); setMessage("");
    try { const data = new FormData(); data.append("booked", room.booked ? "false" : "true"); await api.put(`/rooms/${room.id}`, data); setMessage(room.booked ? "Room marked as available." : "Room marked as booked."); loadRooms(); }
    catch (err) { setError(err.response?.data?.message || "Could not update availability."); }
  }
  async function removeRoom(room) {
    if (!window.confirm(`Delete "${room.name}"?`)) return;
    setError(""); setMessage("");
    try { await api.delete(`/rooms/${room.id}`); setMessage("Room deleted."); loadRooms(); }
    catch { setError("Could not delete the room."); }
  }

  async function saveMap(e) {
    e.preventDefault(); setError(""); setMessage(""); setMediaSaving(true);
    try { const data = new FormData(); data.append("mapEmbedUrl", mapUrl); const res = await api.put("/settings", data); setSettings(res.data); setMessage("Map location updated."); }
    catch (err) { setError(err.response?.data?.message || "Could not update map."); }
    finally { setMediaSaving(false); }
  }
  async function addHotelPhoto(e) {
    const selected = e.target.files?.[0]; e.target.value = ""; if (!selected) return;
    setError(""); setMessage(""); setMediaSaving(true);
    try { const data = new FormData(); data.append("target", "hotelPhoto"); data.append("image", selected); data.append("caption", photoCaption); const res = await api.put("/settings", data); setSettings(res.data); setPhotoCaption(""); setMessage("Hotel photo added."); }
    catch (err) { setError(err.response?.data?.message || "Could not add photo."); }
    finally { setMediaSaving(false); }
  }
  async function addGuestVideoFile(e) {
    const selected = e.target.files?.[0]; e.target.value = ""; if (!selected) return;
    setError(""); setMessage(""); setMediaSaving(true);
    try { const data = new FormData(); data.append("target", "guestVideo"); data.append("video", selected); data.append("title", videoTitle); const res = await api.put("/settings", data); setSettings(res.data); setVideoTitle(""); setMessage("Guest video uploaded."); }
    catch (err) { setError(err.response?.data?.message || "Could not upload video."); }
    finally { setMediaSaving(false); }
  }
  async function addGuestEmbed(e) {
    e.preventDefault(); if (!embedUrl.trim()) return;
    setError(""); setMessage(""); setMediaSaving(true);
    try { const data = new FormData(); data.append("target", "guestVideo"); data.append("embedUrl", embedUrl.trim()); data.append("title", videoTitle); const res = await api.put("/settings", data); setSettings(res.data); setEmbedUrl(""); setVideoTitle(""); setMessage("Guest video embed added."); }
    catch (err) { setError(err.response?.data?.message || "Could not add embed."); }
    finally { setMediaSaving(false); }
  }
  async function removeMedia(type, url) {
    if (!window.confirm("Remove this item?")) return;
    setError(""); setMessage("");
    try { const data = new FormData(); data.append(type === "photo" ? "removePhotoUrl" : "removeVideoUrl", url); const res = await api.put("/settings", data); setSettings(res.data); setMessage("Removed."); }
    catch (err) { setError(err.response?.data?.message || "Could not remove item."); }
  }

  return (
    <div>
      <section className="page-hero">
        <div className="section-wrap relative z-10 py-16 sm:py-20">
          <p className="eyebrow text-gold-300">Management</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Manage Property</h1>
          <p className="mt-4 max-w-2xl text-brand-200">Create accommodations, update media, manage guest videos, hotel photos, and location across the property.</p>
        </div>
      </section>

      <div className="section-wrap py-12">
        {message && <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          <form onSubmit={handleSubmit} className="card h-fit p-6 sm:p-7">
            <p className="eyebrow">New Listing</p>
            <h2 className="mt-2 text-3xl font-semibold text-brand-900">Add a room</h2>
            <div className="mt-6 space-y-4">
              <div><label className="label" htmlFor="name">Room name</label><input id="name" required className="field" placeholder="Executive King Room" value={form.name} onChange={update("name")} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label" htmlFor="type">Type</label><select id="type" className="field" value={form.type} onChange={update("type")}>{["Standard","Deluxe","Twin","Suite","Family"].map((i)=><option key={i}>{i}</option>)}</select></div>
                <div><label className="label" htmlFor="price">Price / night (USD)</label><input id="price" type="number" min="0" required className="field" value={form.price} onChange={update("price")} /></div>
              </div>
              <div><label className="label" htmlFor="monthlyPrice">Monthly price (optional)</label><input id="monthlyPrice" type="number" min="0" className="field" placeholder="e.g. 2125" value={form.monthlyPrice} onChange={update("monthlyPrice")} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label" htmlFor="capacity">Capacity</label><input id="capacity" type="number" min="1" required className="field" value={form.capacity} onChange={update("capacity")} /></div>
                <div><label className="label" htmlFor="size">Size</label><input id="size" className="field" placeholder="45 m2" value={form.size} onChange={update("size")} /></div>
              </div>
              <div><label className="label" htmlFor="bed">Bed</label><input id="bed" className="field" placeholder="1 King bed" value={form.bed} onChange={update("bed")} /></div>
              <div><label className="label" htmlFor="description">Description</label><textarea id="description" rows="3" className="field resize-none" value={form.description} onChange={update("description")} /></div>
              <div><label className="label" htmlFor="amenities">Amenities (comma separated)</label><input id="amenities" className="field" placeholder="Wi-Fi, TV, Mini bar, Safe" value={form.amenities} onChange={update("amenities")} /></div>
              <div>
                <label className="label" htmlFor="image">Photo</label>
                <input ref={fileInput} id="image" type="file" accept="image/*" className="field file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white" onChange={handleFile} />
                {preview && <img src={preview} alt="Preview" className="mt-3 h-40 w-full rounded-xl object-cover" />}
              </div>
              <div>
                <label className="label" htmlFor="video">Room video (optional)</label>
                <input ref={videoInput} id="video" type="file" accept="video/*" className="field file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white" onChange={(e)=>setVideoFile(e.target.files?.[0]||null)} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary mt-6 w-full">{saving ? "Saving..." : "Add Room"}</button>
          </form>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div><p className="eyebrow">Inventory</p><h2 className="mt-1 text-3xl font-semibold text-brand-900">Existing rooms</h2></div>
              <p className="text-sm text-brand-500">{rooms.length} total</p>
            </div>
            <div className="space-y-4">
              {rooms.map((room) => (
                <article key={room.id} className="card overflow-hidden">
                  <div className="grid sm:grid-cols-[180px_1fr]">
                    <img src={imageUrl(room.image)} alt={room.name} className="h-44 w-full object-cover sm:h-full" />
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">{room.type}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${room.booked ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}>{room.booked ? "Booked" : "Available"}</span>
                          </div>
                          <h3 className="mt-2 text-xl font-semibold text-brand-900">{room.name}</h3>
                          <p className="text-sm text-brand-500">{formatMoney(room.price)} / night &middot; {room.capacity} guests{room.monthlyPrice > 0 ? ` \u00b7 ${formatMoney(room.monthlyPrice)} / mo` : ""}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <label className="btn-outline !px-3 !py-2 text-[10px] cursor-pointer">Replace Photo<input type="file" accept="image/*" className="hidden" onChange={(e)=>{const s=e.target.files?.[0]; e.target.value=""; replaceAsset(room.id,s,"image","Room photo updated.","Could not update the photo.");}} /></label>
                        <label className="btn-outline !px-3 !py-2 text-[10px] cursor-pointer">Replace Video<input type="file" accept="video/*" className="hidden" onChange={(e)=>{const s=e.target.files?.[0]; e.target.value=""; replaceAsset(room.id,s,"video","Room video updated.","Could not update the video.");}} /></label>
                        <button type="button" onClick={() => toggleBooked(room)} className="btn-outline !px-3 !py-2 text-[10px]">{room.booked ? "Mark Available" : "Mark Booked"}</button>
                        {room.video && <button type="button" onClick={() => removeVideo(room)} className="btn-outline !px-3 !py-2 text-[10px]">Remove Video</button>}
                        <button type="button" onClick={() => removeRoom(room)} className="btn-outline !border-red-200 !px-3 !py-2 text-[10px] !text-red-700 hover:!bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {rooms.length === 0 && <div className="card p-8 text-center text-brand-500">No rooms yet. Add your first room using the form.</div>}
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-brand-200 pt-14">
          <p className="eyebrow">Guest Experience</p>
          <h2 className="mt-2 text-3xl font-semibold text-brand-900">Hotel media &amp; location</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-600">Add hotel photos and guest videos to showcase on the website, and set the Google Map location shown in the footer.</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <form onSubmit={saveMap} className="card p-6">
              <h3 className="text-xl font-semibold text-brand-900">Google Map location</h3>
              <p className="mt-1 text-sm text-brand-500">Paste a Google Maps embed URL (iframe src) so guests can view your location in the footer.</p>
              <label className="label mt-4" htmlFor="mapEmbedUrl">Embed URL</label>
              <input id="mapEmbedUrl" className="field" placeholder="https://www.google.com/maps?q=...&output=embed" value={mapUrl} onChange={(e)=>setMapUrl(e.target.value)} />
              <button type="submit" disabled={mediaSaving} className="btn-primary mt-4 w-full">{mediaSaving ? "Saving..." : "Save Map"}</button>
              {settings.mapEmbedUrl && <p className="mt-3 text-xs text-green-700">Map location is set.</p>}
            </form>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-brand-900">Hotel photos</h3>
              <p className="mt-1 text-sm text-brand-500">Upload photos of your hotel to display in the gallery on the homepage.</p>
              <label className="label mt-4" htmlFor="photoCaption">Caption (optional)</label>
              <input id="photoCaption" className="field" placeholder="e.g. Lobby, Pool area" value={photoCaption} onChange={(e)=>setPhotoCaption(e.target.value)} />
              <label className="btn-outline mt-3 w-full cursor-pointer">
                {mediaSaving ? "Uploading..." : "Upload hotel photo"}
                <input ref={hotelPhotoInput} type="file" accept="image/*" className="hidden" disabled={mediaSaving} onChange={addHotelPhoto} />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(settings.hotelPhotos || []).map((p, i) => (
                  <div key={`${p.url}-${i}`} className="relative overflow-hidden rounded-lg">
                    <img src={imageUrl(p.url)} alt={p.caption || "Hotel"} className="h-24 w-full object-cover" />
                    <button type="button" onClick={()=>removeMedia("photo", p.url)} className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Remove</button>
                    {p.caption && <p className="truncate px-1 py-1 text-[11px] text-brand-600">{p.caption}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-brand-900">Guest videos</h3>
              <p className="mt-1 text-sm text-brand-500">Upload a video file or embed a YouTube/Vimeo link to share guest moments.</p>
              <label className="label mt-4" htmlFor="videoTitle">Title (optional)</label>
              <input id="videoTitle" className="field" placeholder="e.g. Guest experience" value={videoTitle} onChange={(e)=>setVideoTitle(e.target.value)} />
              <label className="btn-outline mt-3 w-full cursor-pointer">
                {mediaSaving ? "Uploading..." : "Upload guest video"}
                <input ref={guestVideoInput} type="file" accept="video/*" className="hidden" disabled={mediaSaving} onChange={addGuestVideoFile} />
              </label>
              <form onSubmit={addGuestEmbed} className="mt-4 border-t border-brand-100 pt-4">
                <label className="label" htmlFor="embedUrl">Or embed URL</label>
                <input id="embedUrl" className="field" placeholder="https://www.youtube.com/embed/..." value={embedUrl} onChange={(e)=>setEmbedUrl(e.target.value)} />
                <button type="submit" disabled={mediaSaving} className="btn-outline mt-2 w-full">Add embed</button>
              </form>
              <div className="mt-4 space-y-2">
                {(settings.guestVideos || []).map((v, i) => (
                  <div key={`${v.url}-${i}`} className="flex items-center justify-between rounded-lg border border-brand-100 px-3 py-2">
                    <p className="truncate text-sm text-brand-700">{v.title || v.url}</p>
                    <button type="button" onClick={()=>removeMedia("video", v.url)} className="ml-2 text-xs font-semibold text-red-700">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
