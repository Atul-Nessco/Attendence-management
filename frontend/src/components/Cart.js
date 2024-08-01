// src/components/Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea } from '@mui/material';

const Cart = ({ title, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <Card onClick={handleClick} sx={{ maxWidth: 345, mt: 2 }}>
      <CardActionArea>
        <Box sx={{ p: 2 }}>
          <Typography variant="h4">{title}</Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default Cart;
