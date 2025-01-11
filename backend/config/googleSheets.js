const { google } = require('googleapis');

const googleSheetsClient = () => {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
  const { client_email, private_key } = credentials;

  if (!client_email || !private_key) {
    throw new Error('Invalid GOOGLE_SHEETS_CREDENTIALS environment variable');
  }

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
