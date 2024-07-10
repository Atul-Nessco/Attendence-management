import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import Attendance from './pages/Attendance';
import MonthlyReport from './pages/MonthlyReport';
import PrivateRoute from './utils/PrivateRoute';
import AuthContext from './context/AuthContext';

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
        <Route path="/monthly-report" element={<PrivateRoute><MonthlyReport /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={auth ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;