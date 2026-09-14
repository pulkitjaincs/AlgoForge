import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Activity } from 'lucide-react';
import 'react-calendar-heatmap/dist/styles.css';

interface ActivityHeatmapProps {
  heatmapRange: string;
  heatmapYears: number[];
  handleRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  combinedHeatmap: any[];
  startDate: Date;
  endDate: Date;
  daysDiff: number;
}

export function ActivityHeatmap({
  heatmapRange,
  heatmapYears,
  handleRangeChange,
  combinedHeatmap,
  startDate,
  endDate,
  daysDiff
}: ActivityHeatmapProps) {
  return (
    <div className="glass p-6 rounded-xl border-border-dark">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-primary" /> Cross-Platform Activity
        </h3>
        <select
          value={heatmapRange}
          onChange={handleRangeChange}
          className="bg-bg-elevated border border-border-dark text-text-main text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2"
        >
          <option value="6months">Past 6 Months</option>
          <option value="1year">Past 1 Year</option>
          {heatmapYears.map(y => (
            <option key={y} value={y.toString()}>Year {y}</option>
          ))}
        </select>
      </div>
      <div className="w-full text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-main)', padding: 20, borderRadius: 8, border: '1px solid var(--border-dark)' }}>
        <div style={{ width: `${Math.max(300, Math.ceil(daysDiff / 7) * 15 + 40)}px` }}>
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={combinedHeatmap}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              return `color-scale-${Math.min(value.count, 4)}`;
            }}
            titleForValue={(value) => {
              if (!value || value.count === 0) return 'No activity';
              let text = `${value.count} total on ${value.date}`;
              if (value.platforms) {
                const breakdown = Object.entries(value.platforms)
                  .map(([p, c]) => `${c} ${p === 'github' ? 'commits' : 'submissions'} on ${p}`)
                  .join('\n');
                if (breakdown) text += `\n\n${breakdown}`;
              }
              return text;
            }}
          />
        </div>
      </div>
    </div>
  );
}
