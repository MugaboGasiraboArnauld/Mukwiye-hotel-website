export const HOTEL_PHONE = "+250792318368";
export const HOTEL_PHONE_DISPLAY = "0792318368";
export const WHATSAPP_NUMBER = "250792318368";
export const HOTEL_EMAIL = "gasiraboarnauld@gmail.com";
export const HOTEL_NAME = "Mukwiye Hotel & Suites";
export const HOTEL_ADDRESS = "Kigali, Rwanda";

export function whatsappLink(message = "") {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject = "", body = "") {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${HOTEL_EMAIL}${qs ? `?${qs}` : ""}`;
}

export function ticketConfirmationText(bookingId) {
  if (!bookingId) {
    return [
      "Your reservation ticket: you will receive a Booking ID once your request is submitted - please save it as your ticket/reference.",
      `To confirm you received your ticket, reply "CONFIRMED <Booking ID>" on WhatsApp or email, or contact us at ${HOTEL_PHONE_DISPLAY} / ${HOTEL_EMAIL}.`,
      "Our team will acknowledge receipt so we both have your reservation on record.",
    ].join("\n");
  }
  return [
    `Your reservation ticket (Booking ID): ${bookingId}`,
    "Please save this Booking ID - present it at check-in as your ticket/reference.",
    "",
    "How to confirm you received your ticket:",
    `- Reply with "CONFIRMED ${bookingId}" on WhatsApp or email.`,
    `- Or contact us: WhatsApp ${HOTEL_PHONE_DISPLAY} / ${HOTEL_EMAIL}.`,
    "Once you confirm, our team will acknowledge receipt and we will both have your ticket on record.",
    "The hotel has been notified of this reservation.",
  ].join("\n");
}

export function reservationMessage({ roomName, checkIn, checkOut, guests, guestName, phone, total, specialRequests, bookingId, status }) {
  const lines = [
    `Hello ${HOTEL_NAME}, reservation details:`,
    bookingId ? `Booking/Ticket ID: ${bookingId}` : null,
    status ? `Status: ${String(status).toUpperCase()}` : null,
    roomName ? `Room: ${roomName}` : null,
    guestName ? `Guest: ${guestName}` : null,
    checkIn && checkOut ? `Dates: ${checkIn} to ${checkOut}` : null,
    guests ? `Guests: ${guests}` : null,
    total ? `Estimated total: ${total}` : null,
    phone ? `Phone: ${phone}` : null,
    specialRequests ? `Requests: ${specialRequests}` : null,
    "",
    ticketConfirmationText(bookingId),
  ].filter((l) => l !== null);
  return lines.join("\n");
}
