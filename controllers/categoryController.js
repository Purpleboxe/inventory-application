const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    const err = new Error("Category not found!");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category: " + category.name,
    category: category,
    category_items: itemsInCategory,
  });
});
