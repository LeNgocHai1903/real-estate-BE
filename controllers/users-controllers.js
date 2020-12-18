const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/Users');
const mongoose = require('mongoose')
const fs = require('fs')

const getUsers =  async (req, res, next) => {

  let user;
  try {
    user = await User.find({}, '-password')
  } catch (error) {
    const err = new HttpError('Tải dữ liệu thành viên thất bại',500);
    return next(err);
  }

  res.json({ user: user.map(u => u.toObject({getters:true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return next(
      new HttpError('Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại', 422)
    ) ;
  }
  const { name, email, password } = req.body;

  let existingUser; 
try {
   existingUser = await User.findOne({email: email})
} catch (error) {
  const err = new HttpError('Đăng kí thất bại',500);
  return next(err);
}
  
if(existingUser){
  const err = new HttpError('Thành viên này đã tồn tại. Vui lòng đăng nhập',422);
  return next(err);
}

  const createdUser = new User({
    name,
    email,
    password,
    image:  req.file.path,
    places: [],
  })

  try {
    await createdUser.save();
  } catch (error) {
    const err= new HttpError('Đăng kí thất bại. Vui lòng thử lại', 500);
    return next(err);
  }

  res.status(201).json({user: createdUser.toObject({getters:true})});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser; 
  try {
    existingUser = await User.findOne({email: email})
  } catch (error) {
    const err = new HttpError('Đăng nhập thất bại',500);
    return next(err);
  }

  if(!existingUser || existingUser.password !== password)
  {
      const err = new HttpError('Đăng nhập thất bại. Vui lòng thử lại sau', 500);
      return next(err);
  }

  res.json({message: 'Đã đăng nhập', user: existingUser.toObject({getters:true})});
};


const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return next(
      new HttpError('Lỗi', 422)
    ) ;
  }
  const { name, email, password, role } = req.body;
  const userId = req.params.uid;

  let update;
try {
   update = await User.findById(userId);
} catch (error) {
  const err = new HttpError('Lỗi',500);
  return next(err);
}

update.name = name;
update.email = email;
update.password = password;
update.role = role;

  try {
    await update.save();
  } catch (error) {
    const err= new HttpError('Cập nhật thành viên không thành công, Vui lòng thử lại', 500);
    return next(err);
  }

  res.status(201).json({user: update.toObject({getters:true})});
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Lỗi. Không thể tìm thấy thành viên này',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Lỗi. Không thể tìm kiếm thành viên này',
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId).populate('products');
    console.log(user)
  } catch (error) {
    const err= new HttpError('Bạn không thể xoá thành viên này', 500);
    return next(err);
  }

  if(!user) {
    const err= new HttpError('Không kiếm thấy thành viên này', 404);
    return next(err);
  }
  const imagePath = user.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await user.remove({session: sess})
    await  sess.commitTransaction()

  } catch (error) {
    const err = new HttpError('Lỗi', 500);
    return next(err);
  }

  fs.unlink(imagePath, err => {
    console.log(err)
  });
  res.status(500).json({msg:'Đã xoá'})
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.update = update;
exports.getUserById= getUserById;
exports.deleteUser = deleteUser;
