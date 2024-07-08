import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Typography, Grid, IconButton, Menu, MenuItem } from '@mui/material';
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
  const [logs, setLogs] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const theme = useTheme();

  useEffect(() => {
    getLocation();
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/${auth.employeeId}`);
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchLogs = async (action) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(`http://localhost:5000/api/logs/${auth.employeeId}/${today}?action=${action}`);
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
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

  return (
    <Box sx={{ p: 2, [theme.breakpoints.up('md')]: { p: 4 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Attendance
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              label="Employee ID"
              value={auth.employeeId}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
            />
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => setModalOpen(true)}>View Logs</MenuItem>
            </Menu>
          </Box>
          <TextField
            label="Employee Name"
            value={auth.name}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            margin="normal"
          />
          <GeolocationDisplay geoLocation={geoLocation} geoError={geoError} />
          <CapturePhoto image={image} setImage={setImage} />
          <ActionButtons
            loading={loading}
            geoLocation={geoLocation}
            image={image}
            setLoading={setLoading}
            setAttendanceData={setAttendanceData}
            auth={auth}
          />
        </Grid>
      </Grid>
      <LogModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        logs={logs}
        fetchLogs={fetchLogs}
        auth={auth}
      />
    </Box>
  );
};

export default Attendance;
