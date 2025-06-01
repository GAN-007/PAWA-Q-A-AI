import React, { useState, useEffect } from 'react';

export default function Home() {
  // State management
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [models, setModels] = useState(['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'gemini-pro']);
  
  // Check if API key is set in localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('llm_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!isApiKeySet) {
      setError('Please set your API key first');
      return;
    }
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    // Set loading state
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      // Make API call to backend
      const res = await fetch('/api/qna/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: question,
          model: model
        }),
      });
      
      if (!res.ok) {
        throw new Error('API request failed');
      }
      
      const data = await res.json();
      
      if (!data.answer) {
        throw new Error('Empty response from API');
      }
      
      // Update history with new response
      const newEntry = { 
        question: question, 
        answer: data.answer,
        model: model,
        timestamp: new Date().toLocaleString()
      };
      
      setHistory([newEntry, ...history]);
      setResponse(data.answer);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle API key submission
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    // Save API key to localStorage
    localStorage.setItem('llm_api_key', apiKey);
    setIsApiKeySet(true);
    setError('');
  };
  
  // Clear API key
  const clearApiKey = () => {
    localStorage.removeItem('llm_api_key');
    setApiKey('');
    setIsApiKeySet(false);
  };
  
  // Clear history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the history?')) {
      setHistory([]);
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              PAWA Q&A AI
            </h1>
            <div className="flex items-center space-x-2">
              {!isApiKeySet ? (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 00-2.287.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Set API Key
                </button>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm mr-2">API Key Set</span>
                  <button
                    onClick={clearApiKey}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-300">Interactive Q&A system with LLM integration</p>
        </header>
        
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('history')}
            >
              History ({history.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Model Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                Select LLM Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Question Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">
                  Ask a Question
                </label>
                <textarea
                  id="question"
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || !isApiKeySet}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Ask Question'
                  )}
                </button>
              </div>
            </form>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 rounded">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {/* Response Display */}
            {response && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 animate-fade-in">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 110 2h0a1 1 0 110-2zm-1 3a1 1 0 011-1h0a1 1 0 110 2h0a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  AI Response
                </h2>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{response}</div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="text-sm text-gray-400 hover:text-gray-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2H5v8.2a2 2 0 00-1.9 2H2a1 1 0 00-1 1v1a2 2 0 002 2h14a2 2 0 002-2v-1a1 1 0 00-1-1h-1.9a2 2 0 00-1.99-2H10V4a1 1 0 000-2H8z" />
                      <path d="M0 17.7a.7.7 0 01.7-.7h18.6a.7.7 0 01.7.7v.6a.7.7 0 01-.7.7H0.7a.7.7 0 01-.7-.7v-.6z" />
                    </svg>
                    Copy to clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Query History</h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Clear History
                  </button>
                </div>
                
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{entry.question}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Model: {entry.model} • {entry.timestamp}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(entry.answer)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 2a1 1 0 000 2H5v8.2a2 2 0 00-1.9 2H2a1 1 0 00-1 1v1a2 2 0 002 2h14a2 2 0 002-2v-1a1 1 0 00-1-1h-1.9a2 2 0 00-1.99-2H10V4a1 1 0 000-2H8z" />
                            <path d="M0 17.7a.7.7 0 01.7-.7h18.6a.7.7 0 01.7.7v.6a.7.7 0 01-.7.7H0.7a.7.7 0 01-.7-.7v-.6z" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm">{entry.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
                <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-400">No history yet</h3>
                <p className="mt-1 text-sm text-gray-500">Your query history will appear here</p>
              </div>
            )}
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* API Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">API Settings</h2>
              
              <div className="space-y-4">
                {!isApiKeySet ? (
                  <>
                    <p className="text-gray-300">
                      Enter your API key for the LLM service you're using. This will be stored locally in your browser.
                    </p>
                    
                    <form onSubmit={handleApiKeySubmit} className="space-y-4">
                      <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                          API Key
                        </label>
                        <input
                          type="text"
                          id="apiKey"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API key..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all transform hover:scale-105"
                        >
                          Save API Key
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiKey('')}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-400">API key is set successfully.</p>
                    <p className="text-gray-300">
                      Your API key is stored locally in your browser. You can clear it at any time.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={clearApiKey}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Clear API Key
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Model Management */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Model Management</h2>
              
              <div className="space-y-4">
                <p className="text-gray-300">
                  Select from available models or add custom models.
                </p>
                
                <div>
                  <label htmlFor="modelList" className="block text-sm font-medium text-gray-300 mb-2">
                    Available Models
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {models.map((m) => (
                      <div 
                        key={m} 
                        className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                      >
                        <span>{m}</span>
                        <button
                          onClick={() => setModels(models.filter(model => model !== m))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 010-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newModel = e.target.elements.newModel.value.trim();
                    if (newModel && !models.includes(newModel)) {
                      setModels([...models, newModel]);
                      e.target.elements.newModel.value = '';
                    }
                  }}
                  className="flex space-x-3"
                >
                  <input
                    type="text"
                    name="newModel"
                    placeholder="Add new model name..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>PAWA Q&A AI • Powered by LLMs • v1.0.0</p>
        </footer>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}