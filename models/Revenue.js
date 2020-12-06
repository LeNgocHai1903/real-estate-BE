const mongoose = require("mongoose");

const RevenueSchema = mongoose.Schema({
  total: {
    type: Number,
  },

  currentcy: {
      type: String, 
      default: 'tỉ'    
  },
  Date: {
    type: Date
  }
});
module.exports = mongoose.model("Revenue", RevenueSchema);
