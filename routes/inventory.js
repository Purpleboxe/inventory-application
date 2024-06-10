const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");

router.get("/", item_controller.index);

// Category Routes

router.get("/category", category_controller.category_list);

module.exports = router;
