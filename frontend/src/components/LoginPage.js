import React, { useState } from 'react';

function LoginPage({ onLogin, isLoading }) {
  const [username, setUsername] = useState('user@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h1 className="login-title">Workflow Builder Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (user@example.com)"
            required
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (password123)"
            required
            className="login-input"
          />
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;