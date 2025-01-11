import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Modal, TextField } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Logs = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { auth } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${baseUrl}logs/${auth.employeeId}`);
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (employeeId !== auth.employeeId) {
      alert('Invalid Employee ID');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}api/attendance/updateFromLog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logId: selectedLog._id, employeeId, action: selectedLog.action }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Attendance updated successfully');
        setModalOpen(false);
        fetchLogs();
      } else {
        alert('Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error updating attendance');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Logs
      </Typography>
      <List>
        {logs.map((log) => (
          <ListItem button key={log._id} onClick={() => handleLogClick(log)}>
            <ListItemText primary={`${log.action} at ${log.timestamp}`} secondary={`Status: ${log.status}`} />
          </ListItem>
        ))}
      </List>
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
            Confirm Log Update
          </Typography>
          <TextField
            label="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Logs;