import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setAuth(storedUser);
    }
  }, []);

  const login = (user) => {
    setAuth(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = async () => {
    if (auth) {
      await fetch(`${baseUrl}api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: auth.employeeId, name: auth.name }),
      });
    }
    setAuth(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };