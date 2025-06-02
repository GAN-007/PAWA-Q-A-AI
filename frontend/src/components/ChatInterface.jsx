import React, { useState, useEffect, useRef } from 'react';
import ModelSelector from './ModelSelector';
import { sendQuery } from '../lib/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.1');
  const [provider, setProvider] = useState('ollama');
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendQuery({
        question: input,
        model_name: selectedModel,
        provider: provider,
        temperature: temperature
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center mb-4">
        <ModelSelector 
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          provider={provider}
          onSelectProvider={setProvider}
        />
        <div className="ml-4">
          <label className="text-sm">Temperature: {temperature}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto' 
                : message.role === 'assistant'
                  ? 'bg-green-100'
                  : 'bg-red-100'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center">
            <div className="animate-pulse mr-2">●</div>
            <div className="animate-pulse mr-2">●</div>
            <div className="animate-pulse">●</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your question..."
          className="flex-1 p-3 border rounded-l-lg focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </span>
          ) : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;