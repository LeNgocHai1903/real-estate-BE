const express = require("express");
const revenueController = require('../controllers/revenue-controller')
const router = express.Router();

router.get("/",revenueController.getTotal);
router.patch("/:pvl", revenueController.updateTotal);

module.exports = router;