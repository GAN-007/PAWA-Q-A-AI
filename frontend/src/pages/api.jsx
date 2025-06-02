import React from 'react';

const API = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">This API provides endpoints for interacting with the PAWA AI Q&A system.</p>
        
        <h3 className="text-lg font-medium mb-2">Base URL</h3>
        <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mb-4">http://localhost:8000/api</code>
        
        <h3 className="text-lg font-medium mb-2">Endpoints</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>POST /query</strong> - Send a query to an AI model</li>
          <li><strong>GET /models/ollama</strong> - List installed Ollama models</li>
          <li><strong>POST /models/ollama/install</strong> - Install a new Ollama model</li>
          <li><strong>DELETE /models/ollama/{model_name}</strong> - Remove an Ollama model</li>
          <li><strong>GET /providers/status</strong> - Check status of all available LLM providers</li>
        </ul>
      </div>
    </div>
  );
};

export default API;