import React from 'react';
import { UserData } from '../types';

interface OnboardingProps {
  onComplete: (data: Partial<UserData>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    age: 20,
    weight: 70,
    height: 175,
    photo: null as string | null
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    onComplete(formData);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col justify-center animate-in fade-in duration-1000">
      <div className="max-w-md mx-auto w-full space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-rpg font-extrabold text-[#00f2ff] glow-text italic tracking-tighter uppercase">
            System Awakened
          </h1>
          <p className="text-[#00f2ff]/40 mt-4 tracking-[0.3em] uppercase text-xs italic font-bold">New Hunter Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="system-frame p-8 rounded-sm space-y-8 border-double border-4 border-[#00f2ff]/40 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 border-2 border-[#00f2ff] flex items-center justify-center overflow-hidden bg-[#010c14] shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#00f2ff]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#00f2ff] uppercase tracking-[0.2em] italic">Hunter Designation</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#010c14] border border-[#00f2ff]/30 p-3 text-white text-sm focus:border-[#00f2ff] outline-none transition-all placeholder:text-slate-700 font-bold"
                placeholder="Designation Code..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#00f2ff] uppercase tracking-[0.2em] italic">Signal Frequency (Email)</label>
              <input 
                required
                type="email" 
                className="w-full bg-[#010c14] border border-[#00f2ff]/30 p-3 text-white text-sm focus:border-[#00f2ff] outline-none transition-all placeholder:text-slate-700 font-bold"
                placeholder="id@system.net"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#00f2ff] uppercase tracking-widest italic">Age</label>
                <input 
                  type="number" 
                  className="w-full bg-[#010c14] border border-[#00f2ff]/30 p-2 text-white text-xs outline-none focus:border-[#00f2ff]"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#00f2ff] uppercase tracking-widest italic">Mass</label>
                <input 
                  type="number" 
                  className="w-full bg-[#010c14] border border-[#00f2ff]/30 p-2 text-white text-xs outline-none focus:border-[#00f2ff]"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#00f2ff] uppercase tracking-widest italic">Height</label>
                <input 
                  type="number" 
                  className="w-full bg-[#010c14] border border-[#00f2ff]/30 p-2 text-white text-xs outline-none focus:border-[#00f2ff]"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-[#00f2ff]/10 text-[#00f2ff] border-2 border-[#00f2ff] font-bold text-sm tracking-[0.4em] uppercase hover:bg-[#00f2ff]/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
          >
            Awaken Hunter
          </button>
        </form>
      </div>
    </div>
  );
};