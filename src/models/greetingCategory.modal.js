// models/GreetingCategory.js
const mongoose = require("mongoose");

const GreetingCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const greetingCategory = mongoose.model(
  "GreetingCategory",
  GreetingCategorySchema
);
module.exports = greetingCategory;
