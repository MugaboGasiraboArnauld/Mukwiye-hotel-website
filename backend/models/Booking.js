const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomName: { type: String, required: true },
    roomImage: { type: String, default: "" },
    guestName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1, min: 1 },
    specialRequests: { type: String, default: "" },
    nights: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined", "cancelled"],
      default: "pending",
    },
    managerReply: { type: String, default: "" },
    respondedAt: { type: Date, default: null },
    notifications: [
      {
        channel: {
          type: String,
          enum: ["in-app", "email", "whatsapp"],
          required: true,
        },
        title: { type: String, default: "" },
        message: { type: String, required: true },
        recipient: { type: String, default: "" },
        status: {
          type: String,
          enum: ["sent", "failed"],
          default: "sent",
        },
        reason: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.roomId = ret.room.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.room;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
