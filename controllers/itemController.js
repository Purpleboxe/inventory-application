const pool = require("../db/db");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const { rows: numItems } = await pool.query("SELECT COUNT(*) FROM items");
  const { rows: numCategories } = await pool.query(
    "SELECT COUNT(*) FROM categories"
  );

  res.render("index", {
    title: "Home",
    item_count: numItems[0].count,
    category_count: numCategories[0].count,
  });
});

exports.item_list = asyncHandler(async (req, res, next) => {
  const { rows: allItems } = await pool.query(
    "SELECT *, 'item/' || id as url FROM items ORDER BY name ASC"
  );
  const { rows: numItems } = await pool.query("SELECT COUNT(*) FROM items");

  res.render("item_list", {
    title: "Item List",
    item_list: allItems,
    item_count: numItems[0].count,
  });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const { rows: item } = await pool.query("SELECT * FROM items WHERE id = $1", [
    req.params.id,
  ]);

  const { rows: itemCategories } = await pool.query(
    "SELECT category_id FROM item_categories WHERE item_id = $1",
    [req.params.id]
  );

  if (item.length === 0) {
    const err = new Error("Item not found!");
    err.status = 404;
    return next(err);
  }

  const { rows: categoryDetails } = await pool.query(
    "SELECT * FROM categories WHERE id = ANY($1::int[])",
    [itemCategories.map((cat) => cat.category_id)]
  );

  res.render("item_detail", {
    title: "Item: " + item[0].name,
    item: item[0],
    category: categoryDetails,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const { rows: allCategories } = await pool.query(
    "SELECT * FROM categories ORDER BY name ASC"
  );

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
  body("number_in_stock", "Number in stock must not be empty").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    };

    if (!errors.isEmpty()) {
      const { rows: allCategories } = await pool.query(
        "SELECT * FROM categories ORDER BY name ASC"
      );

      allCategories.forEach((category) => {
        if (req.body.category.includes(category.id.toString())) {
          category.checked = "true";
        }
      });

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item,
        errors: errors.array(),
      });
    } else {
      const result = await pool.query(
        "INSERT INTO items (name, description, price, number_in_stock) VALUES ($1, $2, $3, $4) RETURNING *",
        [item.name, item.description, item.price, item.number_in_stock]
      );
      const itemId = result.rows[0].id;

      if (req.body.category.length > 0) {
        const categoryInsertPromises = req.body.category.map((categoryId) =>
          pool.query(
            "INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2)",
            [itemId, categoryId]
          )
        );
        await Promise.all(categoryInsertPromises);
      }
      res.redirect(`/inventory/item/${itemId}`);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const { rows: item } = await pool.query("SELECT * FROM items WHERE id = $1", [
    req.params.id,
  ]);

  if (item.length === 0) {
    res.redirect("/inventory/item");
    return;
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item[0],
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await pool.query("DELETE FROM items WHERE id = $1", [req.body.itemid]);
  res.redirect("/inventory/item");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const { rows: item } = await pool.query("SELECT * FROM items WHERE id = $1", [
    req.params.id,
  ]);
  const { rows: allCategories } = await pool.query(
    "SELECT * FROM categories ORDER BY name ASC"
  );

  if (item.length === 0) {
    const err = new Error("Item not found!");
    err.status = 404;
    return next(err);
  }

  const { rows: itemCategories } = await pool.query(
    "SELECT category_id FROM item_categories WHERE item_id = $1",
    [req.params.id]
  );
  const itemCategoryIds = itemCategories.map((cat) =>
    cat.category_id.toString()
  );

  allCategories.forEach((category) => {
    if (itemCategoryIds.includes(category.id.toString())) {
      category.checked = "true";
    }
  });

  res.render("item_form", {
    title: "Update Item",
    item: item[0],
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
  body("number_in_stock", "Number in stock must not be empty").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category || [],
    };

    if (!errors.isEmpty()) {
      const { rows: allCategories } = await pool.query(
        "SELECT * FROM categories ORDER BY name ASC"
      );

      allCategories.forEach((category) => {
        if (item.category.includes(category.id.toString())) {
          category.checked = "true";
        }
      });

      res.render("item_form", {
        title: "Update Item",
        item,
        categories: allCategories,
        errors: errors.array(),
      });
    } else {
      await pool.query(
        "UPDATE items SET name = $1, description = $2, price = $3, number_in_stock = $4 WHERE id = $5",
        [
          item.name,
          item.description,
          item.price,
          item.number_in_stock,
          req.params.id,
        ]
      );
      await pool.query("DELETE FROM item_categories WHERE item_id = $1", [
        req.params.id,
      ]);

      if (item.category.length > 0) {
        const categoryInsertPromises = item.category.map((categoryId) =>
          pool.query(
            "INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2)",
            [req.params.id, categoryId]
          )
        );
        await Promise.all(categoryInsertPromises);
      }

      res.redirect(`/inventory/item/${req.params.id}`);
    }
  }),
];
