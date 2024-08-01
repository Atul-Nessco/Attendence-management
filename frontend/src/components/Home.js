// src/pages/Home.js
import React from 'react';
import { Box, Grid } from '@mui/material';
import Cart from '../components/Cart';

const Home = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Cart title="Mark Attendance" path="/attendance" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Cart title="Monthly Report" path="/monthly-report" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
