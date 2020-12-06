const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({
  like: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Like", LikeSchema);
