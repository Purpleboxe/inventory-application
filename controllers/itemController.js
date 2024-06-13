const Item = require("../models/item");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Home",
    item_count: numItems,
    category_count: numCategories,
  });
});

exports.item_list = asyncHandler(async (req, res, next) => {
  const [allItems, numItems] = await Promise.all([
    Item.find({}, "name description")
      .sort({ title: 1 })
      .populate("category")
      .exec(),
    Item.countDocuments({}).exec(),
  ]);

  res.render("item_list", {
    title: "Item List",
    item_list: allItems,
    item_count: numItems,
  });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    const err = new Error("Item not found!");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item: " + item.name,
    item: item,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  res.render("item_form", { title: "Create Item" });
});
