'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `[${new Date().toISOString()}] ${result}`]);
  };

  const testGetRequest = async (endpoint: string) => {
    try {
      addResult(`Testing GET ${endpoint}...`);
      const response = await fetch(endpoint);
      const text = await response.text();
      addResult(`GET ${endpoint} - Status: ${response.status}`);
      addResult(`Response: ${text}`);
    } catch (error: any) {
      addResult(`GET ${endpoint} - Error: ${error.message}`);
    }
  };

  const testPostRequest = async (endpoint: string) => {
    try {
      addResult(`Testing POST ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          feedback: 'Test feedback',
          wantsReply: false 
        }),
      });
      const text = await response.text();
      addResult(`POST ${endpoint} - Status: ${response.status}`);
      addResult(`Response: ${text}`);
    } catch (error: any) {
      addResult(`POST ${endpoint} - Error: ${error.message}`);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Route Tester</h1>
      
      <div className="space-y-4 mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => testGetRequest('/api/test')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test GET /api/test
          </button>
          <button
            onClick={() => testPostRequest('/api/test')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test POST /api/test
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => testGetRequest('/api/feedback')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test GET /api/feedback
          </button>
          <button
            onClick={() => testPostRequest('/api/feedback')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test POST /api/feedback
          </button>
        </div>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-semibold mb-2">Results:</h2>
        <pre className="text-xs whitespace-pre-wrap font-mono">
          {results.length === 0 ? 'No tests run yet' : results.join('\n')}
        </pre>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">How to clear Vercel cache:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to your Vercel dashboard</li>
          <li>Select your project</li>
          <li>Go to Settings → Functions</li>
          <li>Click "Purge Data Cache" button</li>
          <li>Or trigger a new deployment with: <code className="bg-gray-200 px-1">git commit --allow-empty -m "Force redeploy" && git push</code></li>
        </ol>
        
        <h3 className="font-semibold mb-2 mt-4">Check if functions are deployed:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>In Vercel dashboard → Functions tab</li>
          <li>Look for functions named like: <code className="bg-gray-200 px-1">api/feedback/route</code></li>
          <li>If no functions show, check the build logs</li>
          <li>Make sure your <code className="bg-gray-200 px-1">package.json</code> has <code className="bg-gray-200 px-1">"type": "module"</code> removed</li>
        </ol>
      </div>
    </div>
  );
}