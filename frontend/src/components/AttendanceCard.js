import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, TextField } from '@mui/material';
import axios from 'axios';

const AttendanceCard = ({ user }) => {
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleCapture = (event) => {
    setPhoto(event.target.files[0]);
  };

  const handleAttendance = async (type) => {
    const formData = new FormData();
    formData.append('employeeId', user.employeeId);
    formData.append('employeeName', user.name);
    formData.append('type', type);
    formData.append('photo', photo);
    formData.append('location', location);
    formData.append('time', new Date().toISOString());

    try {
      await axios.post('/api/attendance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(`${type} recorded successfully`);
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Attendance</Typography>
        <Button variant="contained" component="label">
          Capture Photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={handleCapture} />
        </Button>
        <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth margin="normal" />
        <Button variant="contained" color="primary" onClick={() => handleAttendance('IN')}>Clock In</Button>
        <Button variant="contained" color="secondary" onClick={() => handleAttendance('OUT')}>Clock Out</Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
