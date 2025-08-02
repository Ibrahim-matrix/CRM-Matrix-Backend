const { contacts } = require("../models");
const addContact = async (contactData) => {
  return await contacts.create(contactData);
};
const getContacts = async (filter) => {
  return await contacts.find({});
};

module.exports = {
  addContact,
  getContacts,
};
