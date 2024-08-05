const pool = require("../db/db");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.category_list = asyncHandler(async (req, res, next) => {
  const { rows: allCategories } = await pool.query(
    "SELECT *, 'category/' || id as url FROM categories ORDER BY name ASC"
  );
  const { rows: numCategories } = await pool.query(
    "SELECT COUNT(*) FROM categories"
  );

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
    category_count: numCategories[0].count,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const { rows: category } = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [req.params.id]
  );
  const { rows: itemsInCategory } = await pool.query(
    `SELECT * FROM items 
     JOIN item_categories ON items.id = item_categories.item_id 
     WHERE item_categories.category_id = $1`,
    [req.params.id]
  );

  if (category.length === 0) {
    const err = new Error("Category not found!");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category: " + category[0].name,
    category: category[0],
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

    const category = {
      name: req.body.name,
      description: req.body.description,
    };

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const { rows: categoryExists } = await pool.query(
        "SELECT * FROM categories WHERE name = $1",
        [req.body.name]
      );
      if (categoryExists.length > 0) {
        res.render("category_form", {
          title: "Create Category",
          category: category,
          errors: [{ msg: "Category with this name already exists." }],
        });
      } else {
        const result = await pool.query(
          "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
          [category.name, category.description]
        );
        const categoryId = result.rows[0].id;
        res.redirect(`/inventory/category/${categoryId}`);
      }
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const { rows: category } = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [req.params.id]
  );

  const { rows: itemsInCategory } = await pool.query(
    `SELECT items.* FROM items 
     JOIN item_categories ON items.id = item_categories.item_id 
     WHERE item_categories.category_id = $1`,
    [req.params.id]
  );

  if (category.length === 0) {
    res.redirect("/inventory/category");
    return;
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category[0],
    category_items: itemsInCategory,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const { rows: category } = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [req.params.id]
  );

  const { rows: itemsInCategory } = await pool.query(
    `SELECT items.* FROM items 
     JOIN item_categories ON items.id = item_categories.item_id 
     WHERE item_categories.category_id = $1`,
    [req.params.id]
  );

  if (itemsInCategory.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category[0],
      category_items: itemsInCategory,
    });
    return;
  } else {
    await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
    res.redirect("/inventory/category");
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const { rows: category } = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [req.params.id]
  );

  if (category === null) {
    const err = new Error("Category not found!");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category[0],
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

    const category = {
      name: req.body.name,
      description: req.body.description,
      id: req.params.id,
    };

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
    } else {
      const { rows: categoryExists } = await pool.query(
        "SELECT * FROM categories WHERE name = $1 AND id != $2",
        [req.body.name, req.params.id]
      );

      if (categoryExists.length > 0) {
        res.render("category_form", {
          title: "Update Category",
          category: category,
          errors: [{ msg: "Category with this name already exists." }],
        });
      } else {
        await pool.query(
          "UPDATE categories SET name = $1, description = $2 WHERE id = $3",
          [category.name, category.description, req.params.id]
        );
        res.redirect(`/inventory/category/${req.params.id}`);
      }
    }
  }),
];
