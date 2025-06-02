import { useState, useEffect } from 'react';
import { getModels, installModel, removeModel, checkProvidersStatus } from '../lib/fetcher';
import { useToast } from './useToast';

export const useModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState({
    ollama: false,
    openai: false,
    anthropic: false,
    google: false
  });
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    size: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1
  });
  const [sortBy, setSortBy] = useState('name_asc');
  const { showToast } = useToast();

  // Load initial data
  useEffect(() => {
    loadModels();
    checkProvidersStatus();
  }, []);

  // Load models from API with filters and pagination
  const loadModels = async (page = 1, provider = activeProvider) => {
    setLoading(true);
    try {
      const response = await getModels(page, provider, filters.searchTerm);
      
      setModels(response.data.models || []);
      setPagination({
        page: response.data.page || 1,
        pageSize: response.data.pageSize || 20,
        totalPages: response.data.totalPages || 1
      });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      showToast(`Failed to load models: ${error.message}`, 'error');
      return null;
    }
  };

  // Check status of all providers
  const checkProvidersStatus = async () => {
    try {
      const response = await fetch('/api/providers/status');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error checking providers:', error);
    }
  };

  // Install a model with progress tracking
  const installModel = async (modelName, provider = activeProvider) => {
    try {
      showToast(`Installing ${modelName}...`, 'info');
      
      const result = await fetch('/api/models/ollama/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model_name: modelName,
          provider
        })
      });
      
      if (!result.ok) throw new Error('Model installation failed');
      
      const data = await result.json();
      showToast(`Model ${modelName} installed successfully!`, 'success');
      
      // Refresh models list
      await loadModels(pagination.page, provider);
      
      return data;
    } catch (error) {
      showToast(`Error installing ${modelName}: ${error.message}`, 'error');
      throw error;
    }
  };

  // Remove a model
  const removeModel = async (modelName, provider = activeProvider) => {
    if (!window.confirm(`Are you sure you want to remove ${modelName}?`)) {
      return;
    }
    
    try {
      showToast(`Removing ${modelName}...`, 'info');
      
      const result = await fetch(`/api/models/ollama/${modelName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!result.ok) throw new Error('Model removal failed');
      
      const data = await result.json();
      showToast(`Model ${modelName} removed successfully!`, 'success');
      
      // Refresh models list
      await loadModels(pagination.page, provider);
      
      return data;
    } catch (error) {
      showToast(`Error removing ${modelName}: ${error.message}`, 'error');
      throw error;
    }
  };

  // Handle provider change
  const setProvider = (provider) => {
    setActiveProvider(provider);
    loadModels(1, provider);
  };

  // Update filters
  const setFilter = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadModels(1, activeProvider);
  };

  // Update sort
  const setSort = (sortOption) => {
    setSortBy(sortOption);
    // Implement sorting logic based on sortOption
    const sortedModels = [...models].sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'size_asc':
          return (a.sizeBytes || 0) - (b.sizeBytes || 0);
        case 'size_desc':
          return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        case 'modified_asc':
          return new Date(a.modified) - new Date(b.modified);
        case 'modified_desc':
          return new Date(b.modified) - new Date(a.modified);
        default:
          return 0;
      }
    });
    
    setModels(sortedModels);
  };

  // Get filtered and sorted models
  const getFilteredModels = () => {
    if (!models.length) return [];
    
    return models
      .filter(model => {
        // Search filter
        if (filters.searchTerm && !model.name.includes(filters.searchTerm)) {
          return false;
        }
        
        // Type filter
        if (filters.type !== 'all' && model.provider !== filters.type) {
          return false;
        }
        
        // Size filter
        if (filters.size !== 'all') {
          const size = model.sizeBytes || 0;
          switch (filters.size) {
            case 'small':
              return size < 2 * 1024 * 1024 * 1024; // < 2GB
            case 'medium':
              return size >= 2 * 1024 * 1024 * 1024 && size < 10 * 1024 * 1024 * 1024; // 2-10GB
            case 'large':
              return size >= 10 * 1024 * 1024 * 1024; // >10GB
            default:
              return true;
          }
        }
        
        // Status filter
        if (filters.status !== 'all') {
          // Implement status filtering based on your model schema
          if (filters.status === 'active' && !model.active) return false;
          if (filters.status === 'inactive' && model.active) return false;
        }
        
        return true;
      });
  };

  // Get model by name
  const getModelByName = (modelName) => {
    return models.find(model => model.name === modelName);
  };

  // Import models from file
  const importModels = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/models/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Model import failed');
      
      const data = await response.json();
      showToast(`${data.imported} models imported successfully`, 'success');
      
      // Refresh models list
      await loadModels();
      
      return data;
    } catch (error) {
      showToast(`Error importing models: ${error.message}`, 'error');
      throw error;
    }
  };

  // Export models to file
  const exportModels = async () => {
    try {
      const response = await fetch('/api/models/export', {
        method: 'GET'
      });
      
      if (!response.ok) throw new Error('Model export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'neuralnexus-models.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      showToast('Models exported successfully', 'success');
      return true;
    } catch (error) {
      showToast(`Error exporting models: ${error.message}`, 'error');
      throw error;
    }
  };

  // Get model details
  const getModelDetails = async (modelName) => {
    try {
      const response = await fetch(`/api/models/ollama/${modelName}`);
      if (!response.ok) throw new Error('Failed to get model details');
      return await response.json();
    } catch (error) {
      showToast(`Error getting model details: ${error.message}`, 'error');
      throw error;
    }
  };

  // Get model info for a specific model
  const getModelInfo = async (modelName, provider = activeProvider) => {
    try {
      const response = await fetch(`/api/models/${provider}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName })
      });
      
      if (!response.ok) throw new Error('Failed to get model info');
      
      return await response.json();
    } catch (error) {
      showToast(`Error getting model info: ${error.message}`, 'error');
      throw error;
    }
  };

  return {
    models,
    filteredModels: getFilteredModels(),
    loading,
    providers,
    activeProvider,
    filters,
    pagination,
    sortBy,
    loadModels,
    installModel,
    removeModel,
    setProvider,
    setFilter,
    setSort,
    getModelByName,
    importModels,
    exportModels,
    getModelDetails,
    getModelInfo,
    refreshModels: () => loadModels(pagination.page, activeProvider),
    checkProvidersStatus
  };
};