import React, { useState, useEffect } from 'react';
import { useModels } from '../../hooks/useModels';
import { sendQuery } from '../../lib/fetcher';
import Toast from './Toast';

export default function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    theme: 'light',
    defaultModel: 'llama3.1',
    streaming: true,
    openaiKey: '',
    anthropicKey: '',
    ollamaHost: 'http://localhost:11434'
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [providersStatus, setProvidersStatus] = useState({
    ollama: false,
    openai: false,
    anthropic: false
  });
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const { 
    fetchModels: loadOllamaModels, 
    installModel, 
    removeModel 
  } = useModels();

  // Load initial settings and providers status
  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('neuralnexusSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check providers status
    checkProvidersStatus();
    
    // Load installed models
    loadOllamaModels();
  }, []);

  const checkProvidersStatus = async () => {
    try {
      const response = await fetch('/api/providers/status');
      const data = await response.json();
      setProvidersStatus(data);
    } catch (error) {
      console.error('Error checking providers:', error);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSave = () => {
    // Save settings
    localStorage.setItem('neuralnexusSettings', JSON.stringify(settings));
    setToastMessage('Settings saved successfully!');
    setShowToast(true);
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  const onInstallModel = async (modelName) => {
    setLoading(true);
    try {
      // Show progress toast
      showToastMessage(`Installing ${modelName}...`, 'info');
      
      // Install the model using the hook's function
      await installModel(modelName);
      
      // Refresh models list
      await loadOllamaModels();
      
      // Show success toast
      showToastMessage(`Model ${modelName} installed successfully!`, 'success');
    } catch (error) {
      console.error('Error installing model:', error);
      showToastMessage(`Error installing ${modelName}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRemoveModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to remove ${modelName}?`)) return;
    
    setLoading(true);
    try {
      // Show progress toast
      showToastMessage(`Removing ${modelName}...`, 'info');
      
      // Remove the model using the hook's function
      await removeModel(modelName);
      
      // Refresh models list
      await loadOllamaModels();
      
      // Show success toast
      showToastMessage(`Model ${modelName} removed successfully!`, 'success');
    } catch (error) {
      console.error('Error removing model:', error);
      showToastMessage(`Error removing ${modelName}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderKeyChange = async (provider, key) => {
    setLoading(true);
    try {
      // Send API request to update provider key
      const response = await sendQuery({
        provider,
        api_key: key
      });
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [`${provider}Key`]: key
      }));
      
      // Show success message
      showToastMessage(`${provider} key updated successfully!`, 'success');
    } catch (error) {
      console.error(`Error updating ${provider} key:`, error);
      showToastMessage(`Error updating ${provider} key: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
      
      {/* Theme Selection */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Theme
        </label>
        <select
          id="theme"
          value={settings.theme}
          onChange={(e) => setSettings({...settings, theme: e.target.value})}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white rounded-md"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Default</option>
        </select>
      </div>
      
      {/* Default Model Selection */}
      <div>
        <label htmlFor="default-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Model
        </label>
        <select
          id="default-model"
          value={settings.defaultModel}
          onChange={(e) => setSettings({...settings, defaultModel: e.target.value})}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white rounded-md"
        >
          {models.map((model, index) => (
            <option key={index} value={model.name}>
              {model.name} ({model.size})
            </option>
          ))}
        </select>
      </div>
      
      {/* Streaming Toggle */}
      <div className="flex items-center">
        <input
          id="streaming"
          type="checkbox"
          checked={settings.streaming}
          onChange={(e) => setSettings({...settings, streaming: e.target.checked})}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="streaming" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Enable Streaming Responses
        </label>
      </div>
      
      {/* Ollama Host Configuration */}
      <div>
        <label htmlFor="ollama-host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ollama Host
        </label>
        <input
          type="text"
          id="ollama-host"
          value={settings.ollamaHost}
          onChange={(e) => setSettings({...settings, ollamaHost: e.target.value})}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="http://localhost:11434"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          The URL where your Ollama service is running
        </p>
      </div>
    </div>
  );

  const renderModelManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Model Management</h3>
      
      {/* Installed Models */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Installed Models</h4>
          <button 
            onClick={loadOllamaModels}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : models.length > 0 ? (
          <ul className="space-y-2">
            {models.map((model, index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{model.name}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({model.size})</span>
                </div>
                <button
                  onClick={() => onRemoveModel(model.name)}
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No models installed</p>
        )}
      </div>
      
      {/* Model Installation */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Install New Model</h4>
        <div className="grid grid-cols-2 gap-3">
          {['llama3.1', 'gemma3', 'qwen3', 'llama4', 'devstral'].map(model => (
            <button
              key={model}
              onClick={() => onInstallModel(model)}
              disabled={loading || !providersStatus.ollama}
              className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {model}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click to install a recommended model. Installation may take some time depending on model size.
        </p>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Keys</h3>
      
      {/* OpenAI API Key */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            OpenAI API Key
          </label>
          <div className={`text-xs px-2 py-1 rounded-full ${providersStatus.openai ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
            {providersStatus.openai ? 'Connected' : 'Not Connected'}
          </div>
        </div>
        <input
          type="password"
          id="openai-key"
          value={settings.openaiKey}
          onChange={(e) => setSettings({...settings, openaiKey: e.target.value})}
          placeholder="sk-xxxxx..."
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Required for using GPT models. You can get one from{' '}
          <a href="https://platform.openai.com/api_keys"  target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            OpenAI Dashboard
          </a>
        </p>
      </div>
      
      {/* Anthropic API Key */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="anthropic-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Anthropic API Key
          </label>
          <div className={`text-xs px-2 py-1 rounded-full ${providersStatus.anthropic ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
            {providersStatus.anthropic ? 'Connected' : 'Not Connected'}
          </div>
        </div>
        <input
          type="password"
          id="anthropic-key"
          value={settings.anthropicKey}
          onChange={(e) => setSettings({...settings, anthropicKey: e.target.value})}
          placeholder="xxxxx..."
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Required for using Claude models. You can get one from{' '}
          <a href="https://console.anthropic.com/account/keys"  target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Anthropic Console
          </a>
        </p>
      </div>
      
      {/* API Key Status */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection Status</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${providersStatus.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">OpenAI: {providersStatus.openai ? 'Connected' : 'Not Connected'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${providersStatus.anthropic ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Anthropic: {providersStatus.anthropic ? 'Connected' : 'Not Connected'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150"
              aria-label="Close settings"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-4 overflow-x-auto">
              {['general', 'models', 'keys'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'models' && renderModelManagement()}
            {activeTab === 'keys' && renderApiKeys()}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          duration={5000} 
        />
      )}
    </div>
  );
}