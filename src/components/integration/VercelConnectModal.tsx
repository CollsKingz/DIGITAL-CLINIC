import React, { useState } from 'react';
import { Base45Logo } from '../brand/Base45Logo';
import { VercelConfig } from '../../types/schema';
import {
  Globe,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Code2,
  Terminal,
  Server,
  X,
  Zap,
  Copy,
  Check
} from 'lucide-react';

export const VercelConnectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [vercelToken, setVercelToken] = useState('vcp_live_token_base45_innovation');
  const [projectName, setProjectName] = useState('base45-digital-clinic-app');
  const [teamId, setTeamId] = useState('team_base45_health');
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [config, setConfig] = useState<VercelConfig>({
    projectId: 'prj_b4_digital_clinic_902',
    projectName: 'base45-digital-clinic-app',
    deploymentUrl: 'https://base45-digital-clinic.vercel.app',
    environment: 'production',
    status: 'connected',
    lastDeployedAt: new Date(Date.now() - 3600000).toLocaleString(),
    autoSyncEnv: true
  });

  const handleTriggerDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setConfig(prev => ({
        ...prev,
        status: 'connected',
        lastDeployedAt: new Date().toLocaleString()
      }));
    }, 2500);
  };

  const vercelJsonContent = JSON.stringify({
    version: 2,
    name: projectName,
    builds: [{ src: "package.json", use: "@vercel/static-build", config: { distDir: "dist" } }],
    routes: [{ src: "/(.*)", dest: "/index.html" }]
  }, null, 2);

  const copyVercelJson = () => {
    navigator.clipboard.writeText(vercelJsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              {/* Vercel Triangle Logo */}
              <svg width="20" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Vercel Cloud Integration</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Vercel Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">Connect, sync environment keys & deploy BASE 45 Innovation Group App</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vercel Active Status Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Production Live Deployment</span>
              </div>
              <h4 className="text-lg font-black mt-1 text-white">{config.projectName}</h4>
              <a
                href={config.deploymentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center space-x-1 mt-0.5"
              >
                <span>{config.deploymentUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={handleTriggerDeploy}
              disabled={isDeploying}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${isDeploying ? 'animate-spin' : ''}`} />
              <span>{isDeploying ? 'Deploying to Vercel...' : 'Deploy Now'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Last Deployed</span>
              <span className="font-semibold text-slate-200">{config.lastDeployedAt}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Framework Preset</span>
              <span className="font-semibold text-slate-200">Vite (React 19)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Node Engine</span>
              <span className="font-semibold text-emerald-400">v20.x (Edge Ready)</span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-sky-600" />
            <span>Vercel Connection Credentials & Variables</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Vercel Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Vercel Team ID (Optional)
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Vercel Access Token
            </label>
            <input
              type="password"
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:outline-hidden"
            />
          </div>

          {/* Vercel JSON Preview */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-sky-400" /> vercel.json (Project Configuration)
              </span>
              <button
                onClick={copyVercelJson}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-sky-300 overflow-x-auto p-2 bg-slate-950 rounded-xl leading-relaxed">
              {vercelJsonContent}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Base45Logo variant="badge" size="sm" />
            <span className="text-[11px] text-slate-500 font-medium">BASE 45 Innovation Group Cloud Deployment Agent</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
