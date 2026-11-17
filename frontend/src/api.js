import axios from "axios";

export const API_ORIGIN =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

export function imageUrl(path) {
  if (!path) {
    return "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80";
  }
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function nights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export default api;
