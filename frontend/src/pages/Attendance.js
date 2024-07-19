import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AuthContext from '../context/AuthContext';
import CapturePhoto from '../components/CapturePhoto';
import LogModal from '../components/LogModal';
import ActionButtons from '../components/ActionButtons';
import GeolocationDisplay from '../components/GeolocationDisplay';

const Attendance = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [image, setImage] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [checkedInData, setCheckedInData] = useState(null);
  const [checkedOutData, setCheckedOutData] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshLogs, setRefreshLogs] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    getLocation();
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/today/${auth.employeeId}`);
      const data = await response.json();
      setCheckedInData(data.checkedIn);
      setCheckedOutData(data.checkedOut);
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGeoError(null);
        },
        (error) => {
          setGeoError('Error getting geolocation. Please enable location services.');
        }
      );
    } else {
      setGeoError('Geolocation is not supported by this browser');
    }
  };

  const getDriveViewerLink = (driveLink) => {
    const fileIdMatch = driveLink.match(/[-\w]{25,}/);
    return fileIdMatch ? `https://drive.google.com/thumbnail?id=${fileIdMatch[0]}` : driveLink;
  };

  const handleRefreshLogs = () => {
    setRefreshLogs(prev => !prev);
  };

  return (
    <Box sx={{ p: 2, [theme.breakpoints.up('md')]: { p: 4 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Attendance
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Welcome, {auth.name}</Typography>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { setModalOpen(true); handleMenuClose(); }}>View Logs</MenuItem>
            </Menu>
          </Box>
          <GeolocationDisplay geoLocation={geoLocation} geoError={geoError} />
          {isMobile && (
            <>
              <ActionButtons
                loading={loading}
                geoLocation={geoLocation}
                image={image}
                setLoading={setLoading}
                setAttendanceData={setAttendanceData}
                auth={auth}
                setImage={setImage}
                checkedInData={checkedInData}
                checkedOutData={checkedOutData}
                fetchTodayAttendance={fetchTodayAttendance}
                onActionCompleted={handleRefreshLogs}
              />
              <CapturePhoto image={image} setImage={setImage} />
            </>
          )}
          <Box mt={2}>
            <Typography variant="h6">Last Checked IN Data</Typography>
            {checkedInData ? (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body2">Time: {new Date(checkedInData.inTime).toLocaleString()}</Typography>
                  <Typography variant="body2">Geo Location: <a href={checkedInData.geoLocationIn} target="_blank" rel="noopener noreferrer">View Location</a></Typography>
                  <Typography variant="body2">Location Status: {checkedInData.locationStatusIn}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <div>
                    <img src={getDriveViewerLink(checkedInData.photoUrlIn)} alt="Check IN" style={{ width: '100%', height: 'auto' }} />
                  </div>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2">Data not found</Typography>
            )}
          </Box>
          <Box mt={2}>
            <Typography variant="h6">Last Checked OUT Data</Typography>
            {checkedOutData ? (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body2">Time: {new Date(checkedOutData.outTime).toLocaleString()}</Typography>
                  <Typography variant="body2">Geo Location: <a href={checkedOutData.geoLocationOut} target="_blank" rel="noopener noreferrer">View Location</a></Typography>
                  <Typography variant="body2">Location Status: {checkedOutData.locationStatusOut}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <div>
                    <img src={getDriveViewerLink(checkedOutData.photoUrlOut)} alt="Check OUT" style={{ width: '100%', height: 'auto' }} />
                  </div>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2">Data not found</Typography>
            )}
          </Box>
          {!isMobile && (
            <>
              <CapturePhoto image={image} setImage={setImage} />
              <ActionButtons
                loading={loading}
                geoLocation={geoLocation}
                image={image}
                setLoading={setLoading}
                setAttendanceData={setAttendanceData}
                auth={auth}
                setImage={setImage}
                checkedInData={checkedInData}
                checkedOutData={checkedOutData}
                fetchTodayAttendance={fetchTodayAttendance}
                onActionCompleted={handleRefreshLogs}
              />
            </>
          )}
        </Grid>
      </Grid>
      <LogModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        auth={auth}
        refreshLogs={refreshLogs}
        fetchTodayAttendance={fetchTodayAttendance}
      />
    </Box>
  );
};

export default Attendance;
