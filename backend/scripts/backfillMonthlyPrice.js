require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("../models/Room");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mukwiye_hotel";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const result = await Room.collection.updateMany(
    { $or: [{ monthlyPrice: { $exists: false } }, { monthlyPrice: 0 }] },
    [{ $set: { monthlyPrice: { $round: [{ $multiply: ["$price", 25] }, 0] } } }]
  );
  console.log(`Updated ${result.modifiedCount} rooms with a monthly price`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
