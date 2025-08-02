const httpStatus = require("http-status");
const { proposalService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const { proposal, Proposal } = require("../models");

const addProposal = catchAsync(async (req, res) => {
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    req.body["parentId"] = req.user.parentId;
  }
  const {
    parentId,
    name,
    phone,
    email,
    location,
    proposalName,
    leadId,
    validTillDate,
    createdBY,
    descriptions,
    terms,
    items,
    emiSteps,
    greetingId,
    subTotal,
    totalTax,
    discount,
    discountType,
    discountPrice,
    total,
  } = req.body;

  console.log(name, items);
  console.log(req.body);

  const proposalData = {
    parentId,
    name,
    phone,
    email,
    location,
    proposalName,
    leadId,
    validTillDate,
    createdBY,
    descriptions,
    terms,
    items,
    emiSteps,
    greetingId,
    subTotal,
    totalTax,
    discount,
    discountType,
    discountPrice,
    total,
  };

  const proposalAdded = await proposalService.addProposal(proposalData);

  res.status(httpStatus.OK).json({
    message: "proposal created successfully.",
    Data: proposalAdded,
  });
});

const getProposals = catchAsync(async (req, res) => {
  const user = req.user;

  let filter = {};

  if (req.user.UserType == 2) {
    filter["parentId"] = user.userId;
  } else if (
    req.user.UserType == 3 &&
    (user.UserProfile === "Manager" || user.UserProfile === "Custom")
  ) {
    if (Array.isArray(user.Permission) && user.Permission.length > 0) {
      const permittedUserId = user.Permission.map((p) => p.userId);
      permittedUserId.push(user.userId);
      filter = {
        parentId: user.parentId,
        "createdBY.userId": {
          $in: permittedUserId,
        },
      };
    }
  } else if (user.UserType === 3 && user.UserProfile === "User") {
    const id = user.userId;
    filter = {
      parentId: user.parentId,
      "createdBY.userId": id,
    };
  }

  const proposals = await proposalService.getProposals(filter);

  res.status(httpStatus.OK).json({
    message: "got proposals successfully",
    Data: proposals,
  });
});

const getProposalById = catchAsync(async (req, res) => {
  const proposal = await proposalService.getProposalById(req.params.id);

  res.json(proposal);
});

const updateProposal = catchAsync(async (req, res) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Proposal not found",
      Data: [],
    });
  }

  Object.assign(proposal, req.body); // ✅ safely copy fields
  await proposal.save(); // ✅ save changes

  return res.status(httpStatus.OK).json({
    message: "updated proposal successfully.",
    Data: proposal,
  });
});

module.exports = {
  addProposal,
  getProposals,
  getProposalById,
  updateProposal,
};
