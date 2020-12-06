const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const FileUpload = require('../middleware/file-upload')
const router = express.Router();

router.get('/', usersController.getUsers);

router.get("/:uid", usersController.getUserById);

router.post(
  '/signup',
  FileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.patch(
  "/:uid",
  [
    check("name").not().isEmpty(), 
    check("email").not().isEmpty(),
  ],
  usersController.update
);

router.delete("/:uid", usersController.deleteUser);

router.post('/login', usersController.login);

module.exports = router;
