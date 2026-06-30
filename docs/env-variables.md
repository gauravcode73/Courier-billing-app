# Environment Variables Guide

This guide documents the configuration environment settings required by the AmodXpress backend and frontend packages.

---

## 1. Backend Configurations (`backend/.env`)

Create a `.env` file in the `backend/` directory.

### Express Core Settings

- **`PORT`**
  - **Description**: Port number where the Express server listens.
  - **Default**: `5000`
- **`NODE_ENV`**
  - **Description**: Current deployment environment mode.
  - **Options**: `development` | `production`
  - **Default**: `development`
- **`JWT_SECRET`**
  - **Description**: Encryption key used to sign session tokens.
  - **Default**: `amodxpress_secret_jwt_key_12345`
  - **Recommendation**: Set this to a long random hexadecimal string in production.

### Admin Credentials

- **`ADMIN_USERNAME`**
  - **Description**: Username for admin portal access.
  - **Default**: `admin`
- **`ADMIN_PASSWORD`**
  - **Description**: Password for admin portal access.
  - **Default**: `admin123`
  - **Recommendation**: Update before hosting public instances.

### Google Sheets API Connections

- **`GOOGLE_SERVICE_ACCOUNT_EMAIL`**
  - **Description**: The email generated for your service account from the Google Cloud Console.
  - **Format**: `your-account@your-project-id.iam.gserviceaccount.com`
- **`GOOGLE_PRIVATE_KEY`**
  - **Description**: The private key from the credentials JSON. Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` wrapper strings.
  - **Format**: Wrap in quotes and parse newlines like `"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\\n-----END PRIVATE KEY-----\n"`
- **`GOOGLE_SPREADSHEET_ID`**
  - **Description**: The alphanumeric string in the address bar of your Google Sheet.
  - **Example**: In `https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit`, the ID is `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`.

---

## 2. Frontend Configurations (`frontend/.env`)

Create a `.env` or `.env.local` file inside the `frontend/` directory.

- **`VITE_API_URL`**
  - **Description**: Address pointing to the Express server API.
  - **Default**: `http://localhost:5000/api`
  - **Production Example**: `https://amodxpress-api.railway.app/api`
