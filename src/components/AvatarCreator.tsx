import React from "react";
import { useAppStore } from "../store";
import { ArrowLeft, User, Sparkles } from "lucide-react";

export const AvatarCreator: React.FC<{ onViewChange: (view: "dashboard" | "parentPortal") => void }> = ({ onViewChange }) => {
  const { avatar, setAvatar, language } = useAppStore();

  const handleUpdate = (key: keyof typeof avatar, value: string) => {
    setAvatar({ [key]: value });
  };

  const getImageUrl = () => {
    const prompt = `A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing a ${avatar.clothing}, accessory: ${avatar.accessory}. 2d vector art bright child friendly simple portrait.`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true&seed=avatar`;
  };

  const t = {
    id: {
      back: "Kembali ke Beranda",
      parentSettings: "Pengaturan Orang Tua ⚙️",
      hero: "Pahlawanku",
      customize: "Ganti Penampilan",
      skin: "Warna Kulit",
      hairColor: "Warna Rambut",
      hairStyle: "Model Rambut",
      clothing: "Baju",
      accessory: "Aksesori",
      tones: ['Cerah', 'Sedang', 'Gelap'],
      colors: ['Hitam', 'Cokelat', 'Pirang', 'Merah'],
      styles: ['Pendek', 'Ikal', 'Panjang', 'Botak', 'Spiky']
    },
    en: {
      back: "Back to Home",
      parentSettings: "Parent Settings ⚙️",
      hero: "Your Hero",
      customize: "Customize",
      skin: "Skin Tone",
      hairColor: "Hair Color",
      hairStyle: "Hair Style",
      clothing: "Clothing",
      accessory: "Accessory",
      tones: ['Light', 'Medium', 'Dark'],
      colors: ['Black', 'Brown', 'Blonde', 'Red'],
      styles: ['Short', 'Curly', 'Long', 'Bald', 'Spiky']
    }
  }[language];

  const skinTones = ['light', 'medium', 'dark'];
  const hairColors = ['black', 'brown', 'blonde', 'red'];
  const hairStyles = ['short', 'curly', 'long', 'bald', 'spiky'];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 flex flex-col min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => onViewChange("dashboard")} className="text-blue-600 hover:bg-blue-100 rounded-full px-6 py-2 font-bold flex items-center shadow-sm border-2 border-blue-200 transition-colors bg-white">
          <ArrowLeft className="mr-2" size={20} /> {t.back}
        </button>
        <button onClick={() => onViewChange("parentPortal")} className="text-purple-600 hover:bg-purple-100 rounded-full px-6 py-2 font-bold flex items-center shadow-sm border-2 border-purple-200 transition-colors bg-white">
          {t.parentSettings}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[48px] p-8 shadow-xl border-8 border-white flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-50"></div>
             <div className="relative z-10 w-64 h-64 bg-white rounded-full p-4 shadow-2xl mb-6">
                <img src={getImageUrl()} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-blue-100" />
             </div>
             <h2 className="text-3xl font-black text-blue-900 relative z-10 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> {t.hero} <Sparkles className="text-yellow-400" />
             </h2>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-lg space-y-6">
           <h3 className="text-2xl font-black text-blue-950 border-b-4 border-blue-100 pb-4">{t.customize}</h3>
           
           <div className="space-y-4">
             <div>
               <label className="block font-bold text-blue-800 mb-2">{t.skin}</label>
               <div className="flex gap-2">
                 {skinTones.map((tone, i) => (
                   <button key={tone} onClick={() => handleUpdate('skinTone', tone)} className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-transform hover:scale-105 active:scale-95 border-4 ${avatar.skinTone === tone ? 'bg-orange-100 border-orange-400 text-orange-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {t.tones[i]}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">{t.hairColor}</label>
               <div className="flex gap-2">
                 {hairColors.map((color, i) => (
                   <button key={color} onClick={() => handleUpdate('hairColor', color)} className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-transform hover:scale-105 active:scale-95 border-4 ${avatar.hairColor === color ? 'bg-orange-100 border-orange-400 text-orange-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {t.colors[i]}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block font-bold text-blue-800 mb-2">{t.hairStyle}</label>
               <div className="flex flex-wrap gap-2">
                 {hairStyles.map((style, i) => (
                   <button key={style} onClick={() => handleUpdate('hairStyle', style)} className={`px-4 py-2 rounded-xl font-bold capitalize transition-all border-4 ${avatar.hairStyle === style ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     {t.styles[i]}
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
