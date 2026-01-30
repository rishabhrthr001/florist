import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  date: {
    type: String, // MMDDYY
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("OrderCounter", orderCounterSchema);
