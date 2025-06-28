import React, { useState } from 'react';
import { Hash, Copy, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn';

interface GeneratedHash {
  originalText: string;
  algorithm: string;
  hash: string;
}

const HashGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha256']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratedHash[]>([]);
  const [error, setError] = useState('');

  const algorithms = [
    { value: 'md5', label: 'MD5', description: '128-bit hash' },
    { value: 'sha1', label: 'SHA-1', description: '160-bit hash' },
    { value: 'sha256', label: 'SHA-256', description: '256-bit hash' },
    { value: 'sha512', label: 'SHA-512', description: '512-bit hash' },
    { value: 'sha224', label: 'SHA-224', description: '224-bit hash' },
    { value: 'sha384', label: 'SHA-384', description: '384-bit hash' },
    { value: 'ripemd160', label: 'RIPEMD-160', description: '160-bit hash' },
    { value: 'whirlpool', label: 'Whirlpool', description: '512-bit hash' }
  ];

  const handleAlgorithmToggle = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm)
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    );
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text to hash');
      return;
    }

    if (selectedAlgorithms.length === 0) {
      setError('Please select at least one algorithm');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const promises = selectedAlgorithms.map(async (algorithm) => {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
            algorithm
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate ${algorithm} hash`);
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setText('');
    setResults([]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Hash Generator</h2>
          <p className="text-white/70">Generate hashes from text using multiple algorithms</p>
        </div>

        {/* Input Form */}
        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Text to Hash
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to generate hashes from..."
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Select Algorithms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {algorithms.map((algo) => (
                <button
                  key={algo.value}
                  onClick={() => handleAlgorithmToggle(algo.value)}
                  className={cn(
                    'p-3 rounded-lg border transition-all duration-200 text-left',
                    selectedAlgorithms.includes(algo.value)
                      ? 'bg-primary-500/20 border-primary-400 text-white'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  )}
                >
                  <div className="font-medium text-sm">{algo.label}</div>
                  <div className="text-xs opacity-70">{algo.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <span className="text-red-200">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim() || selectedAlgorithms.length === 0}
              className={cn(
                'flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2',
                isLoading || !text.trim() || selectedAlgorithms.length === 0
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Hash className="h-5 w-5" />
                  <span>Generate Hashes</span>
                </>
              )}
            </button>

            <button
              onClick={clearAll}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 animate-slide-up">
            <h3 className="text-xl font-semibold text-white mb-4">Generated Hashes</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{result.algorithm.toUpperCase()}</span>
                    <button
                      onClick={() => copyToClipboard(result.hash)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="bg-black/20 p-3 rounded font-mono text-sm text-white/90 break-all">
                    {result.hash}
                  </div>
                </div>
              ))}
            </div>

            {/* Copy All Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  const allHashes = results.map(r => `${r.algorithm.toUpperCase()}: ${r.hash}`).join('\n');
                  copyToClipboard(allHashes);
                }}
                className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy All Hashes</span>
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h4 className="text-white font-medium mb-3">💡 Hash Generation Tips</h4>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• SHA-256 and SHA-512 are recommended for security</li>
            <li>• MD5 is fast but not cryptographically secure</li>
            <li>• Use different algorithms for different purposes</li>
            <li>• Store hashes securely and never share original text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator; 