const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Product = require("../models/Products");
const User = require("../models/Users");
const dayjs = require("dayjs");

const getProducts = async (req, res, next) => {
  let product;
  try {
    product = await Product.find({});
  } catch (error) {
    const err = new HttpError("Fetching products faild!", 500);
    return next(err);
  }

  res.json({ product: product.map((u) => u.toObject({ getters: true })) });
};

const getProductsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithProducts;
  try {
    userWithProducts = await User.findById(userId).populate("products");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithProducts || userWithProducts.products.length === 0) {
    return next(
      new HttpError("Could not find products for the provided user id.", 404)
    );
  }

  res.json({
    products: userWithProducts.products.map((product) =>
      product.toObject({ getters: true })
    ),
  });
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError(
      "Could not find place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ product: product.toObject({ getters: true }) });
};

const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    title,
    description,
    street,
    city,
    creator,
    price,
    area,
    district,
    productType,
    currentcy,
  } = req.body;
  const createdProduct = new Product({
    title,
    description,
    address: { street, city, district },
    price,
    currentcy,
    image: req.file.path,
    creator,
    area,
    productType,
    date: dayjs(),
    endDate: dayjs().add("30", "day"),
    selledDate: null,
    seller: null,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Creating faild, Try again", 500);
    return next(err);
  }

  if (!user) {
    const err = new HttpError("Could not find user", 500);
    return next(err);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdProduct.save({ session: sess });
    user.products.push(createdProduct);
    await user.save({ sess: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Errorsss", 500);
    return next(error);
  }

  res.status(201).json({ product: createdProduct });
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const {
    title,
    description,
    price,
    area,
    status,
    productType,
    currentcy,
  } = req.body;
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("Something went wrong!!", 500);
    return next(err);
  }

  product.title = title;
  product.description = description;
  product.price = price;
  product.currentcy = currentcy;
  product.area = area;
  product.status = status;
  product.productType = productType;

  try {
    await product.save();
  } catch (error) {
    const err = new HttpError("u could not update", 500);
    return next(err);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const submit = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { status } = req.body;
  const productId = req.params.pid;
  const userId = req.params.uid;

  let product;
  try {
    product = await Product.findById(productId);
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Something went wrong!!", 500);
    return next(err);
  }
  product.status = status;
  product.submition = user.name;

  try {
    await product.save();
  } catch (error) {
    const err = new HttpError("u could not update", 500);
    return next(err);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const sell = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { status } = req.body;
  const productId = req.params.pid;
  const userId = req.params.uid;

  let product;
  try {
    product = await Product.findById(productId);
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Something went wrong!!", 500);
    return next(err);
  }
  product.status = status;
  product.seller = user.name;
  product.selledDate = dayjs();

  // try {
  //   await product.save();
  // } catch (error) {
  //   const err = new HttpError('u could not update', 500);
  //   return next(err)
  // }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await product.save({ session: sess });
    user.sells.push(product);
    await user.save({ sess: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Errorsss", 500);
    return next(error);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId).populate("creator");
  } catch (error) {
    const err = new HttpError("cant delete", 500);
    return next(err);
  }

  if (!product) {
    const err = new HttpError("could not find place for this id", 404);
    return next(err);
  }

  const imagePath = product.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await product.remove({ session: sess });
    product.creator.products.pull(product);
    await product.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError("Something went wrong! pls try later", 500);
    return next(err);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(500).json({ msg: "Deleted" });
};

const like = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const productId = req.params.pid;
  const userId = req.params.uid;

  let product;
  let user;
  let product1;
  try {
    product = await Product.findById(productId);
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Something went wrong!!", 500);
    return next(err);
  }

  // product.likes = user;

  // try {
  //   await product.save();
  // } catch (error) {
  //   const err = new HttpError('u could not update', 500);
  //   return next(err)
  // }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    product.likes.push(user);
    await product.save({ sess: sess });
    user.liked.push(productId);
    await user.save({ sess: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Errorsss", 500);
    return next(error);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const removeLike = async (req, res, next) => {
  const productId = req.params.pid;
  const userId = req.params.uid;
  
  let product;
  let user;

  try {
    product = await Product.findById(productId).populate("likes");
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("cant delete", 500);
    return next(err);
  }

  if (!product) {
    const err = new HttpError("could not find place for this id", 404);
    return next(err);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    product.likes.pull(user);
    await product.save({ session: sess });
    user.liked.pull(product);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error)
    const err = new HttpError("Something went wrong! pls try later", 500);
    return next(err);
  }
  res.status(500).json({ msg: "Deleted" });
};

const views = async (req, res, next) => {
  let product;
  const productId = req.params.pid;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("Faild", 500);
    return next(err);
  }

  product.views += 1;
  try {
    await product.save();
  } catch (error) {
    const err = new HttpError("u could not update", 500);
    return next(err);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

exports.getProductById = getProductById;
exports.getProductsByUserId = getProductsByUserId;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProducts = getProducts;
exports.submit = submit;
exports.sell = sell;
exports.like = like;
exports.removeLike = removeLike;
exports.views= views;
