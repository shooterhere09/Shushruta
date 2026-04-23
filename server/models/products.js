const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: true,
    },
    pTimeWindowHours: {
      type: Number,
      required: true,
    },
    pDescription: {
      type: String,
      required: true,
    },
    pPrice: {
      type: Number,
      default: 0,
    },

    pSold: {
      type: Number,
      default: 0,
    },
    pQuantity: {
      type: Number,
      default: 0,
    },
    pCategory: {
      type: ObjectId,
      ref: "categories",
    },
    pImages: {
      type: Array,
      required: true,
    },
    pOffer: {
      type: String,
      default: null,
    },
    pRatingsReviews: [
      {
        review: String,
        user: { type: ObjectId, ref: "users" },
        rating: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    pStatus: {
      type: String,
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    hname: {
      type: String,
      required: true,
    },
    hemail: {
      type: String,
      required: true,
    },
    hphone: {
      type: String,
      required: true,
    },
    hospitalAddress: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    pMedicalReport: {
      type: String,
    },
    expiryAt: {
      type: Date,
      required: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const productModel = mongoose.model("products", productSchema);
module.exports = productModel;
