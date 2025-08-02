const httpStatus = require("http-status");
const { Proposal, ProposalGreeting, users, course } = require("../models");
const catchAsync = require("../utils/catchAsync");
const { sendClientPropoalEmail } = require("../utils/sendEmail");

const getClientPropoal = catchAsync(async (req, res) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Proposal not found.",
      Data: [],
    });
  }

  //Greetings
  const greeting = await ProposalGreeting.findById(proposal.greetingId);

  //company info
  const companyInfo = await users.findById(proposal.parentId);
  const companyObj = {
    _id: companyInfo._id,
    companyName: companyInfo?.companyName,
    Name: companyInfo?.Name,
    Email: companyInfo?.Email,
    Phone: companyInfo?.Phone,
    Address: companyInfo?.Address,
    webURL: companyInfo?.webURL,
    City: companyInfo?.City,
    ComapanyImageOne: companyInfo?.ComapanyImageOne,
    ComapanyImageTwo: companyInfo?.ComapanyImageTwo,
  };

  //items info
  const newItems = await Promise.all(
    proposal?.items?.map(async (item) => {
      const courseDoc = await course.findById(item?.productId);
      const itemObj = item.toObject();
      itemObj.productName = courseDoc?.CourseName || "Unknown Course";
      return itemObj;
    })
  );

  //proposal obj
  const proposalObj = proposal.toObject();
  proposalObj.greeting = greeting?.greeting || null;
  proposalObj.companyInfo = companyObj || null;
  proposalObj.items = newItems || null;

  return res.status(httpStatus.OK).json({
    message: "cleint proposal availabel.",
    Data: proposalObj,
  });
});

const updateAcceptAndSignClientProposal = catchAsync(async (req, res) => {
  const { id } = req.params;

  const proposal = await Proposal.findByIdAndUpdate(
    id,
    {
      status: "ACCEPTED",
      Esign: req.body.esign,
      clientReactionDate: new Date(),
      clientNote: req.body.clientNote,
    },
    { new: true }
  );

  if (!proposal) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Proposal not found.",
      Data: [],
    });
  }

  res.status(httpStatus.OK).json({
    message: "Proposal Marked as Accepted successfully.",
  });
});

const sendProposalToClient = catchAsync(async (req, res) => {
  const { id } = req.body;
  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Proposal not found.",
      Data: [],
    });
  }
  const proposalObj = proposal.toObject();

  const { name, email, _id } = proposalObj;

  await sendClientPropoalEmail({
    clientEmail: email,
    clientName: name,
    proposalLink: _id,
    res,
  });

  proposal.sentDate = new Date();
  proposal.status = "SENT PENDING";
  await proposal.save();
});

module.exports = {
  getClientPropoal,
  updateAcceptAndSignClientProposal,
  sendProposalToClient,
};
