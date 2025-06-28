import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface CrackResult {
  found: boolean;
  password: string | null;
  algorithm: string;
}

const HashCracker: React.FC = () => {
  const [hash, setHash] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [customDictionary, setCustomDictionary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrackResult | null>(null);
  const [error, setError] = useState('');

  const algorithms = [
    { value: '', label: 'Auto-detect' },
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' },
    { value: 'bcrypt', label: 'bcrypt' }
  ];

  const handleCrack = async () => {
    if (!hash.trim()) {
      setError('Please enter a hash to crack');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const dictionary = customDictionary
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      const response = await fetch('/api/crack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash.trim(),
          algorithm: algorithm || undefined,
          dictionary: dictionary.length > 0 ? dictionary : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crack hash');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Hash Cracker</h2>
          <p className="text-white/70">Crack hashes using dictionary attacks</p>
        </div>

        {/* Input Form */}
        <div className="space-y-6">
          {/* Hash Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hash to Crack
            </label>
            <div className="relative">
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter hash (e.g., 5f4dcc3b5aa765d61d8327deb882cf99)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {hash && (
                <button
                  onClick={() => copyToClipboard(hash)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Algorithm (Optional - Auto-detection enabled)
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              {algorithms.map((algo) => (
                <option key={algo.value} value={algo.value} className="bg-gray-800">
                  {algo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Dictionary */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Custom Dictionary (Optional)
            </label>
            <textarea
              value={customDictionary}
              onChange={(e) => setCustomDictionary(e.target.value)}
              placeholder="Enter custom passwords, one per line"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Leave empty to use built-in common passwords
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          {/* Crack Button */}
          <button
            onClick={handleCrack}
            disabled={isLoading || !hash.trim()}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2',
              isLoading || !hash.trim()
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cracking...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Crack Hash</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-slide-up">
            <div className={cn(
              'p-6 rounded-lg border',
              result.found
                ? 'bg-green-500/20 border-green-500/30'
                : 'bg-yellow-500/20 border-yellow-500/30'
            )}>
              <div className="flex items-start space-x-3">
                {result.found ? (
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={cn(
                    'text-lg font-semibold mb-2',
                    result.found ? 'text-green-200' : 'text-yellow-200'
                  )}>
                    {result.found ? 'Hash Cracked Successfully!' : 'Hash Not Found'}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Algorithm:</span>
                      <span className="text-white font-mono">{result.algorithm}</span>
                    </div>
                    
                    {result.found && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Password:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-200 font-mono">{result.password}</span>
                          <button
                            onClick={() => copyToClipboard(result.password!)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!result.found && (
                      <p className="text-yellow-200">
                        The hash could not be cracked with the current dictionary. 
                        Try adding more passwords to the custom dictionary.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h4 className="text-white font-medium mb-3">💡 Tips for Better Results</h4>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• Use custom dictionaries for specific targets</li>
            <li>• Try common password variations (123, 1234, password123)</li>
            <li>• Include personal information if available</li>
            <li>• For complex hashes, consider using specialized tools</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashCracker; 