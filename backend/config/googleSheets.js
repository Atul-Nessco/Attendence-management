const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const googleSheetsClient = () => {
  const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS;
  console.log(`Credentials path: ${credentialsPath}`);
  
  if (!credentialsPath) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
  }

  const fullPath = path.resolve(credentialsPath);
  console.log(`Full credentials path: ${fullPath}`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Credentials file not found at path: ${fullPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(fullPath));
  const { client_email, private_key } = credentials;

  const auth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  return { sheets, drive };
};

module.exports = { googleSheetsClient };
