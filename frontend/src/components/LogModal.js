import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, Select, MenuItem, FormControl, InputLabel, IconButton, Checkbox } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const LogModal = ({ modalOpen, setModalOpen, logs, fetchLogs, auth }) => {
  const [actionType, setActionType] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    if (logs && actionType) {
      const filtered = logs.filter(log => log.action === actionType);
      setFilteredLogs(filtered);
    }
  }, [logs, actionType]);

  const handleSelectAction = (action) => {
    setActionType(action);
    fetchLogs(action);
  };

  const handleLogConfirmation = (log) => {
    // Handle log confirmation logic here
  };

  return (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          View Logs
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="action">Action</InputLabel>
          <Select value={actionType} onChange={(e) => handleSelectAction(e.target.value)} label="Action">
            <MenuItem value="CheckIn">Check In</MenuItem>
            <MenuItem value="CheckOut">Check Out</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <Box key={index} display="flex" alignItems="center">
                <Checkbox />
                <Typography>{log.timestamp}</Typography>
                <IconButton onClick={() => handleLogConfirmation(log)}>
                  <CheckIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography>No data found for {actionType}.</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default LogModal;
