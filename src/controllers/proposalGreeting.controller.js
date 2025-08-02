const httpStatus = require("http-status");
const { ProposalGreeting } = require("../models");
const catchAsync = require("../utils/catchAsync");

const addProposalGreeting = catchAsync(async (req, res) => {
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    req.body["parentId"] = req.user.parentId;
  }

  req.body["createdBy"] = req.user.userId;

  const greeting = await ProposalGreeting.create(req.body);

  return res.status(httpStatus.OK).json({
    message: "Greeting created successfully.",
    Data: greeting,
  });
});

const getProposalGreetings = catchAsync(async (req, res) => {
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
      permittedUserId.push(user.parentId);
      filter = {
        parentId: user.parentId,
        createdBY: {
          $in: permittedUserId,
        },
      };
    }
  } else if (user.UserType === 3 && user.UserProfile === "User") {
    const ids = [user.userId, user.parentId];
    filter = {
      parentId: user.parentId,
      createdBY: { $in: ids },
    };
  }

  const greetings = await ProposalGreeting.find(filter);

  return res.status(httpStatus.OK).json({
    message: "got the proposal greetings.",
    Data: greetings,
  });
});

const getProposalGreetingById = catchAsync(async (req, res) => {
  const greeting = await ProposalGreeting.findById(req.params.id);
  if (!greeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "greeting not found",
      Data: [],
    });
  }
  return res.json(greeting);
});

const updateProposalGreeting = catchAsync(async (req, res) => {
  const { id } = req.params;

  const proposalGreeting = await ProposalGreeting.findById(id);

  if (!proposalGreeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Greeting not found",
      Data: [],
    });
  }

  Object.assign(proposalGreeting, req.body); // ✅ safely copy fields
  await proposalGreeting.save(); // ✅ save changes

  return res.status(httpStatus.OK).json({
    message: "updated greeting successfully.",
    Data: proposalGreeting,
  });
});

const deleteProposalGreeting = catchAsync(async (req, res) => {
  const { id } = req.params;

  const greeting = await ProposalGreeting.findById(id);

  if (!greeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "greeting not found",
      Data: [],
    });
  }

  await ProposalGreeting.findByIdAndDelete(id);

  return res.status(httpStatus.OK).json({
    message: "greeting deleted successfully",
    Data: greeting,
  });
});

module.exports = {
  addProposalGreeting,
  getProposalGreetings,
  updateProposalGreeting,
  getProposalGreetingById,
  deleteProposalGreeting,
};
