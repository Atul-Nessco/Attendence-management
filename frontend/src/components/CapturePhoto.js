import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import Webcam from 'react-webcam';

const CapturePhoto = ({ image, setImage }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef, setImage]);

  const deleteImage = () => {
    setImage(null);
  };

  return (
    <>
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: isLargeScreen ? 'row' : 'column',
        justifyContent: 'Left',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={isSmallScreen ? '100%' : isMediumScreen ? '80%' : '60%'}
        height="auto"
        videoConstraints={{ facingMode: 'user' }}
        style={{ borderRadius: theme.shape.borderRadius }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {image && (
          <Box sx={{ textAlign: 'center', mt: isLargeScreen ? 0 : 2 }}>
            <img
              src={image}
              alt="Captured"
              style={{
                width: isSmallScreen ? '100%' : isMediumScreen ? '80%' : '90%',
                height: 'auto',
                borderRadius: theme.shape.borderRadius,
                marginLeft: isLargeScreen ? 16 : 0, // Add space between image and webcam on large screens
              }}
            />
            <IconButton color="secondary" onClick={deleteImage}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
        
      </Box>
    </Box>
    <Button variant="contained" onClick={capture} sx={{ mb: isLargeScreen ? 0 : 2 }}>
    Capture Photo
  </Button>
  </>
  );
};

export default CapturePhoto;
