import React from 'react';
import { Box, Button, CircularProgress, Grid } from '@mui/material';

const ActionButtons = ({ loading, geoLocation, image, setLoading, setAttendanceData, auth, setImage, checkedInData, checkedOutData, fetchTodayAttendance, onActionCompleted }) => {
  const baseUrl = process.env.REACT_APP_BASE_URL;

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
      const photoResponse = await fetch(`${baseUrl}api/upload-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      const photoData = await photoResponse.json();

      const response = await fetch(`${baseUrl}api/attendance`, {
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
          status: 'Normal',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.attendance);
        alert('Attendance recorded successfully');
        setImage(null); // Reset the image after successful check-in/out
        fetchTodayAttendance(); // Refresh the attendance data
        onActionCompleted(); // Trigger log refresh
      } else {
        alert('Failed to record attendance');
      }
    } catch (error) {
      alert('Error recording attendance');
    }
    setLoading(false);
  };

  return (
    <Box mt={2}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={6} md={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCheckInOut('IN')}
            disabled={loading || !geoLocation}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : checkedInData ? 'Update IN' : 'IN'}    
          </Button>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleCheckInOut('OUT')}
            disabled={loading || !geoLocation || !checkedInData}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : checkedOutData ? 'Update OUT' : 'OUT'} 
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActionButtons;