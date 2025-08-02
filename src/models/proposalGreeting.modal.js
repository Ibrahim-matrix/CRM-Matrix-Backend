const mongoose = require("mongoose");

const ProposalGreetingSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    greeting: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GreetingCategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProposalGreeting = mongoose.model(
  "ProposalGreeting",
  ProposalGreetingSchema
);

module.exports = ProposalGreeting;
