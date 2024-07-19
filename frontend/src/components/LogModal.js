import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, CircularProgress, Button, TextField, ToggleButton, ToggleButtonGroup, Checkbox } from '@mui/material';
import axios from 'axios';

const LogModal = ({ modalOpen, setModalOpen, auth, refreshLogs, fetchTodayAttendance }) => {
  const [actionType, setActionType] = useState('Checked IN');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [inputEmployeeId, setInputEmployeeId] = useState('');
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    if (auth) {
      fetchLogs(actionType);
    }
  }, [actionType, auth, refreshLogs]);

  const fetchLogs = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/logs/${auth.employeeId}/${action}`);
      const logs = response.data.logs;
      setFilteredLogs(logs);
      const savedLogId = localStorage.getItem(`selectedLog-${auth.employeeId}-${action}`);
      if (savedLogId && logs.some(log => log._id === savedLogId)) {
        setSelectedLog(savedLogId);
      } else if (logs.length > 0) {
        setSelectedLog(logs[0]._id);
      } else {
        setSelectedLog(null);
      }
    } catch (error) {
      setError('Error fetching logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAction = (event, newAction) => {
    if (newAction !== null) {
      setActionType(newAction);
      setSelectedLog(null);
    }
  };

  const handleLogSelection = (logId) => {
    setSelectedLog(logId);
    localStorage.setItem(`selectedLog-${auth.employeeId}-${actionType}`, logId);
  };

  const handleSubmit = () => {
    if (selectedLog) {
      setConfirmationOpen(true);
    }
  };

  const handleVerification = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/logs/verify-employee-id', {
        employeeId: auth.employeeId,
        inputEmployeeId
      });
      if (response.data.verified) {
        await axios.post('http://localhost:8000/api/logs/update-selection', { logId: selectedLog });
        setConfirmationOpen(false);
        setModalOpen(false);
        alert('Log and attendance updated successfully');
        fetchTodayAttendance();
      } else {
        setVerificationError('Employee ID verification failed');
      }
    } catch (error) {
      setVerificationError('Error verifying employee ID');
      console.error('Error verifying employee ID:', error);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setVerificationError(null);
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
            Logs Data
          </Typography>
          <ToggleButtonGroup
            value={actionType}
            exclusive
            onChange={handleToggleAction}
            fullWidth
            sx={{ mt: 2 }}
          >
            <ToggleButton value="Checked IN" fullWidth>
              Check In
            </ToggleButton>
            <ToggleButton value="Checked OUT" fullWidth>
              Check Out
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <Box key={log._id} display="flex" flexDirection="column" sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center">
                    <Checkbox 
                      checked={selectedLog === log._id} 
                      onChange={() => handleLogSelection(log._id)} 
                    />
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
          <TextField
            label="Employee ID"
            value={inputEmployeeId}
            onChange={(e) => setInputEmployeeId(e.target.value)}
            fullWidth
            margin="normal"
          />
          {verificationError && <Typography color="error">{verificationError}</Typography>}
          <Button variant="contained" color="primary" onClick={handleVerification} sx={{ mt: 2 }}>
            Verify and Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default LogModal;
