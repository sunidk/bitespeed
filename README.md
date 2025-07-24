# Bitespeed Identity Reconciliation API

A Node.js REST API for contact identity reconciliation, supporting merging and linking of contacts based on email and phone number.

## Features

- Accepts email and/or phone number to identify or create contacts
- Merges contacts with overlapping identifiers (email/phone)
- Maintains primary and secondary contact relationships
- Returns a unified response with all related emails, phone numbers, and secondary contact IDs

## Endpoint

### `POST /identify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```
- At least one of `email` or `phoneNumber` is required.

**Response:**
- On success, returns the primary contact ID, all related emails, phone numbers, and secondary contact IDs.

## How to Use

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure your database and environment variables** as required in the project.

3. **Start the server:**
   ```sh
   node index.js
   ```

4. **Send a POST request to `/identify`** with the required JSON body.

## Files

- `src/controllers/controller.js` – Main controller logic for contact identification
- `src/services/service.js` – Service functions for DB operations
- `src/utils/constants/` – Status codes and messages

## Dependencies

- express
- (your database ORM, e.g., sequelize or mongoose)
- other dependencies as required

## License

This project is open source and available under the [MIT License](LICENSE).