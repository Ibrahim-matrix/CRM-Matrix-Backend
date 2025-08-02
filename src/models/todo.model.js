const mongoose = require("mongoose");

const todoSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "todo", // This points to another todo
      default: null,
    },
    note: {
      type: String,
      required: true,
    },
    assignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    Branch: {
      type: String,
      ref: "branch"
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    createrName: {
      type: String,
      ref: "user",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true
    },
    completedComment: {
      type: String,
    }
  },
  { timestamps: true }
);

const Todo = mongoose.model("todo", todoSchema);

module.exports = Todo;
