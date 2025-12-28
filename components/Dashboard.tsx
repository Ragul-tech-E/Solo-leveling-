import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { getRankForLevel, getNextLevelXP } from '../constants';

interface DashboardProps {
  user: UserData;
  onUpdateWorkout: (id: string, increment: number) => void;
  onEditToggle: () => void;
  isEditing: boolean;
  onDeleteExercise: (id: string) => void;
  onAddExercise: (name: string, target: number) => void;
  onActivateRecovery: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, onUpdateWorkout, onEditToggle, isEditing, onDeleteExercise, onAddExercise, onActivateRecovery 
}) => {
  const rank = getRankForLevel(user.level);
  const nextXP = getNextLevelXP(user.level);
  const [inc, setInc] = useState<1 | 10 | 100>(1);
  const [newExName, setNewExName] = useState('');
  const [newExTarget, setNewExTarget] = useState(100);
  const [timeLeft, setTimeLeft] = useState('23:59:59');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsLate(now.getHours() >= 20);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const questCompleted = user.exercises.every(ex => ex.count >= ex.target);

  const getEfficiencyRank = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 10) return { rank: "S", label: "GODLIKE" };
    if (hour < 14) return { rank: "A", label: "ELITE" };
    if (hour < 18) return { rank: "B", label: "PROPER" };
    if (hour < 21) return { rank: "C", label: "ADEQUATE" };
    return { rank: "E", label: "SURVIVAL" };
  };

  const efficiency = getEfficiencyRank();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Skill Points Overlay */}
      <div className="flex justify-end px-1 -mb-4">
        <div className="flex items-center space-x-1.5 bg-[#00f2ff]/5 border border-[#00f2ff]/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,242,255,0.05)]">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">SP:</span>
          <span className="text-[10px] text-[#00f2ff] font-rpg font-bold glow-text italic">{user.skillPoints}</span>
        </div>
      </div>

      {/* Quest Info Frame */}
      <div className="system-frame p-6 rounded border-double border-[3px] border-[#00f2ff]/50">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0">
            <button 
              onClick={onEditToggle} 
              className={`p-1 border border-[#00f2ff]/30 rounded hover:bg-[#00f2ff]/10 transition-colors ${isEditing ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'text-[#00f2ff]/60'}`}
              title="Edit Exercises"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center items-center space-x-3">
            <div className="w-8 h-8 border-2 border-[#00f2ff] rounded-full flex items-center justify-center text-[#00f2ff] font-bold text-xl shadow-[0_0_10px_rgba(0,242,255,0.4)]">!</div>
            <h2 className="text-2xl font-rpg font-bold text-[#00f2ff] uppercase tracking-[0.2em] italic glow-text">Quest Info</h2>
          </div>
        </div>

        <div className="text-center space-y-6">
          <p className="text-[11px] text-[#00f2ff] font-medium italic mb-1">
            {questCompleted ? '[Mission Clear.]' : '[Daily Quest arrived.]'}
          </p>
          
          <div className="inline-block border-b border-[#00f2ff]/40 px-8 pb-0.5">
            <h3 className="text-xl font-rpg font-bold text-[#d1f7ff] uppercase tracking-[0.4em] italic">Goal</h3>
          </div>

          <div className="space-y-4 pt-6 max-w-[240px] mx-auto text-left">
            {user.exercises.map(ex => {
              const isExact = ex.count === ex.target;
              const isExceeded = ex.count > ex.target;
              const isCompleted = ex.count >= ex.target;
              
              const VIOLET = '#d946ef';
              const GREEN = '#22c55e';
              const SYSTEM_BLUE = '#00f2ff';
              
              let statusColor = SYSTEM_BLUE;
              if (isExact) statusColor = GREEN;
              else if (isExceeded) statusColor = VIOLET;

              return (
                <div key={ex.id} className="flex justify-between items-center group">
                  <div className="flex items-center space-x-2">
                    {isEditing && (
                      <button onClick={() => onDeleteExercise(ex.id)} className="text-red-500 hover:scale-110 transition-all p-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                    <span 
                      className="text-[12px] font-bold uppercase tracking-wide min-w-[80px] transition-colors duration-300"
                      style={{ color: statusColor }}
                    >
                      {ex.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="quest-bracket flex items-center space-x-1.5 py-0.5 transition-all duration-300"
                      style={{ borderColor: statusColor }}
                    >
                      <span 
                        className="text-[12px] font-mono font-bold tracking-wider"
                        style={{ color: statusColor }}
                      >
                        [{ex.count}/{ex.target}]
                      </span>
                      {isCompleted && (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: statusColor }} viewBox="0 0 20 20" fill="currentColor">
                           <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                         </svg>
                      )}
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => onUpdateWorkout(ex.id, inc)} 
                        className="w-7 h-7 rounded border border-[#00f2ff]/30 text-[#00f2ff] flex items-center justify-center text-base active:bg-[#00f2ff]/20 transition-all font-bold shadow-[0_0_5px_rgba(0,242,255,0.1)]"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditing && (
              <div className="pt-4 space-y-2 border-t border-[#00f2ff]/10 mt-4">
                <input 
                  type="text" 
                  placeholder="New Exercise Name" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-[#010c14] border border-[#00f2ff]/20 p-2 text-[11px] text-[#d1f7ff] outline-none"
                />
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="Target" 
                    value={newExTarget}
                    onChange={(e) => setNewExTarget(Number(e.target.value))}
                    className="flex-1 bg-[#010c14] border border-[#00f2ff]/20 p-2 text-[11px] text-[#d1f7ff] outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (newExName) {
                        onAddExercise(newExName, newExTarget);
                        setNewExName('');
                      }
                    }}
                    className="px-3 bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] text-[10px] font-bold"
                  >
                    ADD
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 text-center">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto italic">
              Leveling requires <span className="text-[#00f2ff] font-bold italic">Persistence (6d)</span> or <span className="text-red-500 font-bold italic">Overcoming (2x)</span>.
            </p>
          </div>

          {/* TIMER AND BIG TICK BOX */}
          <div className="flex flex-col items-center pt-6 space-y-4">
             {questCompleted ? (
               <div className="flex flex-col items-center animate-in zoom-in duration-700">
                 <span className="text-[8px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-0.5 italic">Mission Efficiency</span>
                 <div className="flex items-baseline space-x-1">
                   <span className="text-2xl font-rpg font-bold text-[#00f2ff] glow-text italic">{efficiency.rank}-Rank</span>
                   <span className="text-[8px] text-[#00f2ff]/60 uppercase font-bold tracking-widest italic">[{efficiency.label}]</span>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <span className="text-[8px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-0.5 italic">Time Remaining</span>
                 <span className={`text-xs font-mono font-bold tracking-[0.3em] ${isLate ? 'text-red-500 animate-pulse glow-text-red' : 'text-[#00f2ff] glow-text'}`}>
                   {timeLeft}
                 </span>
               </div>
             )}

             <div 
               className={`w-12 h-12 border-2 flex items-center justify-center transition-all duration-700 bg-black/20 ${questCompleted ? 'border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.3)]' : 'border-slate-800'}`}
             >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-8 w-8 transition-colors duration-700 ${questCompleted ? 'text-[#22c55e]' : 'text-slate-900'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] italic">Hunter Rank</p>
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl font-rpg font-bold text-[#00f2ff] italic uppercase tracking-tighter glow-text">{rank}</span>
              <span className="text-[9px] bg-[#00f2ff]/10 border border-[#00f2ff]/30 px-1.5 py-0.5 rounded text-[#00f2ff] font-bold">LVL {user.level}</span>
            </div>
          </div>
          <div className="flex space-x-1">
            {[1, 10, 100].map(m => (
              <button key={m} onClick={() => setInc(m as any)} className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border transition-all active:scale-95 ${inc === m ? 'bg-[#00f2ff]/15 border-[#00f2ff] text-[#00f2ff]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>+{m}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-widest px-1">
            <span>Mana Gauge (Growth)</span>
            <span className="text-[#00f2ff] font-mono">{Math.floor(user.xp)} / {Math.floor(nextXP)}</span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-sm border border-[#00f2ff]/10 overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#00f2ff] to-[#00aaff] shadow-[0_0_8px_rgba(0,242,255,0.4)] transition-all duration-700 ease-out" style={{width: `${(user.xp/nextXP)*100}%`}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};