import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load to restore session
    const storedToken = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    const storedCustomer = localStorage.getItem('customer');
    
    if (storedToken) {
      if (storedAdmin) {
        try {
          setAdmin(JSON.parse(storedAdmin));
        } catch (err) {
          localStorage.removeItem('admin');
        }
      }
      if (storedCustomer) {
        try {
          setCustomer(JSON.parse(storedCustomer));
        } catch (err) {
          localStorage.removeItem('customer');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { username, password });
      const { token, admin: adminData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.removeItem('customer');
      setCustomer(null);
      setAdmin(adminData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const customerLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/customer/login', { email, password });
      const { token, customer: customerData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('customer', JSON.stringify(customerData));
      localStorage.removeItem('admin');
      setAdmin(null);
      setCustomer(customerData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Authentication failed. Please verify credentials.';
      return { success: false, message: msg };
    }
  };

  const customerRegister = async (name, company_name, phone, email, password) => {
    try {
      const response = await api.post('/customer/register', { name, company_name, phone, email, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('customer');
    setAdmin(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ admin, customer, login, customerLogin, customerRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
