const express = require("express");
const Like = require("../models/Likes");
const router = express.Router();
/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", {
//     title: "Hello Express",
//   });
// });
router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  console.log(id);
  const objectlike = await Like.findById(id);
  console.log(objectlike);
  res.json(objectlike);
});

router.post("/:id", async function (req, res, next) {
  const id = req.params.id;
  console.log(id);
  const objectlike = await Like.findById(id);
  console.log(objectlike);
  if (objectlike) {
    Object.assign(objectlike, { like: objectlike.like + 1 });
    objectlike.save();
    res.json(200);
  }
});

module.exports = router;
