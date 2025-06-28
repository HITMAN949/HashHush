import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

type TabType = 'crack' | 'generate' | 'detect';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('crack');

  const tabs = [
    { id: 'crack' as TabType, name: 'Crack', description: 'Crack hashes using dictionary attacks' },
    { id: 'generate' as TabType, name: 'Generate', description: 'Generate hashes from text' },
    { id: 'detect' as TabType, name: 'Detect', description: 'Detect hash algorithm type' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'crack': return <HashCracker />;
      case 'generate': return <HashGenerator />;
      case 'detect': return <HashDetector />;
      default: return <HashCracker />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="HashHush Logo" className="w-24 h-24 rounded shadow-lg mr-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-1 transition-colors duration-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">HashHush</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Hash cracking tool</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Connected</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex tabs-gradient-border p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        <div className="card p-8">
          {renderContent()}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            © 2025 HashHush. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const HashCracker: React.FC = () => {
  const [hash, setHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCrack = async () => {
    if (!hash.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/crack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to crack hash');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-white transition-colors duration-300">Hash Cracker</h2>
      <div className="space-y-6">
        <div>
          <label className="label">Hash to crack</label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter hash (e.g., 5f4dcc3b5aa765d61d8327deb882cf99)"
            className="input"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
            Try common hashes like: 5f4dcc3b5aa765d61d8327deb882cf99 (password), 
            e10adc3949ba59abbe56e057f20f883e (123456)
          </p>
        </div>
        <button
          onClick={handleCrack}
          disabled={isLoading || !hash.trim()}
          className="btn w-full"
        >
          {isLoading ? (
            <>
              <div className="loading"></div>
              Cracking hash...
            </>
          ) : (
            'Crack Hash'
          )}
        </button>
        
        {error && (
          <div className="result">
            <h3 className="font-semibold mb-3 status-error">Error</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="result">
            <h3 className={`font-semibold mb-3 ${result.found ? 'status-success' : 'status-error'}`}>
              {result.found ? 'Hash Cracked!' : 'Hash Not Found'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Algorithm:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white transition-colors duration-300">{result.algorithm}</span>
              </div>
              {result.found && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Password:</span>
                  <span className="text-sm font-mono status-success font-bold">{result.password}</span>
                </div>
              )}
              {!result.found && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md transition-colors duration-300">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                    The hash was not found in our dictionary. This could mean:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 list-disc list-inside transition-colors duration-300">
                    <li>The password is not in our common password list</li>
                    <li>The hash uses a different algorithm</li>
                    <li>The hash might be salted or use additional security measures</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HashGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState('md5');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), algorithm })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-white transition-colors duration-300">Hash Generator</h2>
      <div className="space-y-6">
        <div>
          <label className="label">Text to hash</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to generate hash from..."
            rows={3}
            className="input"
          />
        </div>
        <div>
          <label className="label">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="input"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text.trim()}
          className="btn w-full"
        >
          {isLoading ? (
            <>
              <div className="loading"></div>
              Generating...
            </>
          ) : (
            'Generate Hash'
          )}
        </button>
        {result && (
          <div className="result">
            <h3 className="font-semibold mb-3 status-info">Generated Hash</h3>
            <div className="result-code">
              {result.hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HashDetector: React.FC = () => {
  const [hash, setHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDetect = async () => {
    if (!hash.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash.trim() })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-white transition-colors duration-300">Hash Detector</h2>
      <div className="space-y-6">
        <div>
          <label className="label">Hash to detect</label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter hash to detect algorithm"
            className="input"
          />
        </div>
        <button
          onClick={handleDetect}
          disabled={isLoading || !hash.trim()}
          className="btn w-full"
        >
          {isLoading ? (
            <>
              <div className="loading"></div>
              Detecting...
            </>
          ) : (
            'Detect Algorithm'
          )}
        </button>
        {result && (
          <div className="result">
            <h3 className="font-semibold mb-3 status-info">Detection Result</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Algorithm:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white transition-colors duration-300">{result.detectedType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Confidence:</span>
                <span className={`text-sm ${result.confidence === 'high' ? 'status-success' : 'status-error'}`}>
                  {result.confidence === 'high' ? 'High' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 