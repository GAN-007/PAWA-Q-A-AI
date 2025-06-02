import React, { useEffect, useState } from 'react';
import { getModels } from '../lib/api';

const ModelSelector = ({ selectedModel, onSelectModel, provider, onSelectProvider }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState({
    ollama: false,
    openai: false,
    anthropic: false
  });

  useEffect(() => {
    fetchModels();
    checkProviders();
  }, [provider]);

  const checkProviders = async () => {
    try {
      const response = await fetch('/api/providers/status');
      const data = await response.json();
      setProviders({
        ollama: data.ollama.connected,
        openai: data.openai.connected,
        anthropic: data.anthropic.connected
      });
    } catch (error) {
      console.error('Error checking providers:', error);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/models/ollama';
      
      if (provider === 'openai') endpoint = '/api/models/openai';
      if (provider === 'anthropic') endpoint = '/api/models/anthropic';
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (provider === 'ollama') {
        setModels(data.models || []);
      } else {
        // Handle cloud models
        setModels([
          { name: provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet' },
          { name: provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku' }
        ]);
      }
    } catch (error) {
      console.error(`Error fetching ${provider} models:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider) => {
    if (newProvider === 'ollama' && !providers.ollama) {
      alert('Ollama service is not running. Please install and start Ollama first.');
      return;
    }
    
    if (newProvider === 'openai' && !providers.openai) {
      const apiKey = prompt('Enter your OpenAI API key:');
      if (apiKey) {
        // Save API key (in real app, store securely)
        localStorage.setItem('openai_api_key', apiKey);
        onSelectProvider(newProvider);
      }
      return;
    }
    
    if (newProvider === 'anthropic' && !providers.anthropic) {
      const apiKey = prompt('Enter your Anthropic API key:');
      if (apiKey) {
        localStorage.setItem('anthropic_api_key', apiKey);
        onSelectProvider(newProvider);
      }
      return;
    }
    
    onSelectProvider(newProvider);
  };

  return (
    <div className="flex space-x-4">
      <div>
        <label className="block text-sm font-medium mb-1">Provider</label>
        <div className="flex space-x-2">
          <button
            onClick={() => handleProviderChange('ollama')}
            className={`px-3 py-1 rounded-md ${
              provider === 'ollama' 
                ? 'bg-blue-500 text-white' 
                : providers.ollama ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'
            }`}
            disabled={provider === 'ollama' && !providers.ollama}
          >
            Ollama
          </button>
          <button
            onClick={() => handleProviderChange('openai')}
            className={`px-3 py-1 rounded-md ${
              provider === 'openai' 
                ? 'bg-blue-500 text-white' 
                : providers.openai ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'
            }`}
          >
            OpenAI
          </button>
          <button
            onClick={() => handleProviderChange('anthropic')}
            className={`px-3 py-1 rounded-md ${
              provider === 'anthropic' 
                ? 'bg-blue-500 text-white' 
                : providers.anthropic ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'
            }`}
          >
            Anthropic
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <select
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          className="p-2 border rounded-md"
          disabled={loading}
        >
          {loading ? (
            <option>Loading models...</option>
          ) : (
            models.map((model, index) => (
              <option key={index} value={model.name}>
                {model.name} {model.size ? `(${model.size})` : ''}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default ModelSelector;