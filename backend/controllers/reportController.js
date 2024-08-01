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

      const formattedDate = isNaN(inDate.getTime()) ? 'N/A' : inDate.toISOString().split('T')[0];
      const inTime = isNaN(inDate.getTime()) ? 'N/A' : inDate.toTimeString().split(' ')[0];
      const outTime = isNaN(outDate.getTime()) ? 'N/A' : outDate.toTimeString().split(' ')[0];

      return {
        Date: formattedDate,
        IN_Timing: inTime,
        OUT_Timing: outTime,
        IN_Photo: row[4] || null,
        OUT_Photo: row[9] || null, // Ensure this index is correct
        AttendenceStatus: row[13],
        IN_Location: row[3] || 'N/A', // Assuming In Location is in column 6 (index 5)
        OUT_Location: row[8] || 'N/A', // Assuming Out Location is in column 11 (index 10)
      };
    });

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ message: 'Error fetching report data' });
  }
};

module.exports = { getMonthlyReport };
