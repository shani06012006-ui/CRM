//src/pages/Login.tsx

import { useState, FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const getErrorMessage = (err: any): string => {
  if (!err.response) return "Can't reach the server. Is Django running on port 8000?";
  if (err.response.status === 401) return 'Wrong username or password.';
  return err.response.data?.detail || 'Something went wrong. Please try again.';
};

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        <div className="brand login-brand">
          <div className="brand-icon"><Rocket size={22} /></div>
          <span className="brand-name">SoftFire CRM</span>
        </div>

        <h1>Hey there! 👋</h1>
        <p className="sub">Welcome back! Please login to your account.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input-field"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login ✨'}
          </button>
        </form>
      </div>
    </div>
  );
};