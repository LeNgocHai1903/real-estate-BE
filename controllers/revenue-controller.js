const mongoose = require('mongoose')
const Revenue = require('../models/Revenue')
const HttpError = require("../models/http-error");
const { validationResult } = require('express-validator');
const { findById } = require('../models/Revenue');

const getTotal =  async (req, res, next) => {

    let total;
    try {
      total = await Revenue.find({})
    } catch (error) {yield
      const err = new HttpError('Tải dữ liệu sản phẩm thất bại',500);
      return next(err);
    }
  
    res.json({ total: total.map(u => u.toObject({getters:true}))});
  };

  const updateTotal = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại', 422);
    }
    const value = req.params.pvl;
  
    let product;
    let oldValue;
    try {
      product = await Revenue.findById("5fba3f0c15cdbf0ac873e5e9");
    } catch (error) {
        console.log(error)
      const err = new HttpError('Lỗi!',500);
      return next(err);
    }
  
    product.total =  value;
    product.Date = new Date();

    try {
      await product.save();
    } catch (error) {
      const err = new HttpError('Bạn không thể cập nhật sản phẩm này', 500);
      return next(err)
    }
  
    res.status(200).json({product: product.toObject({getters:true})})
  };


exports.getTotal = getTotal;  
exports.updateTotal = updateTotal;