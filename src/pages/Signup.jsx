import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, User, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { apiRequest, setAuthSession } from "../api/client";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      setAuthSession(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box professional-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-badge">
            <Brain size={24} />
          </div>
          <h2>Topper<span>.ai</span></h2>
        </Link>

        <div className="auth-heading">
          <div className="auth-tag">
            <Sparkles size={14} />
            <span>Join 10,000+ Students</span>
          </div>
          <h1>Start your journey 🚀</h1>
          <p>Create your free Topper.ai account in 30 seconds.</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name..."
                required
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Create Password (min. 6 chars)</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=""
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Creating Account...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;