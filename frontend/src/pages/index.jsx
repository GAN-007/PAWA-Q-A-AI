import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const Header = dynamic(() => import('../components/Header'));
const Sidebar = dynamic(() => import('../components/Sidebar'));
const ChatInterface = dynamic(() => import('../components/chat/ChatInterface'));
const ModelSelector = dynamic(() => import('../components/models/ModelSelector'));
const SettingsModal = dynamic(() => import('../components/settings/SettingsModal'));
const ExportImport = dynamic(() => import('../components/conversation/ExportImport'));
const TenantSelector = dynamic(() => import('../components/tenant/TenantSelector'));

// Web Components for model cards
const ModelCard = typeof window !== 'undefined' ? require('../components/models/ModelCard').default : () => null;

export default function Home() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.1');
  const [useOllama, setUseOllama] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [theme, setTheme] = useState('system');
  
  // Load initial data
  useEffect(() => {
    // Initialize theme based on system preference or saved setting
    const savedTheme = localStorage.getItem('neuralnexusTheme') || 'system';
    setTheme(savedTheme);
    
    // Load chat history
    loadChatHistory();
    
    // Check if we're in a tenant context
    checkTenant();
    
    setLoading(false);
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load chat history from API
  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setChatHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load chat history');
    }
  };

  // Check for tenant information
  const checkTenant = async () => {
    try {
      const response = await fetch('/api/tenant/info');
      if (!response.ok) throw new Error('Not in a tenant context');
      const data = await response.json();
      setTenantInfo(data);
    } catch (err) {
      console.log('No tenant context found');
    }
  };

  // Handle chat selection
  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    // Load chat content
    fetch(`/api/history/${chatId}`)
      .then(res => res.json())
      .then(data => {
        // Update chat interface with loaded messages
        // This would typically be handled by a chat context
      });
  };

  // Handle model selection
  const handleModelSelect = (modelName, provider = 'ollama') => {
    setSelectedModel(modelName);
    setUseOllama(provider === 'ollama');
  };

  // Handle settings save
  const handleSettingsSave = (newSettings) => {
    // Update theme
    if (newSettings.theme) {
      setTheme(newSettings.theme);
    }
    
    // Update API keys
    if (newSettings.openaiKey) {
      // Save to secure storage or send to backend
    }
    
    // Update default model
    if (newSettings.defaultModel) {
      setSelectedModel(newSettings.defaultModel);
    }
  };

  // Handle export/import toggle
  const toggleExportImport = () => {
    setIsExportImportOpen(!isExportImportOpen);
  };

  // Handle model installation
  const handleModelInstall = async (modelName) => {
    try {
      const response = await fetch('/api/models/ollama/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName }),
      });
      
      if (!response.ok) throw new Error('Model installation failed');
      
      // Refresh models list
      const result = await response.json();
      // Update UI accordingly
    } catch (err) {
      console.error('Model installation error:', err);
      // Show error to user
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    // Reset chat context
    setCurrentChatId(null);
    // Create new chat
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' }),
    })
    .then(res => res.json())
    .then(data => {
      setCurrentChatId(data.id);
    });
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatId) => {
    try {
      await fetch(`/api/history/${chatId}`, {
        method: 'DELETE',
      });
      // Remove from history
      setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
      // If current chat was deleted, start new chat
      if (chatId === currentChatId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  // Handle chat rename
  const handleRenameChat = async (chatId, newName) => {
    try {
      await fetch(`/api/history/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newName }),
      });
      // Update in history
      setChatHistory(
        chatHistory.map(chat => 
          chat.id === chatId ? { ...chat, title: newName } : chat
        )
      );
    } catch (err) {
      console.error('Error renaming chat:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PAWA Q&A AI.....</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>PAWA - AI Q&A System</title>
        <meta name="description" content="A full-stack AI-powered Q&A system supporting local Ollama models and cloud LLMs." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          chatHistory={chatHistory}
          onChatSelect={handleChatSelect}
          onChatDelete={handleDeleteChat}
          onChatRename={handleRenameChat}
          onNewChat={handleNewChat}
          tenantInfo={tenantInfo}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onExportImportClick={toggleExportImport}
            tenantInfo={tenantInfo}
          />

          {/* Main content area */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Model Selector */}
              <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onSelectModel={handleModelSelect}
                  onModelInstall={handleModelInstall}
                />
              </div>

              {/* Chat interface */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ChatInterface 
                  model={selectedModel}
                  useOllama={useOllama}
                  chatId={currentChatId}
                  onChatUpdate={(newChatId) => setCurrentChatId(newChatId)}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleSettingsSave}
          />
        )}

        {/* Export/Import Modal */}
        {isExportImportOpen && (
          <ExportImport 
            onClose={() => setIsExportImportOpen(false)}
          />
        )}

        {/* Model Card Web Component */}
        <ModelCard 
          model="llama3.1" 
          description="A powerful open-source language model"
          size="4.7 GB"
          installed={true}
        />
      </div>
    </>
  );
}