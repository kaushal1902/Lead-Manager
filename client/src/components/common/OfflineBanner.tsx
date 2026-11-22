import { WifiOff, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import { API_BASE } from '../../services/config';

interface OfflineBannerProps {
  isOnline: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function OfflineBanner({
  isOnline,
  onRetry,
  isRetrying = false,
}: OfflineBannerProps) {
  if (isOnline) return null;

  const isProduction = import.meta.env.PROD;
  const isDefaultLocalApi = API_BASE === '/api';

  return (
    <div className="bg-amber-50 border-b border-amber-200/90 px-4 py-3 sm:px-6 shadow-xs animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5 sm:mt-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-amber-900">
                Backend API Disconnected
              </p>
              {!isProduction ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  <Terminal className="w-3 h-3" />
                  npm run dev:server
                </span>
              ) : isDefaultLocalApi ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                  Missing VITE_API_URL on Vercel
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Target: {API_BASE}
                </span>
              )}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 space-y-0.5">
              {!isProduction ? (
                <p>Unable to reach the backend server. Changes cannot be saved until the connection is restored.</p>
              ) : isDefaultLocalApi ? (
                <p>
                  Vercel doesn&apos;t know your backend address. Add <code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold text-amber-900">VITE_API_URL=&lt;your-render-url&gt;</code> in Vercel Settings &rarr; Environment Variables, then click <strong>Redeploy</strong>.
                </p>
              ) : (
                <p className="flex items-center gap-1.5 flex-wrap">
                  <span>Unable to reach <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-amber-900">{API_BASE}/health</code>. Free Render services sleep after 15m; cold starts take ~40s.</span>
                  <a
                    href={`${API_BASE}/health`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-amber-900 underline font-semibold hover:text-amber-950"
                  >
                    <span>Test Health URL</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
}
