const {
  findMatchingContacts,
  createNewContact,
  createSecondaryContact,
  updateContactAsSecondary,
} = require("../services/service");
const {
  REQUIRED_FIELDS,
  CONTACT_CREATED,
  SECONDARY_CONTACT_CREATED,
  CONTACT_IDENTIFIED,
} = require("../utils/constants/messages");
const {
  CREATED,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
} = require("../utils/constants/statusCodes");

// Helper function to build ontact response
function buildContactResponse(primaryId, contacts) {
  return {
    primaryContactId: primaryId,
    emails: [
      ...new Set(contacts.map((contact) => contact.email).filter(Boolean)),
    ],
    phoneNumbers: [
      ...new Set(
        contacts.map((contact) => contact.phoneNumber).filter(Boolean)
      ),
    ],
    secondaryContactIds: contacts
      .filter((contact) => contact.linkPrecedence === "secondary")
      .map((contact) => contact.id),
  };
}

// Main controller function
async function identifyContacts(req, res) {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: REQUIRED_FIELDS,
        data: null,
      });
    }

    // Fetch existing contacts with matching email/phone
    let contacts = await findMatchingContacts(email, phoneNumber);

    // If no match found, create a new primary contact
    if (!contacts.length) {
      const newContact = await createNewContact(email, phoneNumber);
      return res.status(CREATED).json({
        success: true,
        message: CONTACT_CREATED,
        contact: buildContactResponse(newContact.id, [newContact]),
      });
    }

    // Identify the oldest primary contact
    const primaryContacts = contacts.filter(
      (contact) => contact.linkPrecedence === "primary"
    );
    const primaryContact = primaryContacts.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )[0];

    // Update other primary contacts to secondary
    for (const contact of primaryContacts) {
      if (
        contact.id !== primaryContact.id &&
        contact.linkPrecedence !== "secondary"
      ) {
        await updateContactAsSecondary(contact.id, primaryContact.id);
        contact.linkPrecedence = "secondary";
        contact.linkedId = primaryContact.id;
      }
    }

    // Re-fetch updated contact list to include latest changes
    contacts = await findMatchingContacts(email, phoneNumber);

    const emailExists = contacts.some((contact) => contact.email === email);
    const phoneExists = contacts.some(
      (contact) => contact.phoneNumber === phoneNumber
    );

    // Add new secondary if one of the identifiers is new
    if ((!emailExists && email) || (!phoneExists && phoneNumber)) {
      const newSecondary = await createSecondaryContact(
        primaryContact.id,
        email,
        phoneNumber
      );
      contacts.push(newSecondary);
      return res.status(CREATED).json({
        success: true,
        message: SECONDARY_CONTACT_CREATED,
        contact: buildContactResponse(primaryContact.id, contacts),
      });
    }

    // Fully matched existing contact
    return res.status(SUCCESS).json({
      success: true,
      message: CONTACT_IDENTIFIED,
      contact: buildContactResponse(primaryContact.id, contacts),
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
}

module.exports = { identifyContacts };
