const nodemailer = require("nodemailer");

const HOTEL_NAME = process.env.HOTEL_NAME || "Mukwiye Hotel & Suites";
const HOTEL_EMAIL = process.env.HOTEL_NOTIFY_EMAIL || "gasiraboarnauld@gmail.com";
const HOTEL_WHATSAPP = (process.env.HOTEL_NOTIFY_WHATSAPP || "250792318368").replace(/\D/g, "");
const HOTEL_PHONE_DISPLAY = process.env.HOTEL_NOTIFY_PHONE_DISPLAY || "+250792318368";

function hasSmtp() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter;
function getTransporter() {
  if (!hasSmtp()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

function formatDate(d) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return String(d || ""); }
}

function money(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

function ticketConfirmationText(booking) {
  const id = booking.id || booking._id || "";
  const status = booking.status || "pending";
  if (status === "cancelled") {
    return [
      `Reservation Ticket/Booking ID: ${id}`,
      "This reservation has been cancelled. If this is unexpected, please contact us to confirm.",
    ].join("\n");
  }
  if (status === "declined") {
    return [
      `Reservation Ticket/Booking ID: ${id}`,
      "To confirm you received this update, reply with \"RECEIVED " + id + "\" via WhatsApp or email.",
      `Our team is available at WhatsApp ${HOTEL_PHONE_DISPLAY} or ${HOTEL_EMAIL}.`,
    ].join("\n");
  }
  const confirmed = status === "confirmed";
  return [
    `Your reservation ticket (Booking ID): ${id}`,
    "Please save this Booking ID - it is your ticket/reference. Present it at check-in.",
    "",
    "How to confirm you received your ticket:",
    `- Reply to this message with "CONFIRMED ${id}" on WhatsApp or email.`,
    `- Or contact us: WhatsApp ${HOTEL_PHONE_DISPLAY} / ${HOTEL_EMAIL}.`,
    confirmed
      ? "Once you confirm, our team will acknowledge receipt and we will both have your confirmed ticket on record."
      : "Once you reply, our team will confirm receipt and finalize your reservation so we both have your ticket on record.",
    "The hotel has also been notified of this reservation.",
  ].join("\n");
}

function bookingText(booking, extra = "", { includeTicket = true } = {}) {
  const lines = [
    `${HOTEL_NAME} - Reservation update`,
    extra || null,
    "",
    `Booking ID: ${booking.id || booking._id || ""}`,
    `Room: ${booking.roomName || ""}`,
    `Guest: ${booking.guestName || ""}`,
    `Email: ${booking.email || ""}`,
    `Phone: ${booking.phone || "N/A"}`,
    `Check-in: ${formatDate(booking.checkIn)}`,
    `Check-out: ${formatDate(booking.checkOut)}`,
    `Guests: ${booking.guests || 1}`,
    `Nights: ${booking.nights || ""}`,
    `Total: ${money(booking.total)}`,
    `Status: ${(booking.status || "pending").toUpperCase()}`,
    booking.specialRequests ? `Requests: ${booking.specialRequests}` : null,
    booking.managerReply ? `Hotel reply: ${booking.managerReply}` : null,
  ].filter((l) => l !== null);
  if (includeTicket) {
    lines.push("", "---", ticketConfirmationText(booking));
  }
  lines.push("", `Contact: ${HOTEL_EMAIL} | WhatsApp +${HOTEL_WHATSAPP}`);
  return lines.join("\n");
}

function statusLine(status) {
  if (status === "confirmed") return "Good news! Your reservation is confirmed. Your Booking ID below is your ticket - please confirm receipt so we both have it on record.";
  if (status === "declined") return "Update: your reservation request could not be confirmed. Please see details and contact us if needed.";
  if (status === "cancelled") return "Your reservation has been cancelled. Your Booking ID is included for reference.";
  return "We have received your reservation request. Your Booking ID below is your ticket/reference - please confirm you received it so we can finalize and both have it on record.";
}

async function sendEmail(to, subject, text) {
  const tx = getTransporter();
  if (!tx || !to) return { sent: false, reason: "smtp_not_configured_or_no_recipient" };
  const from = process.env.MAIL_FROM || `${HOTEL_NAME} <${process.env.SMTP_USER}>`;
  try {
    await tx.sendMail({ from, to, subject, text });
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { sent: false, reason: err.message };
  }
}

function toE164(phone) {
  if (!phone) return "";
  let d = String(phone).replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "250" + d.slice(1); // local RW format
  if (!d.startsWith("+")) d = "+" + d;
  return d;
}

async function sendWhatsApp(toPhone, text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  const to = toE164(toPhone);
  if (!sid || !token || !from || !to) return { sent: false, reason: "whatsapp_not_configured_or_no_phone" };
  const fromFmt = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
  const toFmt = `whatsapp:${to}`;
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const body = new URLSearchParams({ From: fromFmt, To: toFmt, Body: text });
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!res.ok) {
      const err = await res.text();
      console.error("WhatsApp send failed:", err);
      return { sent: false, reason: err };
    }
    return { sent: true };
  } catch (err) {
    console.error("WhatsApp send failed:", err.message);
    return { sent: false, reason: err.message };
  }
}

async function notifyBookingCreated(booking) {
  const guestMsg = bookingText(booking, statusLine(booking.status));
  const hotelMsg = bookingText(booking, `New reservation request received from ${booking.guestName}. Please confirm and ensure the guest receives their ticket (Booking ID: ${booking.id || booking._id || ""}).`, { includeTicket: true });
  const results = {};
  results.hotelEmail = await sendEmail(HOTEL_EMAIL, `New reservation: ${booking.roomName} - ${booking.guestName} (Ticket ${booking.id || booking._id || ""})`, hotelMsg);
  results.guestEmail = await sendEmail(booking.email, `${HOTEL_NAME}: Reservation received - Ticket ${booking.id || booking._id || ""}`, guestMsg);
  results.hotelWhatsApp = await sendWhatsApp(HOTEL_WHATSAPP, hotelMsg);
  results.guestWhatsApp = await sendWhatsApp(booking.phone, guestMsg);
  console.log("notifyBookingCreated:", { id: String(booking.id || booking._id), results });
  return results;
}

async function notifyBookingUpdated(booking) {
  const guestMsg = bookingText(booking, statusLine(booking.status));
  const hotelMsg = bookingText(booking, `Reservation updated (${booking.status}) for ${booking.guestName}. Guest ticket: ${booking.id || booking._id || ""}.`, { includeTicket: true });
  const results = {};
  results.guestEmail = await sendEmail(booking.email, `${HOTEL_NAME}: Reservation ${booking.status} - Ticket ${booking.id || booking._id || ""}`, guestMsg);
  results.hotelEmail = await sendEmail(HOTEL_EMAIL, `Reservation ${booking.status}: ${booking.roomName} - ${booking.guestName}`, hotelMsg);
  results.guestWhatsApp = await sendWhatsApp(booking.phone, guestMsg);
  results.hotelWhatsApp = await sendWhatsApp(HOTEL_WHATSAPP, hotelMsg);
  console.log("notifyBookingUpdated:", { id: String(booking.id || booking._id), results });
  return results;
}

function waLink(phone, text) {
  const to = toE164(phone).replace(/^\+/, "");
  if (!to) return "";
  return `https://wa.me/${to}?text=${encodeURIComponent(text || "")}`;
}

function notifyLinks(booking) {
  const guestMsg = bookingText(booking, statusLine(booking.status));
  return {
    guestWhatsApp: waLink(booking.phone, guestMsg),
    hotelWhatsApp: waLink(HOTEL_WHATSAPP, `Regarding booking ${booking.id || booking._id}: `),
    guestEmail: booking.email ? `mailto:${booking.email}?subject=${encodeURIComponent(`${HOTEL_NAME}: Reservation ${booking.status || "update"} - Ticket ${booking.id || booking._id || ""}`)}&body=${encodeURIComponent(guestMsg)}` : "",
  };
}

function guestNotification(booking, event = "created") {
  const status = booking.status || "pending";
  const label = event === "created" ? "Reservation received" : `Reservation ${status}`;
  return {
    title: `${HOTEL_NAME}: ${label} - Ticket ${booking.id || booking._id || ""}`,
    message: bookingText(booking, `${label}. ${statusLine(status)}`),
  };
}

function recordGuestNotifications(booking, results = {}, event = "created") {
  const { title, message } = guestNotification(booking, event);
  const createdAt = new Date();
  const entries = [
    { channel: "in-app", title, message, recipient: booking.email, status: "sent", createdAt },
  ];
  const channels = [
    ["guestEmail", "email", booking.email],
    ["guestWhatsApp", "whatsapp", booking.phone],
  ];
  for (const [key, channel, recipient] of channels) {
    const result = results[key];
    if (!result) continue;
    entries.push({
      channel,
      title,
      message,
      recipient: recipient || "",
      status: result.sent ? "sent" : "failed",
      reason: result.reason || "",
      createdAt,
    });
  }
  booking.notifications.push(...entries);
  return entries;
}

module.exports = {
  notifyBookingCreated,
  notifyBookingUpdated,
  notifyLinks,
  recordGuestNotifications,
  toE164,
  bookingText,
  statusLine,
};
