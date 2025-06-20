const {
  findMatchingContacts,
  createNewContact,
  createSecondaryContact,
  updateContactAsSecondary,
} = require("../src/services/service");

jest.mock("../models/", () => ({
  Contact: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const { Contact } = require("../models/"); 
const { Op } = require("sequelize");

describe("Contact Service Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findMatchingContacts", () => {
    it("should find contacts by email or phone number", async () => {
      const mockContacts = [{ id: 1 }, { id: 2 }];
      Contact.findAll.mockResolvedValue(mockContacts);

      const result = await findMatchingContacts("test@example.com", "1234567890");

      expect(Contact.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { email: "test@example.com" },
            { phoneNumber: "1234567890" },
          ],
        },
      });
      expect(result).toBe(mockContacts);
    });
  });

  describe("createNewContact", () => {
    it("should create a new primary contact", async () => {
      const mockContact = { id: 1, email: "test@example.com" };
      Contact.create.mockResolvedValue(mockContact);

      const result = await createNewContact("test@example.com", "1234567890");

      expect(Contact.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          phoneNumber: "1234567890",
          linkPrecedence: "primary",
          linkedId: null,
        })
      );
      expect(result).toBe(mockContact);
    });
  });

  describe("createSecondaryContact", () => {
    it("should create a secondary contact linked to primary", async () => {
      const mockSecondary = { id: 5 };
      Contact.create.mockResolvedValue(mockSecondary);

      const result = await createSecondaryContact(1, "secondary@example.com", "1111111111");

      expect(Contact.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "secondary@example.com",
          phoneNumber: "1111111111",
          linkPrecedence: "secondary",
          linkedId: 1,
        })
      );
      expect(result).toBe(mockSecondary);
    });
  });

  describe("updateContactAsSecondary", () => {
    it("should update a contact to secondary", async () => {
      Contact.update.mockResolvedValue([1]);

      const result = await updateContactAsSecondary(10, 1);

      expect(Contact.update).toHaveBeenCalledWith(
        {
          linkPrecedence: "secondary",
          linkedId: 1,
        },
        {
          where: { id: 10 },
        }
      );
      expect(result).toEqual([1]);
    });
  });
});
