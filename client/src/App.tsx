import { useEffect, useState } from 'react';
import { CheckCircle2, Server, Globe, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [apiMessage, setApiMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => {
        if (data.status === 'ok') {
          setApiStatus('connected');
          setApiMessage(data.message);
        } else {
          setApiStatus('disconnected');
        }
      })
      .catch(() => {
        // Fallback direct check if proxy is not yet active
        fetch('http://localhost:5000/api/health')
          .then((res) => res.json())
          .then((data: HealthResponse) => {
            if (data.status === 'ok') {
              setApiStatus('connected');
              setApiMessage(data.message);
            } else {
              setApiStatus('disconnected');
            }
          })
          .catch(() => {
            setApiStatus('disconnected');
          });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 transition-all">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Milestone 1 — Monorepo Architecture Initialized</span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Lead Manager
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Full-Stack Sales Pipeline & Lead Capture System designed with Express, React, TypeScript, Tailwind CSS, and SQLite.
        </p>

        {/* Service Connectivity Cards */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Frontend Client</p>
                <p className="text-xs text-slate-500">Vite 6 + React 19 + Tailwind CSS</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Backend Server</p>
                <p className="text-xs text-slate-500">
                  {apiMessage || 'Express + TypeScript on port 5000'}
                </p>
              </div>
            </div>
            {apiStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            ) : apiStatus === 'checking' ? (
              <span className="text-xs text-slate-400 animate-pulse">Checking...</span>
            ) : (
              <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Waiting on :5000
              </span>
            )}
          </div>
        </div>

        {/* Next Step Info */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-200">
              Next: Milestone 2 — Prisma SQLite Schema Setup
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
