import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip 
} from 'recharts';

interface ChartsProps {
  velocityData: any[];
  difficultyData: any[];
  radarData: any[];
}

export function Charts({ velocityData, difficultyData, radarData }: ChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-xl border-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-text-main">Weekly Velocity (Local)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dark)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                <Line type="monotone" dataKey="solved" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--brand-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl border-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-text-main">Difficulty Distribution (Local)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={difficultyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-xl border-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-text-main">Topic Mastery</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--border-dark)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{fontSize: 10}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-dark)" />
                <Radar name="Mastery %" dataKey="A" stroke="var(--brand-accent)" fill="var(--brand-accent)" fillOpacity={0.5} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* We'll handle the Focus Plan in another component */}
      </div>
    </>
  );
}
