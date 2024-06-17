const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.category_list = asyncHandler(async (req, res, next) => {
  const [allCategories, numCategories] = await Promise.all([
    Category.find().exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
    category_count: numCategories,
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

exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

exports.category_create_post = [
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (categoryExists) {
        res.render("category_form", {
          title: "Create Category",
          category: category,
          errors: [{ msg: "Category with this name already exists." }],
        });
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategories] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    res.redirect("/inventory/category");
    return;
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsInCategories,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategories] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (allItemsInCategories.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_items: allItemsInCategories,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/inventory/category");
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error("Category not found!");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

exports.category_update_post = [
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
    } else {
      const categoryExists = await Category.findOne({
        name: req.body.name,
        _id: { $ne: req.params.id },
      })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (categoryExists) {
        res.render("category_form", {
          title: "Update Category",
          category: category,
          errors: [{ msg: "Category with this name already exists." }],
        });
      } else {
        await Category.findByIdAndUpdate(req.params.id, category, {});
        res.redirect(category.url);
      }
    }
  }),
];
