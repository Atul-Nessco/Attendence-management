import React from 'react';
import { Box, Typography } from '@mui/material';
import Cart from '../components/Cart';

const Home = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* <Typography variant="h4" gutterBottom>
        Welcome to the Home Page
      </Typography> */}
      <Cart />
    </Box>
  );
};

export default Home;