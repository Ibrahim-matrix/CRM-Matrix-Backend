const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['1', '2', '3'], // 1: message, 2: image, 3: document
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Store image file path or URL
  },
  document: {
    type: String, // Store document file path or URL
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"user"
  }
});


const templates = mongoose.model("templates", templateSchema);
module.exports = templates;
