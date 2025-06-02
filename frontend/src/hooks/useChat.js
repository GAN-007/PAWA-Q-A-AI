import { useState, useEffect, useCallback } from 'react';
import { sendQuery } from '../lib/fetcher';
import { useToast } from './useToast';
import { v4 as uuidv4 } from 'uuid';

export const useChat = (initialModel = 'llama3.1') => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [provider, setProvider] = useState('ollama');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [streaming, setStreaming] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationId] = useState(uuidv4());
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTab, setCurrentTab] = useState('chat');
  const [attachments, setAttachments] = useState([]);
  const [conversationName, setConversationName] = useState('New Conversation');
  const [websocket, setWebsocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [streamController, setStreamController] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tenantId, setTenantId] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    theme: 'system',
    fontSize: 'normal',
    model: 'llama3.1',
    streaming: true
  });
  const [conversationHistory, setConversationHistory] = useState([]);
  const { showToast } = useToast();

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('neuralnexusPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setUserPreferences(parsed);
      setSelectedModel(parsed.model || initialModel);
      setStreaming(parsed.streaming || true);
      
      // Apply theme
      if (parsed.theme === 'dark' || 
          (parsed.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
    
    // Load chat history
    loadChatHistory();
    
    // Initialize WebSocket connection
    initWebSocket();
    
    // Check tenant context
    checkTenant();
    
    // Load user preferences from backend
    loadUserPreferences();
  }, []);

  // Initialize WebSocket for streaming responses
  const initWebSocket = () => {
    const ws = new WebSocket('wss://neuralnexus.ai/ws');
    
    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stream' && data.conversationId === conversationId) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + data.chunk
                }
              ];
            } else {
              return [
                ...prev,
                {
                  role: 'assistant',
                  content: data.chunk
                }
              ];
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };
    
    setWebsocket(ws);
    return ws;
  };

  // Load user preferences from backend
  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) throw new Error('Failed to load user preferences');
      
      const data = await response.json();
      setUserPreferences({
        ...userPreferences,
        ...data.preferences
      });
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Save user preferences
  const saveUserPreferences = async (newPreferences) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences })
      });
      
      setUserPreferences(newPreferences);
      
      // Apply theme
      if (newPreferences.theme === 'dark' || 
          (newPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark').matches)) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
      
      showToast('Preferences saved successfully', 'success');
    } catch (error) {
      showToast(`Failed to save preferences: ${error.message}`, 'error');
      throw error;
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setChatHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (!response.ok) throw new Error('Failed to create new chat');
      
      const data = await response.json();
      setCurrentChatId(data.id);
      setConversationName('New Chat');
      setMessages([]);
      setAttachments([]);
      return data;
    } catch (error) {
      showToast(`Failed to create new chat: ${error.message}`, 'error');
      throw error;
    }
  };

  // Load chat by ID
  const loadChatById = async (chatId) => {
    try {
      const response = await fetch(`/api/history/${chatId}`);
      if (!response.ok) throw new Error('Failed to load chat');
      
      const data = await response.json();
      setMessages(data.messages || []);
      setConversationName(data.title || `Chat ${chatId}`);
      setCurrentChatId(chatId);
      setAttachments(data.attachments || []);
      setConversationId(chatId);
      
      // Set model based on chat settings
      if (data.settings?.model) {
        setSelectedModel(data.settings.model);
        setProvider(data.settings.provider || 'ollama');
      }
      
      return data;
    } catch (error) {
      showToast(`Failed to load chat: ${error.message}`, 'error');
      throw error;
    }
  };

  // Save current chat
  const saveChat = async () => {
    try {
      const response = await fetch(`/api/history/${currentChatId || ''}`, {
        method: currentChatId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: conversationName,
          messages,
          attachments,
          settings: {
            model: selectedModel,
            provider,
            temperature,
            maxTokens
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to save chat');
      
      const data = await response.json();
      if (!currentChatId) {
        setCurrentChatId(data.id);
      }
      
      showToast('Chat saved successfully', 'success');
      return data;
    } catch (error) {
      showToast(`Failed to save chat: ${error.message}`, 'error');
      throw error;
    }
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/history/${chatId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
      showToast('Chat deleted successfully', 'success');
      
      // Create new chat if current chat was deleted
      if (chatId === currentChatId) {
        await createNewChat();
      }
      
      return true;
    } catch (error) {
      showToast(`Failed to delete chat: ${error.message}`, 'error');
      throw error;
    }
  };

  // Send query to LLM
  const sendMessage = async (question, context = []) => {
    if (!question.trim()) return;
    
    const userMessage = { 
      role: 'user', 
      content: question,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle streaming response
      if (streaming && provider === 'ollama') {
        const controller = new AbortController();
        const signal = controller.signal;
        setStreamController(controller);
        
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            model_name: selectedModel,
            provider,
            temperature,
            stream: true
          }),
          signal
        });
        
        if (!response.ok) throw new Error('Model request failed');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let done = false;
        
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          
          if (value) {
            const chunk = decoder.decode(value);
            try {
              const lines = chunk.split('\n').filter(line => line.trim() !== '');
              
              for (const line of lines) {
                const json = JSON.parse(line);
                if (json.error) {
                  throw new Error(json.error);
                }
                
                if (json.response) {
                  assistantMessage += json.response;
                  
                  // Update messages in state
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          content: assistantMessage
                        }
                      ];
                    } else {
                      return [
                        ...prev,
                        {
                          role: 'assistant',
                          content: assistantMessage
                        }
                      ];
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error processing stream:', error);
            }
          }
        }
        
        // Save final message
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return prev;
          }
          
          return [
            ...prev,
            {
              role: 'assistant',
              content: assistantMessage
            }
          ];
        });
        
        // Save chat
        if (currentChatId) {
          await saveChat();
        }
        
      } else {
        // Handle non-streaming response
        const response = await sendQuery({
          question,
          model_name: selectedModel,
          provider,
          temperature,
          max_tokens: maxTokens,
          history: messages.filter(m => m.role !== 'error')
        });
        
        const assistantMessage = { 
          role: 'assistant', 
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save chat
        if (currentChatId) {
          await saveChat();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.name === 'AbortError') {
        // User cancelled the request
        setMessages(prev => [
          ...prev,
          {
            role: 'error',
            content: 'Request cancelled by user'
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'error',
            content: `Error: ${error.message}`
          }
        ]);
      }
      
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setStreamController(null);
    }
  };

  // Cancel current request
  const cancelRequest = () => {
    if (streamController) {
      streamController.abort();
      setStreamController(null);
      showToast('Request cancelled', 'info');
    }
  };

  // Handle file attachment
  const addAttachment = (file) => {
    setAttachments(prev => [...prev, file]);
  };

  // Remove file attachment
  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  // Clear current conversation
  const clearConversation = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) {
      return;
    }
    
    setMessages([]);
    setAttachments([]);
    setConversationName('New Conversation');
    
    if (currentChatId) {
      try {
        await fetch(`/api/history/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Conversation',
            messages: [],
            attachments: [],
            settings: {
              model: selectedModel,
              provider,
              temperature,
              maxTokens
            }
          })
        });
        
        showToast('Conversation cleared successfully', 'success');
      } catch (error) {
        showToast(`Failed to clear conversation: ${error.message}`, 'error');
      }
    }
  };

  // Export conversation
  const exportConversation = async () => {
    try {
      const blob = new Blob([JSON.stringify({
        version: '1.0',
        exportDate: new Date().toISOString(),
        conversation: {
          id: currentChatId || conversationId,
          title: conversationName,
          messages,
          attachments,
          settings: {
            model: selectedModel,
            provider,
            temperature,
            maxTokens
          }
        }
      })], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuralnexus-chat-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      showToast('Conversation exported successfully', 'success');
      return true;
    } catch (error) {
      showToast(`Failed to export conversation: ${error.message}`, 'error');
      return false;
    }
  };

  // Import conversation
  const importConversation = async (file) => {
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      if (!data.conversation) {
        throw new Error('Invalid conversation format');
      }
      
      setConversationName(data.conversation.title);
      setMessages(data.conversation.messages || []);
      setAttachments(data.conversation.attachments || []);
      
      // Apply settings
      if (data.conversation.settings) {
        setSelectedModel(data.conversation.settings.model || selectedModel);
        setProvider(data.conversation.settings.provider || provider);
        setTemperature(data.conversation.settings.temperature || temperature);
        setMaxTokens(data.conversation.settings.maxTokens || maxTokens);
      }
      
      showToast('Conversation imported successfully', 'success');
      return true;
    } catch (error) {
      showToast(`Failed to import conversation: ${error.message}`, 'error');
      return false;
    }
  };

  // Update chat title
  const updateChatTitle = async (newTitle) => {
    setConversationName(newTitle);
    
    if (currentChatId) {
      try {
        await fetch(`/api/history/${currentChatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle })
        });
      } catch (error) {
        console.error('Error updating chat title:', error);
        showToast(`Failed to update chat title: ${error.message}`, 'error');
      }
    }
  };

  // Check tenant context
  const checkTenant = async () => {
    try {
      const response = await fetch('/api/tenant/info');
      if (!response.ok) throw new Error('Not in a tenant context');
      
      const data = await response.json();
      setTenantId(data.id);
    } catch (err) {
      console.log('No tenant context found');
    }
  };

  // Get model capabilities
  const getModelCapabilities = async (modelName, modelProvider = provider) => {
    try {
      const response = await fetch(`/api/models/capabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model_name: modelName,
          provider: modelProvider
        })
      });
      
      if (!response.ok) throw new Error('Failed to get model capabilities');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting model capabilities:', error);
      showToast(`Failed to get model capabilities: ${error.message}`, 'error');
      return {};
    }
  };

  // Get model info
  const getModelInfo = async (modelName, modelProvider = provider) => {
    try {
      const response = await fetch(`/api/models/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model_name: modelName,
          provider: modelProvider
        })
      });
      
      if (!response.ok) throw new Error('Failed to get model info');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      showToast(`Failed to get model info: ${error.message}`, 'error');
      return {};
    }
  };

  // Handle model selection
  const handleModelSelect = (modelName, modelProvider = provider) => {
    setSelectedModel(modelName);
    setProvider(modelProvider);
    
    // Save model preference
    if (currentChatId) {
      saveChat();
    }
  };

  // Update user preferences
  const updateUserPreferences = async (newPreferences) => {
    const updatedPreferences = {
      ...userPreferences,
      ...newPreferences
    };
    
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences })
      });
      
      setUserPreferences(updatedPreferences);
      
      // Apply theme
      if (updatedPreferences.theme === 'dark' || 
          (updatedPreferences.theme === 'system' && 
           window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
      
      showToast('Preferences updated successfully', 'success');
    } catch (error) {
      showToast(`Failed to update preferences: ${error.message}`, 'error');
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    
    // Load appropriate data
    if (tab === 'history') {
      loadChatHistory();
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    selectedModel,
    provider,
    temperature,
    maxTokens,
    streaming,
    currentChatId,
    conversationName,
    attachments,
    chatHistory,
    currentTab,
    isDarkMode,
    tenantId,
    userPreferences,
    conversationId,
    filteredModels: getFilteredModels(),
    providers,
    setProvider,
    setSelectedModel: handleModelSelect,
    setTemperature,
    setMaxTokens,
    setStreaming,
    setProvider,
    setMessages,
    sendMessage,
    cancelRequest,
    addAttachment,
    removeAttachment,
    clearConversation,
    exportConversation,
    importConversation,
    updateChatTitle,
    loadChatById,
    createNewChat,
    deleteChat,
    updateChatTitle,
    getModelCapabilities,
    getModelInfo,
    handleTabChange,
    updateUserPreferences,
    saveChat,
    loadChatHistory,
    setStreamController,
    error,
    websocketConnected: connected
  };
};