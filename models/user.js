const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
    },
    email: {
      type: String,
      trim: true,
      unique: "Email already exists",
      required: "Email is required",
    },
    hashed_password: {
      type: String,
      required: "Password is required",
    },
    salt: String,
    about: {
      type: String,
      trim: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//verify sign-in attempts by matching the user-provided password text with the hashed_password
userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.encryptPassword(plainpassword) === this.hashed_password;
  },

  //to generate an encrypted hash from the plain- text password
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
