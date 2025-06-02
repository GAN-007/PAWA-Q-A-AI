import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-primary-700 dark:text-primary-300">PAWA Q&A AI</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">AI Q&A System</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          New Chat
        </button>
        <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          History
        </button>
        <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          Models
        </button>
        <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          Settings
        </button>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default Sidebar;