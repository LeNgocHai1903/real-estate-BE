const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlaceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    district: { type: String, require: true },
    city: { type: String, require: true },
  },
  price: { type: Number, require: true },
  currentcy: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  submition: { type: String, default: "none" },
  image: { type: String },
  area: { type: Number, required: true },
  date: { type: Date },
  endDate: { type: Date },
  status: { type: Number, default: 0 },
  productType: { type: String, required: true },
  selledDate: { type: Date, default: null },
  seller : {type: String , default: null},
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  views: {type:Number, default:0},
});

module.exports = mongoose.model("Product", PlaceSchema);
