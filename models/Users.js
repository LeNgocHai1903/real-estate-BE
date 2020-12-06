const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, minlength: 5 },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  role: {
    type: Number,
    default: 0,
  },
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  sells:[{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  liked : [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }]
});

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", UserSchema);
