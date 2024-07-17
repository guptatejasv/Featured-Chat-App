const mongoose = require("mongoose");
const User = require("./userModel");
const Schema = mongoose.Schema;
const chatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
