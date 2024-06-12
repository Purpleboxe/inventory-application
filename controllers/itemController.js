const Item = require("../models/item");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");

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
  const allItems = await Item.find({}, "name description")
    .sort({ title: 1 })
    .populate("category")
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
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
