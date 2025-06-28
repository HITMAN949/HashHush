import React, { useState } from 'react';
import { Shield, Search, Copy, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface DetectionResult {
  hash: string;
  detectedType: string;
  confidence: string;
}

const HashDetector: React.FC = () => {
  const [hash, setHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    if (!hash.trim()) {
      setError('Please enter a hash to detect');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to detect hash type');
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

  const clearAll = () => {
    setHash('');
    setResult(null);
    setError('');
  };

  const getAlgorithmInfo = (type: string) => {
    const info = {
      md5: { name: 'MD5', description: '128-bit cryptographic hash function', security: 'Insecure' },
      sha1: { name: 'SHA-1', description: '160-bit cryptographic hash function', security: 'Weak' },
      sha256: { name: 'SHA-256', description: '256-bit cryptographic hash function', security: 'Secure' },
      sha512: { name: 'SHA-512', description: '512-bit cryptographic hash function', security: 'Very Secure' },
      sha224: { name: 'SHA-224', description: '224-bit cryptographic hash function', security: 'Secure' },
      sha384: { name: 'SHA-384', description: '384-bit cryptographic hash function', security: 'Secure' },
      ripemd160: { name: 'RIPEMD-160', description: '160-bit cryptographic hash function', security: 'Moderate' },
      whirlpool: { name: 'Whirlpool', description: '512-bit cryptographic hash function', security: 'Secure' },
      bcrypt: { name: 'bcrypt', description: 'Password hashing function', security: 'Very Secure' },
      unknown: { name: 'Unknown', description: 'Unable to determine algorithm', security: 'Unknown' }
    };
    return info[type as keyof typeof info] || info.unknown;
  };

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'Very Secure': return 'text-green-400';
      case 'Secure': return 'text-blue-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Weak': return 'text-orange-400';
      case 'Insecure': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Hash Detector</h2>
          <p className="text-white/70">Detect hash algorithm type from hash string</p>
        </div>

        {/* Input Form */}
        <div className="space-y-6">
          {/* Hash Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hash to Detect
            </label>
            <div className="relative">
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter hash to detect algorithm (e.g., 5f4dcc3b5aa765d61d8327deb882cf99)"
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

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleDetect}
              disabled={isLoading || !hash.trim()}
              className={cn(
                'flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2',
                isLoading || !hash.trim()
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Detect Algorithm</span>
                </>
              )}
            </button>

            <button
              onClick={clearAll}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-slide-up">
            <div className={cn(
              'p-6 rounded-lg border',
              result.detectedType !== 'unknown'
                ? 'bg-green-500/20 border-green-500/30'
                : 'bg-yellow-500/20 border-yellow-500/30'
            )}>
              <div className="flex items-start space-x-3">
                {result.detectedType !== 'unknown' ? (
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={cn(
                    'text-lg font-semibold mb-4',
                    result.detectedType !== 'unknown' ? 'text-green-200' : 'text-yellow-200'
                  )}>
                    Detection Result
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Algorithm Info */}
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Detected Algorithm:</span>
                        <span className="text-white font-semibold">
                          {getAlgorithmInfo(result.detectedType).name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Confidence:</span>
                        <span className={cn(
                          'font-medium',
                          result.confidence === 'high' ? 'text-green-400' : 'text-yellow-400'
                        )}>
                          {result.confidence === 'high' ? 'High' : 'Low'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Security Level:</span>
                        <span className={cn('font-medium', getSecurityColor(getAlgorithmInfo(result.detectedType).security))}>
                          {getAlgorithmInfo(result.detectedType).security}
                        </span>
                      </div>
                    </div>

                    {/* Algorithm Description */}
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Algorithm Details</h4>
                      <p className="text-white/80 text-sm">
                        {getAlgorithmInfo(result.detectedType).description}
                      </p>
                    </div>

                    {/* Hash Display */}
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Input Hash:</span>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supported Algorithms */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h4 className="text-white font-medium mb-4">🔍 Supported Hash Algorithms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['md5', 'sha1', 'sha256', 'sha512', 'sha224', 'sha384', 'ripemd160', 'whirlpool', 'bcrypt'].map((algo) => {
              const info = getAlgorithmInfo(algo);
              return (
                <div key={algo} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{info.name}</div>
                    <div className="text-white/60 text-xs">{info.description}</div>
                  </div>
                  <span className={cn('text-xs font-medium', getSecurityColor(info.security))}>
                    {info.security}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h4 className="text-white font-medium mb-3">💡 Detection Tips</h4>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• Hash length often indicates the algorithm used</li>
            <li>• bcrypt hashes start with $2a$, $2b$, or $2y$</li>
            <li>• MD5 produces 32-character hexadecimal strings</li>
            <li>• SHA-256 produces 64-character hexadecimal strings</li>
            <li>• Some hashes may be salted or use custom formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashDetector; 