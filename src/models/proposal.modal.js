const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    tax: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    totalWithTax: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const EmiStepSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    payPercentage: {
      type: Number,
      required: true,
    },
    pay: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
    },
    remark: {
      type: String,
      default: "",
    },
    emiPaymentReceivedDate: {
      type: Date,
      default: null,
    },
    emiPayUpdatedBy: {
      name: {
        type: String,
        required: function () {
          return this.isPaid === true;
        },
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: function () {
          return this.isPaid === true;
        },
      },
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const ProposalSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["NOT SENT", "SENT PENDING", "ACCEPTED", "DECLINED", "DELETED"],
      default: "NOT SENT",
    },
    Esign: {
      type: String,
      default: null,
    },
    sentDate: {
      type: Date,
      default: null,
    },
    clientReactionDate: {
      type: Date,
      default: null,
    },
    clientNote: {
      type: String,
      defaulte: null,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    proposalName: {
      type: String,
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leads",
      required: true,
    },
    validTillDate: {
      type: Date,
      required: true,
    },

    createdBY: {
      name: {
        type: String,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    },

    greetingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    descriptions: {
      value: {
        type: String,
        required: true,
      },
    },

    terms: {
      value: {
        type: String,
        required: true,
      },
    },

    items: [ItemSchema],
    emiSteps: [EmiStepSchema],

    subTotal: {
      type: Number,
      required: true,
    },
    totalTax: {
      type: Number,
      required: true,
    },
    discount: {
      type: String,
    }, // e.g. "10"
    discountType: {
      type: String,
      enum: ["percentage", "amount"],
    },
    discountPrice: {
      type: Number,
    }, // Calculated discount value
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Proposal = mongoose.model("Proposal", ProposalSchema);
module.exports = Proposal;
