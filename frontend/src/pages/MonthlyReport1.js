// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Typography,
//   Box,
//   Grid,
//   TextField,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   useTheme,
//   Dialog,
//   DialogContent,
//   TablePagination
// } from '@mui/material';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import AuthContext from '../context/AuthContext';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import './MonthlyReport.css'; // Import the CSS file

// const MonthlyReport = () => {
//   const { auth } = useContext(AuthContext);
//   const [data, setData] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [totals, setTotals] = useState({ present: 0, absent: 0, halfDay: 0, shortLeave: 0 });
//   const [open, setOpen] = useState(false);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

//   useEffect(() => {
//     fetchData();
//   }, [selectedDate]);

//   const fetchData = async () => {
//     try {
//       const year = selectedDate.year();
//       const month = selectedDate.month() + 1;
//       const response = await axios.get(`http://localhost:8000/api/monthly-report?year=${year}&month=${month}&employeeId=${auth.employeeId}`);
//       setData(response.data);
//       calculateTotals(response.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const calculateTotals = (data) => {
//     let present = 0, absent = 0, halfDay = 0, shortLeave = 0;
//     data.forEach(item => {
//       if (item.AttendenceStatus === 'Present') present++;
//       else if (item.AttendenceStatus === 'Absent') absent++;
//       else if (item.AttendenceStatus === 'Half Day') halfDay++;
//       else if (item.AttendenceStatus === 'Short Leave') shortLeave++;
//     });
//     setTotals({ present, absent, halfDay, shortLeave });
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const renderStatus = (status) => {
//     let color, abbreviation;
//     switch (status) {
//       case 'Present':
//         color = 'green';
//         abbreviation = 'P';
//         break;
//       case 'Absent':
//         color = 'red';
//         abbreviation = 'A';
//         break;
//       case 'Half Day':
//         color = 'orange';
//         abbreviation = 'HD';
//         break;
//       case 'Short Leave':
//         color = 'blue';
//         abbreviation = 'SL';
//         break;
//       default:
//         color = 'gray';
//         abbreviation = '';
//         break;
//     }
//     return (
//       <Typography className="status-box" sx={{ color, fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem'}}>
//         {abbreviation}
//       </Typography>
//     );
//   };

//   const handleImageClick = (src) => {
//     setCurrentImage(src);
//     setOpen(true);
//   };

//   return (
//     <Box p={2} sx={{ overflowX: 'auto' }}>
//       <Box mb={2}>
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DatePicker
//             views={['year', 'month']}
//             label="Select Month and Year"
//             minDate={dayjs('2020-01-01')}
//             maxDate={dayjs('2030-12-31')}
//             value={selectedDate}
//             onChange={(newValue) => setSelectedDate(newValue)}
//             renderInput={(params) => <TextField {...params} helperText={null} />}
//           />
//         </LocalizationProvider>
//       </Box>
//       <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
//         <TableContainer component={Paper} className="table-container">
//           <Table sx={{ minWidth: 'auto', tableLayout: 'auto' }} aria-label="monthly report table">
//             <TableHead>
//               <TableRow>
//                 {['', 'Date & Day', 'In Time', 'Out Time', 'In Photo', 'Out Photo'].map((header) => (
//                   <TableCell
//                     key={header}
//                     sx={{
//                       fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem',
//                       padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px',
//                       fontWeight: 'bold',
//                       borderRight: '1px solid #ddd',
//                       whiteSpace: 'nowrap',
//                     }}
//                   >
//                     {header}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
//                 <TableRow key={row.Date}>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {renderStatus(row.AttendenceStatus)}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {`${dayjs(row.Date).format('dddd')}, ${dayjs(row.Date).format('DD/MM/YYYY')}`}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {row.IN_Timing}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {row.OUT_Timing}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {row.IN_Photo ? <Button sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: '2px 4px' }} onClick={() => handleImageClick(row.IN_Photo)}>View</Button> : null}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: isMobile ? '2px 4px' : isTablet ? '4px 6px' : '6px 8px', borderRight: '1px solid #ddd' }}>
//                     {row.OUT_Photo ? <Button sx={{ fontSize: isMobile ? '0.65rem' : isTablet ? '0.75rem' : '0.875rem', padding: '2px 4px' }} onClick={() => handleImageClick(row.OUT_Photo)}>View</Button> : null}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', fontSize: isMobile ? '0.75rem' : isTablet ? '0.875rem' : '1rem', width: '100%' }}>
//         <TablePagination
//           rowsPerPageOptions={[10, 25, 50]}
//           component="div"
//           count={data.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           sx={{ fontSize: 'inherit' }}
//         />
//       </Box>
//       <Dialog open={open} onClose={() => setOpen(false)}>
//         <DialogContent>
//           {currentImage && <img src={currentImage} alt="View" style={{ width: '100%' }} />}
//         </DialogContent>
//       </Dialog>
//       <Typography variant="h6" sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>Totals:</Typography>
//       <Grid container spacing={2}>
//         <Grid item xs={6} sm={3}>
//           <Typography sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>Present: {totals.present}</Typography>
//         </Grid>
//         <Grid item xs={6} sm={3}>
//           <Typography sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>Absent: {totals.absent}</Typography>
//         </Grid>
//         <Grid item xs={6} sm={3}>
//           <Typography sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>Half Day: {totals.halfDay}</Typography>
//         </Grid>
//         <Grid item xs={6} sm={3}>
//           <Typography sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>Short Leave: {totals.shortLeave}</Typography>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default MonthlyReport;
