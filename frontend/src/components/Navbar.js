import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <img src="https://www.nesscoindia.com/Assets/images/logo.webp" alt="Nessco Logo" className="logo" style={{ height: '40px', verticalAlign: 'middle' }} />
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button color="inherit" component={Link} to="/attendance">Attendance</Button>
          <Button color="inherit" component={Link} to="/monthly-report">Monthly Report</Button>
          <Button color="inherit" component={Link} to="/another-route">More</Button>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenu}
          >
            <MenuIcon />
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
            <MenuItem onClick={handleClose} component={Link} to="/attendance">Attendance</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/monthly-report">Monthly Report</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/another-route">More</MenuItem>
          </Menu>
        </Box>
        <ProfileDropdown />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
