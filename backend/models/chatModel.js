//chatname
//isgroupchat
//users
//latestmessage
//groupadmin



const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatname: { type: String, trim: true },
    isgroupchat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;



