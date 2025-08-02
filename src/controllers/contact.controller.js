const { contactService } = require("../services");
const catchAsync = require('../utils/catchAsync')

const addContact = catchAsync(async (req, res) => {
  const { contacts } = req.body;
  if (contacts.length > 0) {
    for (let contact of contacts) {
      await contactService.addContact(contact);
    }
  }
  return res.status(200).json({
    message: "success",
  });
  const contact = await contactService.addContact();
});
const getContacts = catchAsync(async (req, res) => {
  const ctctData = await contactService.getContacts();

  return res.status(200).json({
    message: "success",
    Data: ctctData,
  });
});

module.exports = {
  addContact,
  getContacts,
};
