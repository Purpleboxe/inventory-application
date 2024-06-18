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
      .sort({ name: 1 })
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
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", { title: "Create Item", categories: allCategories });
});

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),
  body("price", "Price must not be empty").trim().escape(),
  body("numberInStock", "Number in stock must not be empty").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      for (const category of allCategories) {
        if (item.category.indexOf(category._id) > -1) {
          category.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    res.redirect("/inventory/item");
    return;
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/inventory/item");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    const err = new Error("Item not found!");
    err.status = 404;
    return next(err);
  }

  allCategories.forEach((category) => {
    if (item.category.includes(category._id)) {
      category.checked = "true";
    }
  });

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: allCategories,
  });
});

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),
  body("price", "Price must not be empty").trim().escape(),
  body("numberInStock", "Number in stock must not be empty").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = {
      name: req.body.name,
      description: req.body.description,
      category:
        typeof req.body.category === "undefined" ? [] : req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      _id: req.params.id,
    };

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      for (const category of allCategories) {
        if (item.category.indexOf(category._id) > -1) {
          category.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Update Item",
        item: item,
        categories: allCategories,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});

      res.redirect(updatedItem.url);
    }
  }),
];
