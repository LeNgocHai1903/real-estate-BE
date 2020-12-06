const express = require("express");
const searchController = require('../controllers/search-controllers');


const router = express.Router();

router.get("/:pdistrict/:pcity/:ptype",searchController.Search);


module.exports = router;