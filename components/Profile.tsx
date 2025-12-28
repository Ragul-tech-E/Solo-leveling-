import React from 'react';
import { UserData } from '../types';
import { getRankForLevel } from '../constants';
import { generateSignature } from '../services/encryption';

interface ProfileProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
  onRecover: (signature: string) => void;
  onRestoreByGmail: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onRecover, onRestoreByGmail }) => {
  const [sigInput, setSigInput] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  const handleGenerateCrystal = () => {
    const signature = generateSignature(user);
    navigator.clipboard.writeText(signature);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center py-4">
        <div className={`w-24 h-24 mx-auto border-2 shadow-[0_0_15px_rgba(0,242,255,0.25)] p-1 mb-4 bg-[#010c14] relative transition-all duration-500 ${user.isSilent ? 'border-red-600' : 'border-[#00f2ff]'}`}>
          {user.photo ? (
            <img src={user.photo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#00f2ff] text-4xl font-rpg font-bold italic">?</div>
          )}
          <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 flex items-center justify-center text-[10px] font-bold text-[#010c14] border-2 border-[#010c14] transition-all duration-500 ${user.isSilent ? 'bg-red-600' : 'bg-[#00f2ff]'}`}>
            {user.level}
          </div>
        </div>
        <h2 className="text-2xl font-rpg font-bold text-white uppercase italic tracking-wider glow-text">{user.name}</h2>
        <p className="text-[#00f2ff] text-[10px] uppercase tracking-[0.3em] font-bold mt-1.5 italic">{getRankForLevel(user.level)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="system-frame p-3 rounded border border-[#00f2ff]/15">
          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1.5 tracking-widest italic">Weight</p>
          <span className="text-xl font-bold text-[#d1f7ff] italic">{user.weight} <span className="text-[10px] text-slate-500 font-normal uppercase">kg</span></span>
        </div>
        <div className="system-frame p-3 rounded border border-[#00f2ff]/15">
          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1.5 tracking-widest italic">Height</p>
          <span className="text-xl font-bold text-[#d1f7ff] italic">{user.height} <span className="text-[10px] text-slate-500 font-normal uppercase">cm</span></span>
        </div>
      </div>

      <div className="system-frame p-5 rounded space-y-5">
        <h3 className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-[0.25em] border-b border-[#00f2ff]/15 pb-2.5 italic">Parameters</h3>
        
        {/* ENHANCED STEALTH TOGGLE */}
        <div 
          onClick={() => onUpdateUser({ isSilent: !user.isSilent })} 
          className={`group cursor-pointer p-4 border border-dashed transition-all duration-500 flex flex-col space-y-2 ${user.isSilent ? 'border-red-600/50 bg-red-950/10' : 'border-[#00f2ff]/20 bg-[#00f2ff]/5'}`}
        >
          <div className="flex justify-between items-center">
             <span className={`text-[11px] font-bold uppercase tracking-[0.2em] italic transition-colors ${user.isSilent ? 'text-red-500' : 'text-[#00f2ff]'}`}>
               {user.isSilent ? 'SYSTEM STEALTH ACTIVE' : 'SYSTEM STEALTH'}
             </span>
             <div className={`w-10 h-4 border p-0.5 flex transition-all duration-300 ${user.isSilent ? 'justify-end border-red-500' : 'justify-start border-slate-700'}`}>
                <div className={`w-2.5 h-full transition-all ${user.isSilent ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-slate-700'}`}></div>
             </div>
          </div>
          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest leading-tight">
            {user.isSilent 
              ? 'All audio modules suppressed. Shadows are silent.' 
              : 'Standard operation mode. High fidelity system sounds active.'}
          </p>
        </div>

        <button 
          onClick={handleGenerateCrystal}
          className={`w-full py-3 border border-[#00f2ff]/40 text-[#00f2ff] text-[10px] font-bold uppercase tracking-widest rounded transition-all active:scale-95 ${isCopied ? 'bg-[#00f2ff]/30' : 'bg-[#00f2ff]/5 hover:bg-[#00f2ff]/10'}`}
        >
          {isCopied ? 'CRYSTAL COPIED' : 'GENERATE CRYSTAL'}
        </button>
        
        <div className="pt-3 border-t border-[#00f2ff]/10">
          <p className="text-[9px] text-slate-500 font-bold uppercase mb-3 tracking-widest italic px-0.5">Shadow Crystal Recovery</p>
          <textarea 
            value={sigInput}
            onChange={(e) => setSigInput(e.target.value)}
            className="w-full bg-[#010c14] border border-[#00f2ff]/15 rounded p-2.5 text-[11px] font-mono text-[#00f2ff] outline-none h-20 resize-none mb-3 focus:border-[#00f2ff]/40 transition-all placeholder:text-slate-800"
            placeholder="[Paste Crystal Signature...]"
          />
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                if (sigInput) {
                  onRecover(sigInput);
                  setSigInput('');
                }
              }} 
              className="flex-1 py-3 bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#00f2ff]/20 active:scale-95 transition-all"
            >
              Recover
            </button>
            <button 
              className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded cursor-not-allowed"
            >
              Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};