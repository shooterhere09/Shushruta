const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: Number,
      required: true,
    },
    userType: {
      type: String, // "patient" or "hospital"
      enum: ["patient", "hospital", "superadmin"],
      default: "patient",
    },
    hospitalId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to not violate the unique constraint
    },
    hospitalInfo: {
      name: { type: String },
      hospitalAddress: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postcode: { type: String },
      country: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    phoneNumber: {
      type: Number,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postcode: { type: String },
      country: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    userImage: {
      type: String,
      default: "user.png",
    },
    verified: {
      type: String,
      default: false,
    },
    secretKey: {
      type: String,
      default: null,
    },
    history: {
      type: Array,
      default: [],
    },
    aadharCardUploaded: {
      type: Boolean,
      default: false,
    },
    medicalReportUploaded: {
      type: Boolean,
      default: false,
    },
    medicalReportContent: {
      type: String,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
