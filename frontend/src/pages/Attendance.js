import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Typography, Grid, CircularProgress, IconButton, Menu, MenuItem, Modal, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import Webcam from 'react-webcam';
import AuthContext from '../context/AuthContext';

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
  const [confirmEmployeeId, setConfirmEmployeeId] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [status, setStatus] = useState('normal');

  const theme = useTheme();
  const webcamRef = React.useRef(null);

  useEffect(() => {
    getLocation();
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/${auth.employeeId}`);
      const data = await response.json();
      setAttendanceData(data);
      fetchLogs();
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/logs/${auth.employeeId}`);
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const deleteImage = () => {
    setImage(null);
  };

  const clearData = async (type) => {
    if (type === 'IN') {
      setAttendanceData({ ...attendanceData, inTime: null, geoLocationIn: null, photoUrlIn: null });
    } else if (type === 'OUT') {
      setAttendanceData({ ...attendanceData, outTime: null, geoLocationOut: null, photoUrlOut: null });
    }

    await updateDatabase(type, 'clear');
  };

  const deleteData = async (type) => {
    if (type === 'IN') {
      setAttendanceData({ ...attendanceData, inTime: null, geoLocationIn: null, photoUrlIn: null });
    } else if (type === 'OUT') {
      setAttendanceData({ ...attendanceData, outTime: null, geoLocationOut: null, photoUrlOut: null });
    }

    await updateDatabase(type, 'delete');
  };

  const updateDatabase = async (type, action) => {
    try {
      await fetch('http://localhost:5000/api/attendance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: auth.employeeId,
          type,
          action,
          status: 'normal',
        }),
      });
    } catch (error) {
      console.error(`Error updating database for ${action} action:`, error);
    }
  };

  const handleCheckInOut = async (type) => {
    if (!geoLocation) {
      alert('Geolocation is required');
      return;
    }
    if (!image) {
      alert('Photo is required');
      return;
    }
    setLoading(true);
    try {
      const photoResponse = await fetch('http://localhost:5000/api/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      const photoData = await photoResponse.json();

      const response = await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: auth.employeeId,
          employeeName: auth.name,
          geoLocation,
          photo: photoData.photoUrl,
          type,
          status,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.attendance);
        alert('Attendance recorded successfully');
      } else {
        alert('Failed to record attendance');
      }
    } catch (error) {
      alert('Error recording attendance');
    }
    setLoading(false);
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

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLogConfirmation = (log) => {
    setConfirmEmployeeId(log.employeeId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleConfirm = async () => {
    if (confirmEmployeeId === auth.employeeId) {
      setStatus('append');
      await updateDatabase('IN', 'append');
      setModalOpen(false);
    } else {
      alert('Incorrect Employee ID or Email');
    }
  };

  return (
    <Box sx={{ p: 2, [theme.breakpoints.up('md')]: { p: 4 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Attendance
            
      <IconButton onClick={handleMenuClick}  style={{ display: 'flex', justifyContent: 'flex-end'}}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              {logs.map((log, index) => (
                <MenuItem key={index} onClick={() => handleLogConfirmation(log)}>
                  <Checkbox />
                  {log.action} - {log.timestamp}
                  <IconButton onClick={() => handleLogConfirmation(log)}>
                    <CheckIcon />
                  </IconButton>
                </MenuItem>
              ))}
            </Menu>
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
          {geoError ? (
            <Typography color="error" variant="body1">
              {geoError}
            </Typography>
          ) : (
            geoLocation && (
              <Typography variant="body1">
                Latitude: {geoLocation.latitude}, Longitude: {geoLocation.longitude}
              </Typography>
            )
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="auto"
              videoConstraints={{ facingMode: 'user' }}
              style={{ borderRadius: theme.shape.borderRadius }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={capture} disabled={!geoLocation}>
              Capture Photo
            </Button>
          </Box>
          {image && (
            <Box mt={2} sx={{ textAlign: 'center' }}>
              <img src={image} alt="Captured" style={{ width: '100%', borderRadius: theme.shape.borderRadius }} />
              <IconButton color="secondary" onClick={deleteImage}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleCheckInOut('IN')}
              disabled={loading || !geoLocation}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Check IN'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleCheckInOut('OUT')}
              disabled={loading || !geoLocation}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Check OUT'}
            </Button>
          </Box>
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <IconButton onClick={() => clearData('IN')} sx={{ mr: 2 }}>
              <ClearIcon />
              Clear IN
            </IconButton>
            <IconButton onClick={() => deleteData('IN')} sx={{ mr: 2 }}>
              <DeleteIcon />
              Delete IN
            </IconButton>
            <IconButton onClick={() => clearData('OUT')} sx={{ mr: 2 }}>
              <ClearIcon />
              Clear OUT
            </IconButton>
            <IconButton onClick={() => deleteData('OUT')} sx={{ mr: 2 }}>
              <DeleteIcon />
              Delete OUT
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Confirm Employee ID
          </Typography>
          <TextField
            label="Employee ID"
            fullWidth
            margin="normal"
            value={confirmEmployeeId}
            onChange={(e) => setConfirmEmployeeId(e.target.value)}
          />
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Attendance;
