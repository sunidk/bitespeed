const { Op } = require("sequelize");
const { Contact } = require("../../models");

// Find all contacts where email or phone number matches
async function findMatchingContacts(email, phoneNumber) {
  return await Contact.findAll({
    where: {
      [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }],
    },
  });
}

// Create a new contact as primary (first contact)
async function createNewContact(email, phoneNumber) {
  return await Contact.create({
    phoneNumber: phoneNumber || null,
    email: email || null,
    linkedId: null,
    linkPrecedence: "primary",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });
}


// Create a secondary contact linked to a primary contact
async function createSecondaryContact(primaryContactId, email, phoneNumber) {
  return await Contact.create({
    phoneNumber: phoneNumber || null,
    email: email || null,
    linkedId: primaryContactId,
    linkPrecedence: "secondary",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });
}

// Update a contact to make it secondary and link it to the primary contact
async function updateContactAsSecondary(contactId, primaryId) {
  return Contact.update(
    { linkPrecedence: "secondary", linkedId: primaryId },
    { where: { id: contactId } }
  );
}

module.exports = {
  findMatchingContacts,
  createNewContact,
  createSecondaryContact,
  updateContactAsSecondary
};
