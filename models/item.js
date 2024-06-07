const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  numberInStock: { type: Number, required: true },
});

itemSchema.virtual("url").get(function () {
  return `/shop/item/${this._id}`;
});

module.exports = mongoose.model("Item", itemSchema);
