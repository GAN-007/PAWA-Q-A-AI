import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const [temperature, setTemperature] = useState(0.7);
  const [activeTab, setActiveTab] = useState('query');
  const [status, setStatus] = useState('Ready');
  const [selectedModel, setSelectedModel] = useState('default');
  const [file, setFile] = useState(null);
  const [responseLength, setResponseLength] = useState(100);
  const textareaRef = useRef(null);

  // Theme configurations with hover effects
  const themes = {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#2dd4bf',
      secondary: '#e2e8f0',
      border: '#d1d5db',
      accent: '#718096',
      error: '#fee2e2',
      errorText: '#ef4444',
      hover: '#a7f3d0', // Light hover color
    },
    dark: {
      background: '#1a202c',
      text: '#ffffff',
      primary: '#34d399',
      secondary: '#2d3748',
      border: '#4a5568',
      accent: '#a0aec0',
      error: '#7f1d1d',
      errorText: '#f87171',
      hover: '#059669', // Dark hover color
    },
    matrix: {
      background: '#000000',
      text: '#00ff00',
      primary: '#00ff00',
      secondary: '#001100',
      border: '#003300',
      accent: '#00aa00',
      error: '#330000',
      errorText: '#ff0000',
      hover: '#00aa00', // Matrix hover color
    },
  };

  // Update character count
  useEffect(() => {
    setCharCount(question.length);
  }, [question]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('history') || '[]');
    setHistory(savedHistory);
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async () => {
    setError(null);
    setAnswer('');
    if (!question.trim()) {
      setError('Question cannot be empty or just whitespace');
      return;
    }
    if (question.length < 10) {
      setError('Question must be at least 10 characters long');
      return;
    }
    if (question.length > 500) {
      setError('Question must not exceed 500 characters');
      return;
    }

    setLoading(true);
    setStatus('Fetching response...');
    try {
      const formData = new FormData();
      formData.append('text', question);
      formData.append('temperature', temperature);
      formData.append('model', selectedModel);
      formData.append('responseLength', responseLength);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('http://localhost:8001/api/v1/ask', {
        method: 'POST',
        body: formData,
        timeout: 30000
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail.message || 'Failed to fetch response');
      }

      const data = await res.json();
      // Simulate response streaming
      const words = data.answer.split(' ');
      let currentAnswer = '';
      const interval = setInterval(() => {
        if (words.length > 0) {
          currentAnswer += words.shift() + ' ';
          setAnswer(currentAnswer);
        } else {
          clearInterval(interval);
        }
      }, 100);

      setHistory([...history, { question, answer: data.answer, timestamp: new Date().toLocaleString() }]);
      setStatus('Response received');
      setFile(null);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const clearHistory = () => {
    setHistory([]);
    setStatus('History cleared');
    setTimeout(() => setStatus('Ready'), 2000);
  };

  const resetQuery = () => {
    setQuestion('');
    setAnswer('');
    setError(null);
    setStatus('Query reset');
    setTimeout(() => setStatus('Ready'), 2000);
  };

  const copyAnswer = () => {
    if (answer) {
      navigator.clipboard.writeText(answer);
      setStatus('Answer copied to clipboard');
      setTimeout(() => setStatus('Ready'), 2000);
    }
  };

  // Get current theme colors
  const currentTheme = themes[theme];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentTheme.background, color: currentTheme.text, fontFamily: 'Courier New, Courier, monospace' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: currentTheme.primary, borderBottom: `2px solid ${currentTheme.primary}`, paddingBottom: '0.5rem' }}>
            PAWA Q&A AI
          </h1>
          <p style={{ marginTop: '0.5rem', color: currentTheme.accent }}>Ask travel-related questions and get detailed answers.</p>
        </header>

        <nav style={{ marginBottom: '1rem' }}>
          {['query', 'history', 'settings'].map((tab) => (
            <button
              key={tab}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === tab ? currentTheme.primary : currentTheme.secondary,
                color: activeTab === tab ? currentTheme.background : currentTheme.accent,
                border: 'none',
                borderRadius: '0.375rem',
                marginRight: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                ':hover': { backgroundColor: currentTheme.hover, transform: 'scale(1.05)' },
              }}
              onClick={() => setActiveTab(tab)}
              aria-label={`Switch to ${tab} tab`}
              aria-pressed={activeTab === tab}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {activeTab === 'query' && (
          <section style={{ marginBottom: '1.5rem', transition: 'opacity 0.5s ease-in-out', opacity: 1 }}>
            <div style={{ backgroundColor: currentTheme.secondary, padding: '1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.border}` }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: currentTheme.primary, marginBottom: '1rem' }}>Query Interface</h2>
              
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%', backgroundColor: currentTheme.background, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, borderRadius: '0.375rem', transition: 'border-color 0.2s' }}
                aria-label="Select AI model"
              >
                <option value="default">Default GPT</option>
                <option value="model1">GPT 4</option>
                <option value="model2">GPT 4o</option>
                <option value="model1">Gemini 1.5 Pro</option>
                <option value="model2">Gemini 2.5 Flash</option>
                <option value="model1">Claude 3.5 Sonnet</option>
                <option value="model2">Claude 3.7 Sonnet</option>
                <option value="model1">Claude 4</option>
                
              </select>

              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '0.375rem',
                    resize: 'none',
                    outline: 'none',
                    color: currentTheme.text,
                    opacity: loading ? 0.5 : 1,
                    transition: 'border-color 0.2s',
                  }}
                  rows="4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question here (e.g., What documents do I need to travel from Kenya to Ireland?)"
                  disabled={loading}
                  aria-label="Enter your question"
                />
                <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', color: currentTheme.accent, fontSize: '0.75rem' }}>
                  {charCount}/500
                </span>
              </div>

              <input
                type="file"
                onChange={handleFileChange}
                style={{ marginTop: '1rem', color: currentTheme.text, transition: 'color 0.2s' }}
                disabled={loading}
                aria-label="Upload a file"
              />

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: loading ? currentTheme.secondary : currentTheme.primary,
                    color: currentTheme.background,
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s, transform 0.1s',
                    ':hover': { backgroundColor: currentTheme.hover, transform: 'scale(1.05)' },
                  }}
                  onClick={handleSubmit}
                  disabled={loading}
                  aria-label={loading ? 'Processing question' : 'Submit question'}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <svg style={{ animation: 'spin 1s linear infinite', height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Ask'
                  )}
                </button>
                <button
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: currentTheme.secondary,
                    color: currentTheme.text,
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, transform 0.1s',
                    ':hover': { backgroundColor: currentTheme.hover, transform: 'scale(1.05)' },
                  }}
                  onClick={resetQuery}
                  aria-label="Reset query"
                >
                  Reset
                </button>
              </div>
            </div>
            {error && (
              <div style={{ padding: '1rem', backgroundColor: currentTheme.error, border: `1px solid ${currentTheme.error}`, borderRadius: '0.375rem', marginTop: '1rem' }} role="alert">
                <p style={{ color: currentTheme.errorText }}>{error}</p>
              </div>
            )}
            {answer && (
              <div style={{ 
                backgroundColor: currentTheme.secondary, 
                padding: '1rem', 
                borderRadius: '0.375rem', 
                border: `1px solid ${currentTheme.border}`, 
                marginTop: '1rem',
                transition: 'opacity 0.5s ease-in-out',
                opacity: answer ? 1 : 0
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: currentTheme.primary, borderBottom: `2px solid ${currentTheme.primary}`, paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>
                  Response
                </h2>
                <div style={{ color: currentTheme.text }}>
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
                <button
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 1rem',
                    backgroundColor: currentTheme.secondary,
                    color: currentTheme.text,
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, transform 0.1s',
                    ':hover': { backgroundColor: currentTheme.hover, transform: 'scale(1.05)' },
                  }}
                  onClick={copyAnswer}
                  aria-label="Copy response to clipboard"
                >
                  Copy
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section style={{ marginTop: '1.5rem', transition: 'opacity 0.5s ease-in-out', opacity: 1 }}>
            <div style={{ backgroundColor: currentTheme.secondary, padding: '1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.border}` }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: currentTheme.primary, marginBottom: '1rem' }}>Conversation History</h2>
              <button
                onClick={clearHistory}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentTheme.error,
                  color: currentTheme.text,
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, transform 0.1s',
                  ':hover': { backgroundColor: currentTheme.hover, transform: 'scale(1.05)' },
                }}
                aria-label="Clear conversation history"
              >
                Clear History
              </button>
              <ul style={{ marginTop: '1rem' }}>
                {history.map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem', color: currentTheme.accent }}>
                    <strong>Q:</strong> {item.question} <br />
                    <strong>A:</strong> {item.answer} <br />
                    <em>{item.timestamp}</em>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section style={{ marginTop: '1.5rem', transition: 'opacity 0.5s ease-in-out', opacity: 1 }}>
            <div style={{ backgroundColor: currentTheme.secondary, padding: '1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.border}` }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: currentTheme.primary, marginBottom: '1rem' }}>Settings</h2>
              
              <label style={{ display: 'block', marginBottom: '1rem', color: currentTheme.accent }}>
                Theme:
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem', backgroundColor: currentTheme.background, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, borderRadius: '0.375rem', transition: 'border-color 0.2s' }}
                  aria-label="Select theme"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="matrix">Matrix</option>
                </select>
              </label>

              <div>
                <p style={{ marginBottom: '0.5rem', color: currentTheme.accent }}>
                  Temperature controls the randomness of the AI's responses. Lower values make it more deterministic, higher values more creative.
                </p>
                <label style={{ display: 'block', color: currentTheme.accent }}>
                  Temperature:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    style={{ marginLeft: '0.5rem' }}
                    aria-label="Adjust temperature"
                  />
                  <span style={{ marginLeft: '0.5rem' }}>{temperature.toFixed(1)}</span>
                </label>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.5rem', color: currentTheme.accent }}>
                  Response Length (words):
                </p>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={responseLength}
                  onChange={(e) => setResponseLength(parseInt(e.target.value))}
                  style={{ width: '100px', padding: '0.25rem', backgroundColor: currentTheme.background, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, borderRadius: '0.375rem', transition: 'border-color 0.2s' }}
                  aria-label="Set response length"
                />
              </div>
            </div>
          </section>
        )}

        <footer style={{ marginTop: '1.5rem', textAlign: 'center', color: currentTheme.accent }}>
          <p>Status: {status}</p>
        </footer>
      </div>
    </div>
  );
}