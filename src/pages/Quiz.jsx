import { useEffect, useState } from "react";
import { RotateCcw, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { quizQuestions as fallbackQuestions } from "../data/quizData";
import { apiRequest, getAuthToken } from "../api/client";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await apiRequest("/quiz/questions");
        setQuestions(
          data.questions?.length ? data.questions : fallbackQuestions
        );
      } catch {
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const question = questions[currentQuestion];

  const handleNext = async () => {
    if (selectedAnswer === null || !question) return;

    const updatedAnswers = [
      ...answers,
      { questionId: question.id, selectedAnswer },
    ];
    setAnswers(updatedAnswers);

    if (currentQuestion === questions.length - 1) {
      setSubmitting(true);
      setError("");
      try {
        const data = await apiRequest("/quiz/submit", {
          method: "POST",
          body: JSON.stringify({ answers: updatedAnswers }),
        });
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Topbar
            title="Diagnostic Quiz"
            subtitle="Let's understand your current learning level."
          />
          <p className="muted-empty">Loading diagnostic questions...</p>
        </main>
      </div>
    );
  }

  if (result) {
    const attempt = result.attempt;
    const isLoggedIn = Boolean(getAuthToken());

    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Topbar
            title="Quiz Results"
            subtitle="Here's how you performed!"
          />

          <div className="quiz-result">
            <div className="result-circle">
              <h1>{attempt.percentage}%</h1>
              <p>Your Score</p>
            </div>

            <h2>
              {attempt.percentage >= 70
                ? "Great job! 🎉"
                : "Keep practicing! 💪"}
            </h2>

            <p>
              You answered {attempt.score} out of {attempt.totalQuestions}{" "}
              questions correctly.
            </p>

            {result.saved ? (
              <div className="quiz-saved-badge">
                <CheckCircle2 size={16} />
                <span>Saved to your Dashboard & Progress</span>
              </div>
            ) : !isLoggedIn ? (
              <p className="quiz-guest-note">
                <Link to="/signup" className="inline-link">
                  Create a free account
                </Link>{" "}
                or{" "}
                <Link to="/login" className="inline-link">
                  Sign in
                </Link>{" "}
                to save your quiz analytics.
              </p>
            ) : null}

            {attempt.topicBreakdown?.length > 0 && (
              <div className="topic-breakdown">
                {attempt.topicBreakdown.map((item) => (
                  <div key={item.topic} className="topic-pill">
                    <span>{item.topic}</span>
                    <b>{item.percentage}%</b>
                  </div>
                ))}
              </div>
            )}

            <div className="result-buttons">
              <button onClick={restartQuiz}>
                <RotateCcw size={18} />
                Try Again
              </button>

              <Link to={isLoggedIn ? "/dashboard" : "/study-plan"}>
                {isLoggedIn ? "Go to Dashboard" : "View Study Plan"}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title="Diagnostic Quiz"
          subtitle="Let's understand your current learning level."
        />

        {error && (
          <div className="page-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="quiz-container">
          <div className="quiz-progress">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <div className="quiz-progress-bar">
              <div
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="quiz-card">
            <span className="quiz-topic">{question.topic}</span>

            <h2>{question.question}</h2>

            <div className="options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className={selectedAnswer === index ? "selected" : ""}
                  onClick={() => setSelectedAnswer(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="next-question"
              disabled={selectedAnswer === null || submitting}
              onClick={handleNext}
            >
              {submitting
                ? "Submitting..."
                : currentQuestion === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}

              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Quiz;
