const express = require("express");
const { check } = require("express-validator");

const productsControllers = require("../controllers/products-controllers");
const fileUpload = require('../middleware/file-upload');


const router = express.Router();

router.get("/", productsControllers.getProducts);

router.get("/:pid", productsControllers.getProductById);

router.get("/user/:uid", productsControllers.getProductsByUserId);

router.patch("/like/:pid/:uid", productsControllers.like);


router.patch("/view/:pid",productsControllers.views);

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("street").not().isEmpty(),
    check("city").not().isEmpty(),
    check("price").not().isEmpty(),
  ],
  productsControllers.createProduct
);

router.patch(
  "/:pid",
  productsControllers.updateProduct
);

router.patch(
  "/submit/:pid/:uid",
  productsControllers.submit
);

router.patch(
  "/sell/:pid/:uid",
  productsControllers.sell
);


router.delete("/:pid", productsControllers.deleteProduct);
router.delete("/removelike/:pid/:uid", productsControllers.removeLike);
module.exports = router;
