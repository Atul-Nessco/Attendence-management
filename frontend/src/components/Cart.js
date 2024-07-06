import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea } from '@mui/material';

const Cart = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/attendance');
  };

  return (
    <Card onClick={handleClick} sx={{ maxWidth: 345, mt: 2 }}>
      <CardActionArea>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Attendance</Typography>
          <Typography variant="body1">
            Click here to mark your Attendance.
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default Cart;
