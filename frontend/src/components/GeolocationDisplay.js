import React from 'react';
import { Typography } from '@mui/material';

const GeolocationDisplay = ({ geoLocation, geoError }) => {
  return geoError ? (
    <Typography color="error" variant="body1">
      {geoError}
    </Typography>
  ) : (
    geoLocation && (
      <Typography variant="body1">
        Latitude: {geoLocation.latitude}, Longitude: {geoLocation.longitude}
      </Typography>
    )
  );
};

export default GeolocationDisplay;
