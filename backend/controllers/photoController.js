const fs = require('fs');
const path = require('path');
const { googleSheetsClient } = require('../config/googleSheets');

const { drive } = googleSheetsClient();

const uploadPhoto = async (req, res) => {
  const { image } = req.body;
  const photoBuffer = Buffer.from(image.split(',')[1], 'base64');
  const fileName = `photo_${Date.now()}.jpeg`;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  if (!fs.existsSync(path.join(__dirname, '..', 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'uploads'));
  }

  fs.writeFileSync(filePath, photoBuffer);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'image/jpeg',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
      },
    });
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    const result = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink',
    });

    res.status(200).json({ photoUrl: result.data.webViewLink });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.message);
    res.status(500).json({ message: 'Failed to upload to Google Drive' });
  } finally {
    fs.unlinkSync(filePath); // Remove the file after uploading
  }
};

module.exports = { uploadPhoto };
