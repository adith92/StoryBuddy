import React from "react";
import { useAppStore } from "../store";
import { ArrowLeft, User, Sparkles } from "lucide-react";

export const AvatarCreator: React.FC<{ onViewChange: (view: "dashboard" | "parentPortal") => void }> = ({ onViewChange }) => {
  const { avatar, setAvatar } = useAppStore();

  const handleUpdate = (key: keyof typeof avatar, value: string) => {
    setAvatar({ [key]: value });
  };

  const getImageUrl = () => {
    const prompt = `A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing a ${avatar.clothing}, accessory: ${avatar.accessory}. 2d vector art bright child friendly simple portrait.`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true&seed=avatar`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 flex flex-col min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => onViewChange("dashboard")} className="text-blue-600 hover:bg-blue-100 rounded-full px-6 py-2 font-bold flex items-center shadow-sm border-2 border-blue-200 transition-colors bg-white">
          <ArrowLeft className="mr-2" size={20} /> Back to Home
        </button>
        <button onClick={() => onViewChange("parentPortal")} className="text-purple-600 hover:bg-purple-100 rounded-full px-6 py-2 font-bold flex items-center shadow-sm border-2 border-purple-200 transition-colors bg-white">
          Parent Settings ⚙️
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[48px] p-8 shadow-xl border-8 border-white flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-50"></div>
             <div className="relative z-10 w-64 h-64 bg-white rounded-full p-4 shadow-2xl mb-6">
                <img src={getImageUrl()} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-blue-100" />
             </div>
             <h2 className="text-3xl font-black text-blue-900 relative z-10 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> Your Hero <Sparkles className="text-yellow-400" />
             </h2>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-lg space-y-6">
           <h3 className="text-2xl font-black text-blue-950 border-b-4 border-blue-100 pb-4">Customize</h3>
           
           <div className="space-y-4">
             <div>
               <label className="block font-bold text-blue-800 mb-2">Skin Tone</label>
               <div className="flex gap-2">
                 {['light', 'medium', 'dark'].map(tone => (
                   <button key={tone} onClick={() => handleUpdate('skinTone', tone)} className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-transform hover:scale-105 active:scale-95 border-4 \${avatar.skinTone === tone ? 'bg-orange-100 border-orange-400 text-orange-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {tone}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">Hair Color</label>
               <div className="flex gap-2">
                 {['black', 'brown', 'blonde', 'red'].map(color => (
                   <button key={color} onClick={() => handleUpdate('hairColor', color)} className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-transform hover:scale-105 active:scale-95 border-4 \${avatar.hairColor === color ? 'bg-orange-100 border-orange-400 text-orange-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {color}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">Hair Style</label>
               <div className="flex flex-wrap gap-2">
                 {['short', 'curly', 'long', 'bald', 'spiky'].map(style => (
                   <button key={style} onClick={() => handleUpdate('hairStyle', style)} className={`px-4 py-2 rounded-xl font-bold capitalize transition-all border-4 \${avatar.hairStyle === style ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {style}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">Clothing</label>
               <div className="flex flex-wrap gap-2">
                 {['t-shirt', 'superhero cape', 'wizard robe', 'astronaut suit', 'princess dress'].map(clothing => (
                   <button key={clothing} onClick={() => handleUpdate('clothing', clothing)} className={`px-4 py-2 rounded-xl font-bold capitalize transition-all border-4 \${avatar.clothing === clothing ? 'bg-green-100 border-green-400 text-green-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {clothing}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">Accessory</label>
               <div className="flex flex-wrap gap-2">
                 {['none', 'glasses', 'magic wand', 'pirate hat', 'crown'].map(acc => (
                   <button key={acc} onClick={() => handleUpdate('accessory', acc)} className={`px-4 py-2 rounded-xl font-bold capitalize transition-all border-4 \${avatar.accessory === acc ? 'bg-purple-100 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {acc}
                   </button>
                 ))}
               </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
};
