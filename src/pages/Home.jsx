import { Link } from "react-router-dom";
import {
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getAuthToken } from "../api/client";

function Home() {
  const isLoggedIn = Boolean(getAuthToken());

  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-logo">
          <Brain size={28} />
          <h2>Topper<span>.ai</span></h2>
        </div>

        <div className="home-nav-links">
          <a href="#features">Features</a>
          {isLoggedIn ? (
            <Link to="/dashboard" className="nav-signup">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="nav-signup">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="hero">
        <div className="hero-badge">
          <Sparkles size={16} />
          AI-Powered Personalized Learning
        </div>

        <h1>
          Study Smarter.
          <br />
          Become a <span>Topper.</span>
        </h1>

        <p>
          Topper.ai analyzes your strengths and weaknesses, creates a
          personalized study plan, and guides you toward your learning goals.
        </p>

        <div className="hero-buttons">
          <Link to="/signup" className="primary-btn">
            Start Learning Free
            <ArrowRight size={19} />
          </Link>

          <Link to="/quiz" className="secondary-btn">
            Take Diagnostic Quiz
          </Link>
        </div>

        <div className="hero-stats">
          <div>
            <h3>Personalized</h3>
            <p>Study Plans</p>
          </div>

          <div>
            <h3>AI Powered</h3>
            <p>Recommendations</p>
          </div>

          <div>
            <h3>Smart</h3>
            <p>Progress Tracking</p>
          </div>
        </div>
      </main>

      <section className="features-section" id="features">
        <div className="section-heading">
          <p>SMART LEARNING</p>
          <h2>Everything you need to improve</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={25} />
            </div>
            <h3>Know Your Weak Areas</h3>
            <p>
              Take diagnostic quizzes and discover exactly which topics need
              more attention.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Target size={25} />
            </div>
            <h3>Personal Study Plans</h3>
            <p>
              Get a learning roadmap designed according to your performance and
              goals.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={25} />
            </div>
            <h3>Track Your Growth</h3>
            <p>
              Monitor your progress and stay motivated with clear performance
              insights.
            </p>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div>
          <p className="small-label">WHY TOPPER.AI?</p>
          <h2>Your personal mentor, available anytime.</h2>

          <div className="benefit-list">
            <p>
              <CheckCircle2 size={20} />
              Personalized learning based on your performance
            </p>

            <p>
              <CheckCircle2 size={20} />
              Clear daily tasks instead of confusing study plans
            </p>

            <p>
              <CheckCircle2 size={20} />
              Smart recommendations for what to learn next
            </p>
          </div>
        </div>

        <div className="why-card">
          <div className="ai-avatar">
            <Brain size={45} />
          </div>

          <h3>Hey! I'm your AI Mentor 👋</h3>

          <p>
            Complete your diagnostic quiz and I'll create your personalized
            learning journey.
          </p>

          <Link to="/quiz">
            Start Your Journey <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;