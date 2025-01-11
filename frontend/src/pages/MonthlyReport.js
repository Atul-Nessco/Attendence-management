import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Box,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  useTheme,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Adjust the import according to your project structure


const MonthlyReport = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { auth } = useContext(AuthContext); // Assuming auth context provides employeeId       
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [totals, setTotals] = useState({ present: 0, absent: 0, halfDay: 0 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const year = selectedDate.year();
      const month = selectedDate.month() + 1;
      const response = await axios.get(`${baseUrl}api/monthly-report?year=${year}&month=${month}&employeeId=${auth.employeeId}`);
      setData(response.data);
      calculateTotals(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateTotals = (data) => {
    let present = 0, absent = 0, halfDay = 0;
    data.forEach(item => {
      if (item.AttendenceStatus === 'Present') present++;
      else if (item.AttendenceStatus === 'Absent') absent++;
      else if (item.AttendenceStatus === 'Half Day') halfDay++;
    });
    setTotals({ present, absent, halfDay });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRowColor = (status) => {
    switch (status) {
      case 'Present':
        return '#d4edda'; // light green
      case 'Absent':
        return '#f8d7da'; // light red
      case 'Half Day':
        return '#fff3cd'; // light yellow
      default:
        return 'white';
    }
  };

  return (
    <Box p={2} sx={{ overflowX: 'auto' }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Grid item xs={6} sx={{ pr: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year', 'month']}
              label="Select Month and Year"
              minDate={dayjs('2020-01-01')}
              maxDate={dayjs('2050-12-31')}
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  helperText={null}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      height: isMobile ? '2rem' : '2.5rem',
                      fontSize: isMobile ? '0.75rem' : '1rem',
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6} container direction="column" alignItems="flex-end" sx={{ pl: 1 }}>   
          <Box sx={{ backgroundColor: getRowColor('Present'), p: 0.5, mb: 1, borderRadius: '4px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'black' }}>Present: {totals.present}</Typography>
          </Box>
          <Box sx={{ backgroundColor: getRowColor('Absent'), p: 0.5, mb: 1, borderRadius: '4px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'black' }}>Absent: {totals.absent}</Typography>
          </Box>
          <Box sx={{ backgroundColor: getRowColor('Half Day'), p: 0.5, borderRadius: '4px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'black' }}>Half Day: {totals.halfDay}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
        <TableContainer component={Paper} className="table-container">
          <Table sx={{ minWidth: 'auto', tableLayout: 'auto' }} aria-label="monthly report table">
            <TableHead>
              <TableRow>
                {['Date & Day', 'In Time', 'Out Time', 'In Photo', 'Out Photo', 'In Location', 'Out Location'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem',      
                      padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px',        
                      fontWeight: 'bold',
                      borderRight: '1px solid #ddd',
                      whiteSpace: 'nowrap',
                      textAlign: isMobile ? 'center' : 'left',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => ( 
                <TableRow key={row.Date} sx={{ backgroundColor: getRowColor(row.AttendenceStatus) }}>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {`${dayjs(row.Date).format('dddd')}, ${dayjs(row.Date).format('DD/MM/YYYY')}`}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.IN_Timing}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.OUT_Timing}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.IN_Photo ? <a href={row.IN_Photo} target="_blank" rel="noopener noreferrer">View</a> : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.OUT_Photo ? <a href={row.OUT_Photo} target="_blank" rel="noopener noreferrer">View</a> : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.IN_Location ? <a href={row.IN_Location} target="_blank" rel="noopener noreferrer">View</a> : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd', textAlign: isMobile ? 'center' : 'left' }}>
                    {row.OUT_Location ? <a href={row.OUT_Location} target="_blank" rel="noopener noreferrer">View</a> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', fontSize: isMobile ? '0.75rem' : isTablet ? '0.875rem' : '1rem', width: '100%' }}>
        <TablePagination
          rowsPerPageOptions={[7, 15, 30]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ fontSize: 'inherit' }}
        />
      </Box>
    </Box>
  );
};

const theme = createTheme();

const App = () => (
  <ThemeProvider theme={theme}>
    <MonthlyReport />
  </ThemeProvider>
);

export default App;