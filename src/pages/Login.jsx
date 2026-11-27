import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { apiRequest, setAuthSession } from "../api/client";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      setAuthSession(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box professional-card">
        {/* Logo & Brand */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-badge">
            <Brain size={24} />
          </div>
          <h2>Topper<span>.ai</span></h2>
        </Link>

        {/* Header */}
        <div className="auth-heading">
          <div className="auth-tag">
            <Sparkles size={14} />
            <span>AI-Powered Learning</span>
          </div>
          <h1>Welcome back! 👋</h1>
          <p>Sign in to continue your personalized study journey.</p>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link will be sent to your registered email address."); }} className="forgot-link">
                Forgot password?
              </a>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-row remember-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button type="submit" className="auth-btn submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one for free</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;