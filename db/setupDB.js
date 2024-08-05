const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCategoriesTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL
    );
`;

const createItemsTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category INTEGER REFERENCES categories(id),
        price NUMERIC NOT NULL,
        number_in_stock INTEGER NOT NULL
    );
`;

const createItemsCategoriesTableQuery = `
    CREATE TABLE IF NOT EXISTS item_categories(
        item_id INTEGER REFERENCES items(id),
        category_id INTEGER REFERENCES categories(id),
        PRIMARY KEY (item_id, category_id)
    )
`;

const createTables = async () => {
  try {
    await pool.query(createCategoriesTableQuery);
    await pool.query(createItemsTableQuery);
    await pool.query(createItemsCategoriesTableQuery);
    console.log("Tables created successfully");
  } catch (err) {
    console.log("Error creating tables" + err);
    pool.end();
  }
};

createTables();
