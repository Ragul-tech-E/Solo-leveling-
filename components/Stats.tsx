import React, { useState } from 'react';
import { UserData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface StatsProps {
  user: UserData;
}

export const Stats: React.FC<StatsProps> = ({ user }) => {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');

  const getWeeklyData = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      result.push({
        day: dayName,
        reps: user.workoutLog[dateStr] || 0,
        fullDate: dateStr
      });
    }
    return result;
  };

  // Get overall sorted performance data
  const getOverallPerformanceData = () => {
    const sortedDates = Object.keys(user.workoutLog).sort();
    // If no data, return at least a zero point
    if (sortedDates.length === 0) return [{ date: 'Start', power: 0 }];
    
    return sortedDates.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      power: user.workoutLog[date] || 0
    }));
  };

  const weeklyData = getWeeklyData();
  const overallData = getOverallPerformanceData();

  const weightData = user.weightHistory.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: entry.value
  }));

  const completedDays = (Object.values(user.workoutLog) as number[]).filter(v => v > 0).length;

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-[#00f2ff]/15 pb-3">
         <h2 className="text-2xl font-rpg font-bold uppercase tracking-[0.1em] text-[#00f2ff] italic glow-text">Analytics</h2>
         <div className="flex space-x-5">
            <button onClick={() => setTab('weekly')} className={`text-[11px] font-bold uppercase tracking-widest transition-all ${tab === 'weekly' ? 'text-[#00f2ff] border-b border-[#00f2ff]' : 'text-slate-600'}`}>Weekly</button>
            <button onClick={() => setTab('monthly')} className={`text-[11px] font-bold uppercase tracking-widest transition-all ${tab === 'monthly' ? 'text-[#00f2ff] border-b border-[#00f2ff]' : 'text-slate-600'}`}>Monthly</button>
         </div>
      </div>

      {tab === 'weekly' ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] italic px-1">Intensity Log</h3>
            <div className="h-52 system-frame p-5 border-[#00f2ff]/5 rounded shadow-xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#2a4555" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="#2a4555" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0, 242, 255, 0.03)'}}
                    contentStyle={{ backgroundColor: '#010c14', border: '1px solid #00f2ff', borderRadius: '0', fontSize: '9px', padding: '4px' }}
                    itemStyle={{ color: '#00f2ff' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="reps" fill="#00f2ff" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="system-frame p-5 text-center border-[#00f2ff]/5 rounded shadow-lg">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold italic">Combat Power</p>
              <p className="text-3xl font-rpg font-bold text-white italic tracking-tighter glow-text">
                {Math.floor(user.level * 100 + user.xp / 100)}
              </p>
            </div>
            <div className="system-frame p-5 text-center border-[#00f2ff]/5 rounded shadow-lg">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold italic">Active Days</p>
              <p className="text-3xl font-rpg font-bold text-[#00f2ff] italic tracking-tighter glow-text">{user.streak}d</p>
            </div>
          </div>

          {/* Overall Connected Performance Graph */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] italic px-1">Combat Flux (Overall)</h3>
            <div className="h-48 system-frame p-5 border-[#00f2ff]/5 rounded shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,#00f2ff_0%,transparent_70%)]"></div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallData}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#010c14', border: '1px solid #00f2ff', borderRadius: '0', fontSize: '9px' }}
                    itemStyle={{ color: '#00f2ff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#00f2ff" 
                    strokeWidth={2} 
                    dot={{ r: 2, fill: '#00f2ff' }}
                    activeDot={{ r: 4, fill: '#fff', stroke: '#00f2ff' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] italic px-1">Evolution Graph</h3>
            <div className="h-56 system-frame p-5 border-[#00f2ff]/5 rounded shadow-xl">
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.05} />
                    <XAxis dataKey="date" stroke="#2a4555" fontSize={9} />
                    <YAxis stroke="#2a4555" fontSize={9} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#010c14', border: '1px solid #00f2ff', borderRadius: '0', fontSize: '9px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#00f2ff" strokeWidth={2} dot={{ r: 3, fill: '#00f2ff', stroke: '#fff', strokeWidth: 1 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase tracking-widest italic font-bold">Incomplete Manifest</div>
              )}
            </div>
          </div>
          
          <div className="system-frame p-5 space-y-5 border-[#00f2ff]/5 rounded shadow-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00f2ff] border-b border-[#00f2ff]/10 pb-2.5 italic">Mission Archives</h4>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 uppercase tracking-tight italic">Efficacy</span>
              <span className="text-white font-bold font-mono">98%</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 uppercase tracking-tight italic">Cleared Units</span>
              <span className="text-white font-bold font-mono">{completedDays}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};