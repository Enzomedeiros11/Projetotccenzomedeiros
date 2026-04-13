import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, Monitor, Globe } from 'lucide-react';

const Sitemap: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Map size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Developer Sitemap</h1>
            <p className="text-slate-500 text-sm">Preview Environment Detected</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400">
                <Monitor size={18} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-900 mb-1">Why am I seeing this?</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  You are in a cloud development environment (Google IDX, Stackblitz, etc.). 
                  The app is using <code className="bg-slate-200 px-1 rounded text-slate-800">HashRouter</code> to ensure 
                  navigation works correctly through the proxy layer.
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-3">
            <Link 
              to="/lp-video" 
              className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Globe size={20} />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-900">Landing Page (Video)</span>
                  <span className="block text-xs text-slate-500">Main production-ready route</span>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">System Status: Active</span>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
