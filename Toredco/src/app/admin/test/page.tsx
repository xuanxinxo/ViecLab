'use client';

import { useState, useEffect } from 'react';

export default function TestAuth() {
  const [token, setToken] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken || 'No token found');
  }, []);

  const testAuth = async () => {
    try {
      const response = await fetch('/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();
      setAuthStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setAuthStatus(`Error: ${error}`);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('adminToken');
    setToken('Token cleared');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Authentication</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Token</h2>
          <div className="bg-gray-100 p-3 rounded mb-4">
            <code className="text-sm break-all">{token}</code>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test API Call
            </button>
            <button
              onClick={clearToken}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Token
            </button>
          </div>
        </div>

        {authStatus && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">API Response</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {authStatus}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 