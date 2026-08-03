import React from 'react';
import { useAnalyticsSummary, useAnalyticsStreaks, useTopicMastery, useWeakAreas, useVelocity, useAnalyticsHeatmap } from '../hooks/useAnalytics';
import { useDailyPlan } from '../hooks/usePractice';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import { Activity, Target, Zap, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function DashboardPage() {
  const { data: summary } = useAnalyticsSummary();
  const { data: streaks } = useAnalyticsStreaks();
  const { data: mastery } = useTopicMastery();
  const { data: weakAreas } = useWeakAreas();
  const { data: velocity } = useVelocity();
  const { data: heatmap } = useAnalyticsHeatmap(new Date().getFullYear());
  const { data: dailyPlan } = useDailyPlan();

  if (!summary || !streaks || !mastery || !weakAreas || !velocity || !heatmap || !dailyPlan) {
    return <div className="p-8 text-center text-text-muted">Loading Dashboard...</div>;
  }

  const difficultyData = [
    { name: 'Easy', value: summary.solvedByDifficulty.Easy || 0, color: '#10b981' },
    { name: 'Medium', value: summary.solvedByDifficulty.Medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: summary.solvedByDifficulty.Hard || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const radarData = mastery.map((t: any) => ({
    subject: t.title,
    A: t.percentage,
    fullMark: 100,
  }));

  const lineData = velocity.map((v: any) => ({ name: v.period, solved: v.count }));

  const heatmapValues = heatmap.map((h: any) => ({ date: h.date, count: h.count }));

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text-main">Analytics Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-xl flex items-center gap-4 hover:border-brand-primary/30 transition-all">
            <div className="p-3 bg-brand-primary/10 rounded-xl"><Target className="text-brand-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{summary.solvedQuestions}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Total Solved</p>
            </div>
          </div>
          <div className="glass p-4 rounded-xl flex items-center gap-4 hover:border-warning/30 transition-all">
            <div className="p-3 bg-warning/10 rounded-xl"><Zap className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{streaks.currentStreak} Days</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Current Streak</p>
            </div>
          </div>
          <div className="glass p-4 rounded-xl flex items-center gap-4 hover:border-success/30 transition-all">
            <div className="p-3 bg-success/10 rounded-xl"><Activity className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{streaks.maxStreak} Days</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Longest Streak</p>
            </div>
          </div>
          <div className="glass p-4 rounded-xl flex items-center gap-4 hover:border-brand-accent/30 transition-all">
            <div className="p-3 bg-brand-accent/10 rounded-xl"><Clock className="text-brand-accent" /></div>
            <div>
              <p className="text-lg font-bold text-text-main">{summary.totalQuestions}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Total Questions</p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Activity Heatmap</h3>
            <div className="w-full text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-main)', padding: 20, borderRadius: 8, border: '1px solid var(--border-dark)' }}>
              <CalendarHeatmap
                startDate={new Date(new Date().getFullYear(), 0, 1)}
                endDate={new Date(new Date().getFullYear(), 11, 31)}
                values={heatmapValues}
                classForValue={(value) => {
                  if (!value) return 'color-empty';
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
              />
            </div>
          </div>
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Weekly Velocity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                  <Line type="monotone" dataKey="solved" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--brand-primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass p-6 rounded-xl col-span-1 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Difficulty Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={difficultyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Topic Mastery</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" stroke="#888" tick={{fontSize: 10}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#555" />
                  <Radar name="Mastery %" dataKey="A" stroke="var(--brand-accent)" fill="var(--brand-accent)" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Practice Plan & Weak Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-xl border border-warning/20 hover:border-warning/50 transition-all">
            <h3 className="text-lg font-semibold mb-4 text-warning flex items-center gap-2">
              <Target className="w-5 h-5" /> Focus Areas
            </h3>
            <ul className="space-y-3">
              {weakAreas.length === 0 ? (
                <p className="text-text-muted text-sm">Not enough data to determine weak areas yet.</p>
              ) : (
                weakAreas.map((w: any) => (
                  <li key={w.topicId} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="font-medium text-text-main">{w.title}</span>
                    <span className="text-warning text-sm font-semibold">{w.percentage}% Mastery</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          <div className="glass p-6 rounded-xl border border-success/20 hover:border-success/50 transition-all">
            <h3 className="text-lg font-semibold mb-4 text-success flex items-center gap-2">
              <Zap className="w-5 h-5" /> Today's Practice Plan
            </h3>
            <div className="space-y-4">
              {dailyPlan.review.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Review Queue</h4>
                  <ul className="space-y-2">
                    {dailyPlan.review.map((q: any) => <li key={q.id} className="text-sm text-text-main bg-white/5 p-2 rounded border border-white/5">{q.title}</li>)}
                  </ul>
                </div>
              )}
              {dailyPlan.weak.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider mt-4">Weak Areas</h4>
                  <ul className="space-y-2">
                    {dailyPlan.weak.map((q: any) => <li key={q.id} className="text-sm text-text-main bg-white/5 p-2 rounded border border-white/5">{q.title}</li>)}
                  </ul>
                </div>
              )}
              {dailyPlan.random.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider mt-4">Random</h4>
                  <ul className="space-y-2">
                    {dailyPlan.random.map((q: any) => <li key={q.id} className="text-sm text-text-main bg-white/5 p-2 rounded border border-white/5">{q.title}</li>)}
                  </ul>
                </div>
              )}
              {dailyPlan.review.length === 0 && dailyPlan.weak.length === 0 && dailyPlan.random.length === 0 && (
                <p className="text-text-muted text-sm">No questions available for practice today!</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
