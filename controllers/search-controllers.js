
const Product = require("../models/Products");
const HttpError = require("../models/http-error");


const Search = async (req, res, next) => {
  const pdistrict = req.params.pdistrict;
  const pcity = req.params.pcity;
  const ptype = req.params.ptype;
  let product;
  let m;
  try {
    product = await Product.find({});
    if(ptype == 1){
    m = product.filter(
      (p) => p.address.district === pdistrict && p.address.city === pcity 
    );
    }
    else {
      m = product.filter(
        (p) => p.address.district === pdistrict && p.address.city === pcity && p.productType === ptype
      )}
  } catch (error) {
    const err = new HttpError("Tải dữ liệu sản phẩm thất bại", 500);
    return next(err);
  }

  res.json({ product: m.map((u) => u.toObject({ getters: true })) });
};


exports.Search = Search;
