import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Menu, MenuItem, IconButton, Typography, Modal, Box, TextField, Button, InputAdornment } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const ProfileDropdown = () => {
  const { auth, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/change-password', {
        employeeId: auth.employeeId,
        currentPassword,
        newPassword,
      });
      setSuccessMessage(response.data.message);
      alert('Password changed successfully. You will be logged out now.');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      logout(); // Log out the user after changing the password
    } catch (error) {
      setPasswordError(error.response.data.message || 'Error changing password');
    }
  };

  const handleModalClose = () => {
    setPasswordModalOpen(false);
    setPasswordError('');
    setSuccessMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <IconButton
        edge="end"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <Typography variant="body1">{auth.name}</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">ID: {auth.employeeId}</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">Department: {auth.department}</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setPasswordModalOpen(true); handleClose(); }}>
          <Typography variant="body2">Change Password</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      <Modal open={passwordModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {passwordError && <Typography color="error">{passwordError}</Typography>}
          {successMessage && <Typography color="primary">{successMessage}</Typography>}
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handlePasswordChange}>
            Change Password
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ProfileDropdown;
