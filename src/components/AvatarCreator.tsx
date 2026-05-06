import React, { useState, useRef } from "react";
import { useAppStore } from "../store";
import { ArrowLeft, User, Sparkles, Camera, Loader2 } from "lucide-react";
import { cartoonifyPhoto } from "../lib/gemini";
import { set } from "idb-keyval";
import { OfflineImage } from "./OfflineImage";
import { motion, AnimatePresence } from "motion/react";

export const AvatarCreator: React.FC<{ onViewChange: (view: "dashboard" | "parentPortal") => void }> = ({ onViewChange }) => {
  const { avatar, setAvatar, language } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdate = (key: keyof typeof avatar, value: string) => {
    setAvatar({ [key]: value, customImageData: undefined }); // clear custom if manually changed
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        try {
          const cartoonUrl = await cartoonifyPhoto(base64Data, file.type);
          const blob = await (await fetch(cartoonUrl)).blob();
          await set("custom-avatar", blob);
          setAvatar({ customImageData: "true" });
        } catch (err: any) {
          console.error(err);
          const errorMessage = err?.message || "";
          if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
            alert(language === "id" ? "Quota API habis (Rate limit exceeded). Silakan coba lagi nanti ya!" : "API Quota exceeded. Please try again later!");
          } else {
            alert(language === "id" ? "Gagal membuat avatar dari foto." : "Failed to create avatar from photo.");
          }
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setIsUploading(false);
    }
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
             <motion.div 
                className="relative z-10 w-64 h-64 bg-white rounded-full p-4 shadow-2xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             >
                {isUploading ? (
                  <div className="flex bg-slate-100 rounded-full w-full h-full items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={avatar.skinTone + avatar.hairStyle + avatar.hairColor + (avatar.customImageData || '')}
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-full h-full"
                    >
                      <OfflineImage cacheKey="custom-avatar" prompt={avatar.customImageData ? undefined : `A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing a ${avatar.clothing}, accessory: ${avatar.accessory}. 2d vector art bright child friendly simple portrait.`} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-blue-100" />
                    </motion.div>
                  </AnimatePresence>
                )}
             </motion.div>
             <h2 className="text-3xl font-black text-blue-900 relative z-10 flex items-center gap-2 mb-4">
                <Sparkles className="text-yellow-400" /> {t.hero} <Sparkles className="text-yellow-400" />
             </h2>

             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <button onClick={() => fileInputRef.current?.click()} className="relative z-10 bg-purple-500 hover:bg-purple-600 active:scale-95 transition-all text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
                <Camera size={20} />
                {language === "id" ? "Gunakan Foto Asli" : "Use Real Photo"}
             </button>
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
