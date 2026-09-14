import React from 'react';
import { PLATFORM_CONFIG, getPlatformLabel } from '../../../utils/platforms';
import { Activity } from 'lucide-react';

interface PlatformCardsProps {
  integrations: any[];
}

export function PlatformCards({ integrations }: PlatformCardsProps) {
  if (!integrations || integrations.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {integrations.filter(i => i.platform !== 'github').map(integration => {
        const config = PLATFORM_CONFIG[integration.platform] || { name: integration.platform, icon: <Activity className="w-5 h-5 text-text-muted" />, color: '#888', bg: 'bg-white/10', url: '#' };
        const rankInfo = getPlatformLabel(integration.platform, integration.rating, integration.tier);
        
        return (
          <a key={integration.platform} href={`${config.url}${integration.username}`} target="_blank" rel="noopener noreferrer" className="glass p-5 rounded-xl border border-border-dark min-w-[280px] shrink-0 snap-start relative overflow-hidden group hover:border-brand-primary/50 transition-colors block cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: rankInfo?.color || config.color }}></div>
            <div className="flex items-center justify-between gap-3 mb-4 pl-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className="font-bold text-text-main group-hover:text-brand-primary transition-colors">{config.name}</h4>
                  <p className="text-xs text-text-muted">@{integration.username}</p>
                </div>
              </div>
              {rankInfo && (
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: rankInfo.color }}>
                  {rankInfo.label}
                </div>
              )}
            </div>
            <div className={`grid ${integration.platform === 'github' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 pl-2`}>
              <div>
                <p className="text-xl font-bold text-text-main">{integration.solvedCount}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Solved</p>
              </div>
              <div>
                <p className="text-xl font-bold text-text-main">
                  {integration.platform === 'github' ? integration.contributions : (integration.rating || 'N/A')}
                </p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                  {integration.platform === 'github' ? 'Contribs' : 'Rating'}
                </p>
              </div>
              {integration.platform !== 'github' && (
                <div>
                  <p className="text-xl font-bold text-text-main">
                    {integration.maxRating != null && integration.maxRating > 0 ? integration.maxRating : 'N/A'}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    Peak
                  </p>
                </div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
