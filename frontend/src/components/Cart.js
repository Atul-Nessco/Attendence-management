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
          <Typography variant="h4">Mark Attendance</Typography>
          <Typography variant="body1">
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default Cart;
