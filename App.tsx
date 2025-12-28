
import React, { useState, useEffect } from 'react';
import { UserData, View, Exercise, Rank } from './types';
import { getNextLevelXP, XP_PER_REP, getRankForLevel } from './constants';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { Stats } from './components/Stats';
import { Onboarding } from './components/Onboarding';
import { recoverFromSignature } from './services/encryption';
import { audioService } from './services/audio';

const STORAGE_KEY = 'SL_HUNTER_DATA_BLUE';
const INITIAL_EXERCISES: Exercise[] = [
  { id: '1', name: 'Push-ups', count: 0, target: 100 },
  { id: '2', name: 'Sit-ups', count: 0, target: 100 },
  { id: '3', name: 'Squats', count: 0, target: 100 },
  { id: '4', name: 'Running', count: 0, target: 10 },
];

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<View>('dashboard');
  const [isEditingWorkouts, setIsEditingWorkouts] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // High-stakes alarm states
  const [alarmActive, setAlarmActive] = useState<{type: 'QUEST' | 'PENALTY', title: string} | null>(null);
  const [countdown, setCountdown] = useState('00:00:00');
  const [lastAlarmHour, setLastAlarmHour] = useState<number>(-1);

  // Popup States with dismissal logic
  const [questCompletedPopup, setQuestCompletedPopup] = useState(false);
  const [isDismissingQuestPopup, setIsDismissingQuestPopup] = useState(false);

  const [levelUpPopup, setLevelUpPopup] = useState<{reason: string} | null>(null);
  const [isDismissingLevelPopup, setIsDismissingLevelPopup] = useState(false);

  const [rankUpPopup, setRankUpPopup] = useState<Rank | null>(null);
  const [isDismissingRankPopup, setIsDismissingRankPopup] = useState(false);

  // 1. App Startup
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData(parsed);
      if (parsed.alarmAudio) audioService.setUserAlarm(parsed.alarmAudio);
    }
    setIsInitialized(true);

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 2. Core System Loop (Alarms & Heartbeat)
  useEffect(() => {
    const systemTicker = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);

      if (userData && !userData.recoveryActive) {
        const questDone = userData.exercises.every(ex => ex.count >= ex.target);
        
        if (!questDone && !alarmActive && lastAlarmHour !== currentHour) {
          if (currentHour >= 8) {
            const isPenalty = currentHour >= 18;
            const type = isPenalty ? 'PENALTY' : 'QUEST';
            const title = isPenalty ? 'PENALTY PROTOCOL' : 'DAILY QUEST WARNING';
            
            setAlarmActive({ type, title });
            audioService.startAlarm();
            
            if (Notification.permission === 'granted') {
              new Notification("THE SYSTEM", {
                body: `[CRITICAL] ${title}. Hunter presence demanded.`,
                requireInteraction: true,
                tag: 'system-hourly-alarm'
              });
            }
          }
        }
      }

      if (userData && alarmActive) {
        const questDone = userData.exercises.every(ex => ex.count >= ex.target);
        if (questDone) handleDismissAlarm();
      }
    }, 1000);

    return () => clearInterval(systemTicker);
  }, [userData, alarmActive, lastAlarmHour]);

  const handleDismissAlarm = () => {
    audioService.stopAlarm();
    setAlarmActive(null);
    setLastAlarmHour(new Date().getHours());
    audioService.play('CLICK');
  };

  // Unified Dismissal Handlers
  const closeQuestPopup = () => {
    if (isDismissingQuestPopup) return;
    setIsDismissingQuestPopup(true);
    audioService.play('CLICK');
    setTimeout(() => {
      setQuestCompletedPopup(false);
      setIsDismissingQuestPopup(false);
    }, 500);
  };

  const closeLevelPopup = () => {
    if (isDismissingLevelPopup) return;
    setIsDismissingLevelPopup(true);
    audioService.play('CLICK');
    setTimeout(() => {
      setLevelUpPopup(null);
      setIsDismissingLevelPopup(false);
    }, 500);
  };

  const closeRankPopup = () => {
    if (isDismissingRankPopup) return;
    setIsDismissingRankPopup(true);
    audioService.play('CLICK');
    setTimeout(() => {
      setRankUpPopup(null);
      setIsDismissingRankPopup(false);
    }, 500);
  };

  useEffect(() => {
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      audioService.setEnabled(!userData.isSilent);
    }
  }, [userData]);

  const updateWorkout = (exerciseId: string, increment: number) => {
    if (!userData || userData.recoveryActive) return;
    audioService.play('CLICK');

    setUserData(prev => {
      if (!prev) return null;
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastWorkoutDate !== today;
      const exSource = isNewDay ? INITIAL_EXERCISES.map(e => ({...e, count: 0})) : prev.exercises;
      const newEx = exSource.map(ex => ex.id === exerciseId ? { ...ex, count: ex.count + increment } : ex);
      
      const questJustCompleted = newEx.every(ex => ex.count >= ex.target);
      const hiddenQuestAchieved = newEx.every(ex => ex.count >= ex.target * 2);
      
      const updatedLog = { ...prev.workoutLog };
      updatedLog[today] = (updatedLog[today] || 0) + increment;

      let newLevel = prev.level;
      let newStreak = isNewDay ? prev.streak : prev.streak;
      let questCompletedToday = isNewDay ? false : prev.questCompletedToday;
      let hiddenQuestTriggeredToday = isNewDay ? false : prev.hiddenQuestTriggeredToday;
      let levelingReason = "";

      if (questJustCompleted && !questCompletedToday) {
        audioService.play('QUEST_CLEAR');
        setQuestCompletedPopup(true);
        questCompletedToday = true;
        newStreak += 1;
        if (newStreak % 6 === 0) {
          newLevel += 1;
          levelingReason = "6-DAY STREAK ACHIEVED";
        }
      }

      if (hiddenQuestAchieved && !hiddenQuestTriggeredToday) {
        hiddenQuestTriggeredToday = true;
        newLevel += 1;
        levelingReason = "HIDDEN QUEST TRIGGERED";
      }

      if (levelingReason) {
        const oldRank = getRankForLevel(prev.level);
        const newRank = getRankForLevel(newLevel);
        audioService.play('LEVEL_UP');
        setLevelUpPopup({ reason: levelingReason });
        if (oldRank !== newRank) {
          setTimeout(() => { audioService.play('RANK_UP'); setRankUpPopup(newRank); }, 800);
        }
      }

      return {
        ...prev,
        exercises: newEx,
        workoutLog: updatedLog,
        xp: prev.xp + (increment * XP_PER_REP),
        level: newLevel,
        streak: newStreak,
        lastWorkoutDate: today,
        questCompletedToday,
        hiddenQuestTriggeredToday
      };
    });
  };

  const handleOnboardingComplete = (data: Partial<UserData>) => {
    const newUser: UserData = {
      ...data,
      level: 1, xp: 0, streak: 0, skillPoints: 0, recoveryDays: 0, daysCompletedThisWeek: 0,
      lastWorkoutDate: null, exercises: INITIAL_EXERCISES.map(e => ({...e})),
      weightHistory: [{ date: new Date().toISOString(), value: data.weight || 70 }],
      heightHistory: [{ date: new Date().toISOString(), value: data.height || 175 }],
      recoveryActive: false, recoveryEndTime: null, workoutLog: {},
      penaltyActive: false, lastMonthCheck: new Date().toISOString().substring(0, 7),
      alarmAudio: null, isSilent: false, questCompletedToday: false, hiddenQuestTriggeredToday: false
    } as UserData;
    setUserData(newUser);
    audioService.play('NOTIFICATION');
  };

  if (!isInitialized) return <div className="min-h-screen bg-[#010c14]" />;
  if (!userData) return <Onboarding onComplete={handleOnboardingComplete} />;

  const isPenaltyMode = alarmActive?.type === 'PENALTY';

  return (
    <div className={`h-screen w-full flex flex-col bg-[#010c14] max-sm:w-full sm:max-w-sm mx-auto border-x border-[#00f2ff]/10 relative overflow-hidden shadow-2xl transition-all duration-700 ${userData.isSilent ? 'grayscale-[0.5] contrast-125' : ''}`}>
      
      {/* IMMERSIVE ALARM OVERLAY - Ultra Translucent */}
      {alarmActive && (
        <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center p-8 backdrop-blur-[32px] transition-all duration-700 ${isPenaltyMode ? 'bg-red-950/15 animate-pulse-red' : 'bg-[#010c14]/15'}`}>
          <div className={`absolute inset-0 opacity-20 pointer-events-none ${isPenaltyMode ? 'bg-[radial-gradient(circle_at_center,var(--system-red)_0%,transparent_80%)]' : 'bg-[radial-gradient(circle_at_center,var(--system-blue)_0%,transparent_80%)]'}`}></div>
          <div className={`text-center mb-12 ${isPenaltyMode ? 'glitch-anim' : ''}`}>
             <h2 className={`text-5xl font-rpg font-extrabold tracking-tighter uppercase italic mb-2 ${isPenaltyMode ? 'text-red-500 glow-text-red' : 'text-[#00f2ff] glow-text'}`}>
               {alarmActive.title}
             </h2>
             <div className={`h-1 w-32 mx-auto ${isPenaltyMode ? 'bg-red-600 shadow-[0_0_20px_red]' : 'bg-[#00f2ff] shadow-[0_0_20px_#00f2ff]'}`}></div>
          </div>
          <div className={`system-frame p-10 w-full max-w-[340px] text-center border-double border-8 transition-all duration-1000 ${isPenaltyMode ? 'border-red-600/40 bg-black/10 shadow-[0_0_60px_rgba(255,0,0,0.2)]' : 'border-[#00f2ff]/30 bg-transparent shadow-[0_0_40px_rgba(0,242,255,0.1)]'}`}>
            <p className={`text-[11px] uppercase tracking-[0.5em] font-bold mb-6 italic ${isPenaltyMode ? 'text-red-400' : 'text-[#00f2ff]/60'}`}>System Evaluation Timer</p>
            <div className={`text-6xl font-mono font-bold italic mb-12 tracking-widest ${isPenaltyMode ? 'text-red-500 glow-text-red' : 'text-white glow-text'}`}>{countdown}</div>
            <button onClick={handleDismissAlarm} className={`w-full py-6 font-bold text-sm tracking-[0.6em] uppercase transition-all active:scale-95 shadow-xl ${isPenaltyMode ? 'bg-red-600/80 text-white' : 'bg-[#00f2ff]/80 text-black'}`}>Acknowledge</button>
          </div>
        </div>
      )}

      <header className="flex-none p-4 border-b border-[#00f2ff]/10 flex justify-between items-center bg-[#010c14]/90 backdrop-blur-md z-40">
        <div className="flex items-center space-x-2.5">
           <div className={`w-2.5 h-2.5 rounded-sm transition-all duration-500 ${userData.isSilent ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]'}`}></div>
           <h1 className="text-xl font-rpg font-bold text-[#00f2ff] tracking-tight italic uppercase glow-text">The System</h1>
        </div>
        <div className="text-[10px] text-[#00f2ff]/40 font-mono tracking-widest uppercase">LVL: {userData.level}</div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-container p-4 relative z-10 pb-20">
        {activeTab === 'dashboard' && (
          <Dashboard 
            user={userData} 
            onUpdateWorkout={updateWorkout}
            onEditToggle={() => { audioService.play('CLICK'); setIsEditingWorkouts(!isEditingWorkouts); }}
            isEditing={isEditingWorkouts}
            onDeleteExercise={(id) => { audioService.play('CLICK'); setUserData(p => p ? {...p, exercises: p.exercises.filter(e => e.id !== id)} : null); }}
            onAddExercise={(n, t) => { audioService.play('NOTIFICATION'); setUserData(p => p ? {...p, exercises: [...p.exercises, {id: Date.now().toString(), name: n, target: t, count: 0}]} : null); }}
            onActivateRecovery={() => { audioService.play('NOTIFICATION'); setUserData(p => p ? {...p, recoveryActive: true, recoveryEndTime: Date.now() + 86400000} : null); }}
          />
        )}
        {activeTab === 'stats' && <Stats user={userData} />}
        {activeTab === 'profile' && (
          <Profile user={userData} onUpdateUser={(u) => { audioService.play('CLICK'); setUserData(p => p ? {...p, ...u} : null); }} onRecover={(s) => { audioService.play('NOTIFICATION'); setUserData(recoverFromSignature(s)); }} onRestoreByGmail={() => {}} />
        )}
      </main>

      {/* POPUPS WITH ENHANCED TRANSPARENCY AND CRYSTAL GLASS EFFECT */}
      {/* 1. QUEST CLEAR POPUP */}
      {questCompletedPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/15 backdrop-blur-[32px]" onClick={closeQuestPopup}>
           <div className={`system-frame p-8 text-center w-full max-w-[280px] bg-transparent border-[#00f2ff]/20 ${isDismissingQuestPopup ? 'animate-popup-exit' : 'animate-popup-enter'}`}>
              <h2 className="text-3xl font-rpg font-bold text-[#00f2ff] tracking-widest uppercase italic glow-text mb-4">Quest Cleared</h2>
              <p className="text-[10px] text-[#00f2ff]/60 uppercase font-bold tracking-[0.3em]">Evaluation Complete. Growth Confirmed.</p>
              <div className="mt-8 text-[9px] text-white/30 uppercase tracking-[0.5em] animate-pulse">Tap to Acknowledge</div>
           </div>
        </div>
      )}

      {/* 2. LEVEL UP POPUP */}
      {levelUpPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/15 backdrop-blur-[32px]" onClick={closeLevelPopup}>
           <div className={`system-frame p-8 text-center w-full max-w-[280px] bg-transparent border-white/20 ${isDismissingLevelPopup ? 'animate-popup-exit' : 'animate-popup-enter'}`}>
              <h2 className="text-4xl font-rpg font-bold text-white tracking-widest uppercase italic glow-text mb-2">Level Up</h2>
              <p className="text-[10px] text-[#00f2ff] uppercase font-bold tracking-[0.2em]">{levelUpPopup.reason}</p>
              <div className="mt-8 text-[9px] text-white/30 uppercase tracking-[0.5em] animate-pulse">Tap to Continue</div>
           </div>
        </div>
      )}

      {/* 3. RANK ADVANCED POPUP */}
      {rankUpPopup && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-[#00f2ff]/3 backdrop-blur-[32px]" onClick={closeRankPopup}>
           <div className={`system-frame p-10 text-center w-full max-w-[280px] border-[#00f2ff]/30 border-4 bg-transparent ${isDismissingRankPopup ? 'animate-popup-exit' : 'animate-popup-enter'}`}>
              <p className="text-[10px] text-[#00f2ff] uppercase font-bold tracking-[0.5em] mb-4">Hunter Rank Advanced</p>
              <h2 className="text-5xl font-rpg font-bold text-white tracking-tighter uppercase italic glow-text">{rankUpPopup}</h2>
              <div className="mt-10 text-[9px] text-white/30 uppercase tracking-[0.5em] animate-pulse">Tap to Advance</div>
           </div>
        </div>
      )}

      <nav className="flex-none bg-[#010c14]/95 border-t border-[#00f2ff]/10 p-3 flex justify-around items-center z-40">
        {[
          {id: 'dashboard', label: 'Quest', icon: 'M13 10V3L4 14h7v7l9-11h-7z'},
          {id: 'stats', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z'},
          {id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'}
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => { audioService.play('CLICK'); setActiveTab(tab.id as View); }} 
            className={`flex flex-col items-center p-1.5 transition-all ${activeTab === tab.id ? 'text-[#00f2ff] scale-110 glow-text' : 'text-slate-600'}`}
          >
            <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="text-[9px] font-bold uppercase font-rpg italic tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Fix for index.tsx: Module '"file:///App"' has no default export.
export default App;
