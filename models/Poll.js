const mongoose = require("mongoose")

const pollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  votes: [Number],
  voters: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Poll", pollSchema)

