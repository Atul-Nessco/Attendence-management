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
          display: 'flex',
          flexDirection: isSmallScreen ? 'row' : 'row',
          justifyContent: 'left',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            flexBasis: '50%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: theme.shape.borderRadius,
            }}
          />
        </Box>
        {image && (
          <Box
            sx={{
              flexBasis: '50%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={image}
              alt="Captured"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={capture}
        >
          <CameraAltIcon />
        </Button>
        {image && (
          <IconButton color="secondary" onClick={deleteImage}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </>
  );
};

export default CapturePhoto;
