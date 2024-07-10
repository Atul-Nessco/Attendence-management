import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, Select, MenuItem, FormControl, InputLabel, Checkbox, CircularProgress, Button } from '@mui/material';
import axios from 'axios';

const LogModal = ({ modalOpen, setModalOpen, auth }) => {
  const [actionType, setActionType] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (auth && actionType) {
      fetchLogs(actionType);
    }
  }, [actionType, auth]);

  const fetchLogs = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/logs/${auth.employeeId}/${action}`);
      console.log(`Logs fetched:`, response.data.logs);
      setFilteredLogs(response.data.logs);
      // Pre-select the current data saved in the database
      const currentLog = response.data.logs.find(log => log.status === 'current');
      if (currentLog) {
        setSelectedLog(currentLog._id);
      }
    } catch (error) {
      setError('Error fetching logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAction = (event) => {
    setActionType(event.target.value);
    setSelectedLog(null);
  };

  const handleLogSelection = (log) => {
    setSelectedLog(log._id);
  };

  const handleSubmit = () => {
    if (selectedLog) {
      setConfirmationOpen(true);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setModalOpen(false);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 500,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" component="h2">
            View Logs
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="action">Action</InputLabel>
            <Select
              value={actionType}
              onChange={handleSelectAction}
              label="Action"
              id="action"
            >
              <MenuItem value="Checked IN">Check In</MenuItem>
              <MenuItem value="Checked OUT">Check Out</MenuItem>
              <MenuItem value="Login">Login</MenuItem>
              <MenuItem value="Logout">Logout</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <Box key={log._id} display="flex" flexDirection="column" sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center">
                    <Checkbox checked={selectedLog === log._id} onChange={() => handleLogSelection(log)} />
                    <Typography sx={{ flex: 1, ml: 1, fontWeight: 'bold' }}>{formatDate(log.timestamp)}</Typography>
                  </Box>
                  <Typography variant="body2">Employee ID: {log.employeeId}</Typography>
                  <Typography variant="body2">Employee Name: {log.employeeName}</Typography>
                  <Typography variant="body2">Action: {log.action}</Typography>
                  <Typography variant="body2">Status: {log.status}</Typography>
                  {log.geoLocation && (
                    <Typography variant="body2">Geo Location: <a href={log.geoLocation} target="_blank" rel="noopener noreferrer">View Location</a></Typography>
                  )}
                  {log.photoUrl && (
                    <Typography variant="body2">
                      Photo: <a href={log.photoUrl} target="_blank" rel="noopener noreferrer">View Photo</a>
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography>No data found for {actionType}.</Typography>
            )}
          </Box>
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }} fullWidth>
            Submit
          </Button>
        </Box>
      </Modal>
      <Modal open={confirmationOpen} onClose={handleConfirmationClose}>
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
          <Typography variant="h6" component="h2">
            Confirmation
          </Typography>
          <Typography sx={{ mt: 2 }}>Your log has been submitted successfully!</Typography>
          <Button variant="contained" color="primary" onClick={handleConfirmationClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default LogModal;
