import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
  });
  const [role, setRole] = useState('farmer');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    // Construct payload
    const payload = {
      password: formData.password,
    };

    if (formData.mobile) payload.mobile = formData.mobile;

    if (isRegister) {
      payload.name = formData.name;
      payload.role = role;
    } else {
      if (formData.email) payload.email = formData.email;
    }

    try {
      const res = await axios.post(endpoint, payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data));

      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(false)}
          >
            Sign In
          </button>
          <button
            className={`toggle-btn ${isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(true)}
          >
            Sign Up
          </button>
        </div>

        <div className="form-header">
          <p>{isRegister ? 'Register to start using the platform' : 'Welcome back to Farm2Fork'}</p>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleAuth}>
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={isRegister}
                className="modern-input"
                placeholder="e.g. Bhavya Shah"
              />
            </div>
          )}

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="modern-input"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="modern-input"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <div className="role-options">
                {['farmer', 'distributor', 'retailer', 'consumer'].map(r => (
                  <label key={r} className={`radio-label ${role === r ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}
