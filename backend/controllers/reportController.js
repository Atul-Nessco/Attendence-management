const { googleSheetsClient } = require('../config/googleSheets');

const getMonthlyReport = async (req, res) => {
  const { year, month, employeeId } = req.query;

  try {
    const { sheets } = googleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet2!A:N', // Adjust the range as needed, ensuring it includes the columns for In Location and Out Location
    });

    const rows = response.data.values;
    const filteredData = rows.filter(row => {
      const date = new Date(row[2]); // Assuming IN Timing is in column 3 (index 2)
      return (
        row[0] === employeeId &&
        date.getFullYear() === parseInt(year) &&
        date.getMonth() + 1 === parseInt(month)
      );
    }).map(row => {
      const inDate = new Date(row[2]);
      const outDate = new Date(row[7]);

      const convertToIST = (date) => {
        if (isNaN(date.getTime())) return null;
        const IST_OFFSET = 0;
        return new Date(date.getTime() + IST_OFFSET);
      };

      const inDateIST =  convertToIST(inDate);
      const outDateIST  = convertToIST(outDate);

      const formattedDate = inDateIST ? inDateIST.toISOString().split('T')[0] : 'N/A';
      const inTime = inDateIST ? inDateIST.toTimeString().split(' ')[0] : 'N/A';
      const outTime = outDateIST ? outDateIST.toTimeString().split(' ')[0] : 'N/A';

      return {
        Date: formattedDate,
        IN_Timing: inTime,
        OUT_Timing: outTime,
        IN_Photo: row[4] || null,
        OUT_Photo: row[9] || null, // Ensure this index is correct
        AttendenceStatus: row[13],
        IN_Location: row[3] || null, // Assuming In Location is in column 6 (index 5)
        OUT_Location: row[8] || null, // Assuming Out Location is in column 11 (index 10)      
      };
    });

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ message: 'Error fetching report data' });
  }
};

module.exports = { getMonthlyReport };