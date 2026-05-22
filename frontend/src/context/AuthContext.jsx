import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = 'https://attendwise-the-student-management-system-production.up.railway.app/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      subject: data.subject,
      rollNumber: data.rollNumber
    });
    return data;
  };

  const signupTeacher = async (name, email, password, subject) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, subject })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      subject: data.subject
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };

    // If it's not a FormData object, set Content-Type to application/json
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired, please log in again.');
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signupTeacher,
        logout,
        authenticatedFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
