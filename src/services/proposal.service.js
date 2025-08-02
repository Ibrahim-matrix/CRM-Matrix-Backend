const { Proposal } = require("../models");

const addProposal = async (data) => {
  return await Proposal.create(data);
};

const getProposals = async (data) => {
  return await Proposal.find(data).sort({ createdAt: -1 });
};

const getProposalById = async (data) => {
  return await Proposal.findById(data);
};

const updateProposal = async (data) => {
  return await Proposal.findById(data);
};

module.exports = {
  addProposal,
  getProposals,
  getProposalById,
  updateProposal,
};
