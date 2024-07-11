import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
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
          display: 'grid',
          gridTemplateColumns: isSmallScreen ? '1fr 1fr' : '1fr',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={isSmallScreen ? '100%' : isMediumScreen ? '80%' : '60%'}
            height="auto"
            videoConstraints={{ facingMode: 'user' }}
            style={{ borderRadius: theme.shape.borderRadius , paddingBottom: '24%'}}
          />
        </Box>
        {image && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={image}
              alt="Captured"
              style={{
                width: isSmallScreen ? '100%' : isMediumScreen ? '80%' : '60%',
                height: 'auto',
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <IconButton color="secondary" onClick={deleteImage}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <Button
        variant="contained"
        onClick={capture}
        sx={{ mt: 2 }}
      >
        <CameraAltIcon />
      </Button>
    </>
  );
};

export default CapturePhoto;
