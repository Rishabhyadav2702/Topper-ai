import { useState, useRef, useEffect } from "react";
import { Send, Brain, Sparkles, RotateCcw, User, Bot, AlertCircle } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { apiRequest, getAuthToken } from "../api/client";

const QUICK_TOPICS = [
  "Explain JavaScript Closures simply",
  "How to prepare for Data Structures?",
  "What is the best 4-hour study routine?",
  "Tips to solve Physics numericals without getting stuck",
];

const WELCOME_MESSAGE = () => ({
  sender: "ai",
  text: "Hello! 👋 I'm your Topper.ai Mentor. I can help explain difficult topics, suggest study strategies, or answer your academic doubts. What are you studying today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

function Mentor() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!getAuthToken()) return;
      try {
        const data = await apiRequest("/mentor/history");
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((msg) => ({
              sender: msg.sender,
              text: msg.text,
              timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        }
      } catch (err) {
        console.warn("Could not load mentor history:", err.message);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage = {
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setError("");
    setIsTyping(true);

    try {
      const data = await apiRequest("/mentor/chat", {
        method: "POST",
        body: JSON.stringify({ message: textToSend }),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("AI Mentor error:", err);
      setError("AI Mentor server is unavailable. Please ensure backend is running.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I am having trouble connecting to my backend brain right now. Please verify that your backend server is running on http://localhost:5001! 🔌",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (getAuthToken()) {
      try {
        await apiRequest("/mentor/history", { method: "DELETE" });
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    setMessages([
      {
        sender: "ai",
        text: "Chat cleared! What new topic would you like to explore together?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title="AI Mentor 🎓"
          subtitle="Your 24/7 personal learning assistant powered by Topper.ai"
        />

        <div className="mentor-chat professional-chat">
          <div className="chat-header">
            <div className="chat-ai-icon">
              <Brain size={24} />
            </div>

            <div className="chat-header-info">
              <div className="header-title-row">
                <h3>Topper.ai Academic Mentor</h3>
                <span className="ai-badge">
                  <Sparkles size={12} /> Active
                </span>
              </div>
              <p>● Ready to answer questions on Coding, Science, Math & Study Plans</p>
            </div>

            <button
              className="clear-chat-btn"
              onClick={handleClearChat}
              title="Clear conversation"
            >
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>

          {messages.length <= 2 && (
            <div className="quick-topics-bar">
              <span className="quick-label">Try asking:</span>
              <div className="quick-pills">
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    className="quick-pill"
                    onClick={() => handleSend(topic)}
                    disabled={isTyping}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mentor-error-notice">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message-row ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === "ai" ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={`message ${message.sender}`}>
                  <div className="message-content" style={{ whiteSpace: "pre-line" }}>
                    {message.text}
                  </div>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row ai">
                <div className="message-avatar">
                  <Bot size={18} />
                </div>
                <div className="message ai typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question, doubt, or request a concept explanation..."
              disabled={isTyping}
            />

            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Mentor;
