#! /usr/bin/env node

console.log(
  'This script populates some items and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function itemCreate(
  index,
  name,
  description,
  category,
  price,
  numberInStock
) {
  const itemDetail = {
    name: name,
    description: description,
    category: category,
    price: price,
    numberInStock: numberInStock,
  };

  const item = new Item(itemDetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${item}`);
}

async function categoryCreate(index, name, description) {
  const categoryDetail = { name: name, description: description };

  const category = new Category(categoryDetail);
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${category}`);
}

async function createItems() {
  const sampleItems = [
    {
      name: "Apple",
      description: "Fresh red apples",
      category: [categories[0]],
      price: 1.5,
      numberInStock: 100,
    },
    {
      name: "Carrot",
      description: "Organic carrots",
      category: [categories[1]],
      price: 0.8,
      numberInStock: 200,
    },
    {
      name: "Milk",
      description: "1 litre of fresh milk",
      category: [categories[2]],
      price: 1.2,
      numberInStock: 50,
    },
    {
      name: "Bread",
      description: "Whole grain bread",
      category: [categories[3]],
      price: 2.0,
      numberInStock: 30,
    },
  ];

  console.log("Adding items");
  await Promise.all(
    sampleItems.map(async (item, index) => {
      await itemCreate(
        index,
        item.name,
        item.description,
        item.category,
        item.price,
        item.numberInStock
      );
    })
  );
}

async function createCategories() {
  const sampleCategories = [
    { name: "Fruits", description: "Fresh and delicious fruits" },
    { name: "Vegetables", description: "Organic and healthy vegetables" },
    { name: "Dairy", description: "Milk, cheese, and other dairy products" },
    { name: "Bakery", description: "Bread, cakes, and other baked goods" },
  ];
  console.log("Adding categories");
  await Promise.all(
    sampleCategories.map(async (cat, index) => {
      await categoryCreate(index, cat.name, cat.description);
    })
  );
}
