const mongoose = require("mongoose");
const issueModel = require("../models/issue.model");
const httpStatus = require("http-status");
const { issueService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const addIssue = catchAsync(async (req, res) => {
  if (req.user.UserType == 1) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
    req.body["userId"] = req.user.userId;
  } else if (req.user.UserType == 3) {
    req.body["parentId"] = req.user.parentId;
    req.body["userId"] = req.user.userId;
  }

  const totalDocuments = await issueModel.countDocuments({});
  const myTicketId = (totalDocuments + 1).toString().padStart(3, "0");
  req.body["ticketId"] = myTicketId;
  const myissue = await issueService.addIssue(req.body);

  return res.status(201).json({
    success: true,
    message: "Issue raised succssfully!!",
    Data: myissue,
  });
});

const getIssues = catchAsync(async (req, res) => {
  if (req.user.UserType == 2 || req.user.UserType == 3) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (req.user.UserType == 1) {
    const issues = await issueService.getIssues();

    return res.status(200).json({
      success: true,
      message: "Issue raised succssfully!!",
      Data: issues,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid Token or Token expired!!",
  });
});

const getUserIssues = catchAsync(async (req, res) => {
  let filter = {};
  const {
    parentId,
    userId,
    status,
    issueResolved,
    issueStartDate,
    issueEndDate,
  } = req.query;
  if (
    req.user.UserType == 1 ||
    req.user.UserType == 2 ||
    req.user.UserType == 3
  ) {
    filter = {
      ...(parentId ? { parentId } : {}),
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(issueResolved ? { issueResolved } : {}),
    };

    if (issueStartDate && issueEndDate) {
      const isoStartDate = issueStartDate;
      const isoEndDate = issueEndDate;

      const startDate = new Date(isoStartDate);
      let endDate = new Date(isoEndDate);
      endDate.setDate(endDate.getDate() + 1);

      Object.assign(filter, {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    }

    const issue = await issueService.getUserIssues(filter);

    if (issue.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "Issues does not exist",
      });
    }

    return res.status(200).json({
      success: true,
      Data: issue,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized!!",
    });
  }
});

const getIssue = catchAsync(async (req, res) => {
  if (
    req.user.UserType == 2 ||
    req.user.UserType == 3 ||
    req.user.UserType == 1
  ) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }
    const issue = await issueService.getIssue(id);
    if (!issue) {
      return res.status(400).json({
        success: false,
        message: "Issue does not exist",
      });
    }

    return res.status(200).json({
      success: true,
      Data: issue,
    });
  } else {
    // console.log("-----", req.user);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

const updateIssue = catchAsync(async (req, res) => {
  if (req.user.UserType == 1) {
    const { id } = req.params;
    const { remarks } = req.body;
    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: "Remarks is required",
      });
    }
    // req.body["resolveDate"] = new Date();
    const issue = await issueService.updateIssue(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Issue resolved succssfully!!",
      Data: issue,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

//  const deleteCity = catchAsync(async (req, res) => {
//   const city = await cityService.deleteCity(req.params.id);

//   return res.status(httpStatus.OK).json({
//     message: "city deleted succssfully!!",
//     Data: city,
//   });
// });

module.exports = {
  addIssue,
  getIssues,
  getIssue,
  getUserIssues,
  updateIssue,
};
