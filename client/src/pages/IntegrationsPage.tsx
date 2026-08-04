import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntegrations, useLinkIntegration, useUnlinkIntegration, useSyncIntegrations } from '../hooks/useIntegrations';
import { RefreshCw, Link as LinkIcon, Trash2, Code2, TerminalSquare, Github, Activity } from 'lucide-react';

const PLATFORMS = [
  {
    id: 'leetcode' as const,
    name: 'LeetCode',
    icon: <Code2 className="w-6 h-6 text-[#FFA116]" />,
    bg: 'bg-[#FFA116]/10',
    border: 'border-[#FFA116]/30',
    text: 'text-[#FFA116]',
    placeholder: 'e.g. tournist',
    desc: 'Link your LeetCode profile',
    requiresToken: false
  },
  {
    id: 'codeforces' as const,
    name: 'Codeforces',
    icon: <TerminalSquare className="w-6 h-6 text-blue-500" />,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    placeholder: 'e.g. tourist',
    desc: 'Link your Codeforces handle',
    requiresToken: false
  },
  {
    id: 'codechef' as const,
    name: 'CodeChef',
    icon: <Activity className="w-6 h-6 text-[#5B4638]" />,
    bg: 'bg-[#5B4638]/10',
    border: 'border-[#5B4638]/30',
    text: 'text-[#5B4638]',
    placeholder: 'e.g. genghis_khan',
    desc: 'Link your CodeChef handle',
    requiresToken: false
  },
  {
    id: 'gfg' as const,
    name: 'GeeksForGeeks',
    icon: <Code2 className="w-6 h-6 text-[#2F8D46]" />,
    bg: 'bg-[#2F8D46]/10',
    border: 'border-[#2F8D46]/30',
    text: 'text-[#2F8D46]',
    placeholder: 'e.g. john_doe',
    desc: 'Link your GeeksForGeeks handle',
    requiresToken: false
  },
  {
    id: 'atcoder' as const,
    name: 'AtCoder',
    icon: <Activity className="w-6 h-6 text-red-500" />,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    placeholder: 'e.g. tourist',
    desc: 'Link your AtCoder handle',
    requiresToken: false
  },
  {
    id: 'github' as const,
    name: 'GitHub',
    icon: <Github className="w-6 h-6 text-text-main" />,
    bg: 'bg-text-main/10',
    border: 'border-text-main/30',
    text: 'text-text-main',
    placeholder: 'e.g. torvalds',
    desc: 'Link GitHub to track contributions',
    requiresToken: false
  }
];

export default function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();
  const linkMutation = useLinkIntegration();
  const unlinkMutation = useUnlinkIntegration();
  const syncMutation = useSyncIntegrations();

  const [inputs, setInputs] = useState<Record<string, { username: string; token?: string }>>({});

  const handleInputChange = (platformId: string, field: 'username' | 'token', value: string) => {
    setInputs(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [field]: value
      }
    }));
  };

  const handleLink = (platformId: any) => {
    const data = inputs[platformId];
    if (!data?.username?.trim()) return;
    linkMutation.mutate({ 
      platform: platformId, 
      username: data.username.trim(),
      accessToken: data.token?.trim() 
    });
  };

  if (isLoading) {
    return <div className="p-8 text-text-muted animate-pulse">Loading integrations...</div>;
  }

  return (
    <div className="animate-fade-in p-4 md:p-8">
      <Helmet>
        <title>Integrations — AlgoForge</title>
      </Helmet>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2">Platform Integrations</h1>
          <p className="text-text-muted">Connect your coding profiles to aggregate stats, ratings, and activity.</p>
        </div>
        <button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending || integrations?.length === 0}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const integration = integrations?.find(i => i.platform === platform.id);
          const inputData = inputs[platform.id] || { username: '', token: '' };

          return (
            <div key={platform.id} className="card p-6 border-border-dark bg-bg-dark flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl ${platform.bg} flex items-center justify-center border ${platform.border}`}>
                  {platform.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">{platform.name}</h2>
                  <p className="text-sm text-text-muted">{platform.desc}</p>
                </div>
              </div>

              {integration ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="bg-bg-elevated border border-border-dark rounded-lg p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-text-muted text-sm font-medium">Linked Handle</span>
                      <span className={`font-bold ${platform.text}`}>@{integration.username}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {integration.platform !== 'github' && (
                        <>
                          <div className="text-center p-3 bg-bg-dark rounded-md border border-border-dark">
                            <div className="text-2xl font-bold text-text-main">{integration.solvedCount}</div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Solved</div>
                          </div>
                          <div className="text-center p-3 bg-bg-dark rounded-md border border-border-dark">
                            <div className="text-2xl font-bold text-text-main">{integration.rating || 'N/A'}</div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Current Rating</div>
                          </div>
                        </>
                      )}
                      <div className="text-center p-3 bg-bg-dark rounded-md border border-border-dark col-span-2">
                        <div className="text-xl font-bold text-text-main">{integration.platform === 'github' ? integration.contributions : (integration.maxRating != null && integration.maxRating > 0 ? integration.maxRating : 'N/A')}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">
                          {integration.platform === 'github' ? 'Contributions (Year)' : 'Peak Rating'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto text-xs text-text-muted text-center pt-2 border-t border-border-dark/50">
                      Last synced: {new Date(integration.lastSyncedAt).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => unlinkMutation.mutate(platform.id)}
                    disabled={unlinkMutation.isPending}
                    className="w-full btn-secondary-danger flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Unlink {platform.name}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="input-label">Username / Handle</label>
                      <input 
                        type="text" 
                        value={inputData.username}
                        onChange={e => handleInputChange(platform.id, 'username', e.target.value)}
                        placeholder={platform.placeholder}
                        className="input-field"
                      />
                    </div>
                    {platform.requiresToken && (
                      <div>
                        <label className="input-label flex items-center justify-between">
                          Personal Access Token
                          <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-[10px] text-brand-primary hover:underline">Get Token</a>
                        </label>
                        <input 
                          type="password" 
                          value={inputData.token || ''}
                          onChange={e => handleInputChange(platform.id, 'token', e.target.value)}
                          placeholder="ghp_..."
                          className="input-field"
                        />
                        <p className="text-[10px] text-text-muted mt-1">Requires `read:user` scope.</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleLink(platform.id)}
                    disabled={linkMutation.isPending || !inputData.username.trim() || (platform.requiresToken && !inputData.token?.trim())}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> Link {platform.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
