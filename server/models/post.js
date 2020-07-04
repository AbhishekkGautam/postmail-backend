const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: "Text is required",
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    postedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
