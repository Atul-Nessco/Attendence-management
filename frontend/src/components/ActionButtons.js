import React from 'react';
import { Box, Button, CircularProgress, Grid, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

const ActionButtons = ({ loading, geoLocation, image, setLoading, setAttendanceData, auth }) => {
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
          status: 'normal',
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

  const clearData = async (type) => {
    // Clear data logic here
  };

  const deleteData = async (type) => {
    // Delete data logic here
  };

  return (
    <Box mt={2}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCheckInOut('IN')}
            disabled={loading || !geoLocation}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Check IN'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <IconButton onClick={() => clearData('IN')} sx={{ mr: 2 }}>
              <ClearIcon />
            </IconButton>
            <IconButton onClick={() => deleteData('IN')} sx={{ mr: 2 }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleCheckInOut('OUT')}
            disabled={loading || !geoLocation}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Check OUT'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <IconButton onClick={() => clearData('OUT')} sx={{ mr: 2 }}>
              <ClearIcon />
            </IconButton>
            <IconButton onClick={() => deleteData('OUT')} sx={{ mr: 2 }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActionButtons;
