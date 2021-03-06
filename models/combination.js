const mongoose = require("mongoose");

const combinationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  username: String, //this is for purposes of easier spotting in mongoDB Compass app
  mainNums: {
    type: [{ type: Number, min: 1, max: 50 }],
  },
  euroNums: {
    type: [{ type: Number, min: 1, max: 10 }],
  },
  draw: Number,
  isActive: {
    type: Boolean,
    default: true,
  },
  isLast: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    enum: ["comb-1", "comb-2", "comb-3", "comb-4"],
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Combination", combinationSchema);
