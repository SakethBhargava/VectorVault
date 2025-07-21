import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LoginPage from './components/LoginPage';
import WorkflowBuilder from './components/WorkflowBuilder';
import './App.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/auth/me');
      setIsLoggedIn(true);
      setCurrentUser(data.username);
    } catch (error) {
      setIsLoggedIn(false);
      setCurrentUser('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (username, password) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      await api.post('/auth/login', formData);
      await checkAuth();
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    alert("You have been logged out. To log in again, please clear your browser cookies for localhost or restart your browser.");
  };

  if (isLoading) {
    return <div className="loading-screen">Authenticating...</div>;
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <WorkflowBuilder currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} isLoading={isLoading} />
      )}
    </div>
  );
}

export default App;