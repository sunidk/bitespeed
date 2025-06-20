const { identifyContacts } = require("../src/controllers/controller");
const service = require("../src/services/service");

jest.mock("../src/services/service", () => ({
  findMatchingContacts: jest.fn(),
  createNewContact: jest.fn(),
  createSecondaryContact: jest.fn(),
  updateContactAsSecondary: jest.fn(),
}));

describe("identifyContacts", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if email and phoneNumber are missing", async () => {
    await identifyContacts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email or phone number is required.",
      data: null,
    });
  });

  it("should create a new contact if no match found", async () => {
    req.body = { email: "test@example.com", phoneNumber: "1234567890" };
    const newContact = {
      id: 1,
      email: "test@example.com",
      phoneNumber: "1234567890",
      linkPrecedence: "primary",
    };

    service.findMatchingContacts.mockResolvedValue([]);
    service.createNewContact.mockResolvedValue(newContact);

    await identifyContacts(req, res);

    expect(service.createNewContact).toHaveBeenCalledWith(
      "test@example.com",
      "1234567890"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "New contact created successfully.",
      contact: {
        primaryContactId: 1,
        emails: ["test@example.com"],
        phoneNumbers: ["1234567890"],
        secondaryContactIds: [],
      },
    });
  });

  it("should identify existing contact and return merged response", async () => {
    req.body = { email: "sunidk97@gmail.com", phoneNumber: "1234567890" };

    const contacts = [
      {
        id: 49,
        email: "sunidk97@gmail.com",
        phoneNumber: "1234567890",
        linkPrecedence: "primary",
        createdAt: new Date("2023-01-01"),
      },
      {
        id: 50,
        email: "sunidk98@gmail.com",
        phoneNumber: "1234567891",
        linkPrecedence: "secondary",
        linkedId: 49,
        createdAt: new Date("2023-01-02"),
      },
    ];

    service.findMatchingContacts.mockResolvedValueOnce(contacts);
    service.findMatchingContacts.mockResolvedValueOnce(contacts);

    await identifyContacts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Contact identified successfully.",
      contact: {
        primaryContactId: 49,
        emails: ["sunidk97@gmail.com", "sunidk98@gmail.com"],
        phoneNumbers: ["1234567890", "1234567891"],
        secondaryContactIds: [50],
      },
    });
  });

  it("should create a new secondary contact if phone matches but email is new", async () => {
    req.body = {
      email: "newemail@example.com", // new email
      phoneNumber: "1234567890", // existing phone
    };

    const existingPrimary = {
      id: 10,
      email: "existing@example.com",
      phoneNumber: "1234567890",
      linkPrecedence: "primary",
      createdAt: new Date("2023-01-01"),
    };

    const newSecondary = {
      id: 20,
      email: "newemail@example.com",
      phoneNumber: "1234567890",
      linkPrecedence: "secondary",
      linkedId: 10,
    };

    service.findMatchingContacts.mockResolvedValueOnce([existingPrimary]);
    service.createSecondaryContact.mockResolvedValueOnce(newSecondary);
    service.findMatchingContacts.mockResolvedValueOnce([existingPrimary]);

    await identifyContacts(req, res);

    expect(service.createSecondaryContact).toHaveBeenCalledWith(
      10,
      "newemail@example.com",
      "1234567890"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Secondary contact created successfully.",
      contact: {
        primaryContactId: 10,
        emails: ["existing@example.com", "newemail@example.com"],
        phoneNumbers: ["1234567890"],
        secondaryContactIds: [20],
      },
    });
  });

  it("should return 500 on error", async () => {
    req.body = { email: "err@example.com", phoneNumber: "9999999999" };

    service.findMatchingContacts.mockRejectedValue(new Error("DB error"));

    await identifyContacts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 500,
      error: "DB error",
    });
  });
});
