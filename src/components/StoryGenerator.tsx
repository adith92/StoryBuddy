import React, { useState } from "react";
import { generateNewStory } from "../lib/gemini";
import { useAppStore } from "../store";
import { ArrowLeft, Loader2 } from "lucide-react";

export const StoryGenerator: React.FC<{ onViewChange: (view: "dashboard" | "generator" | "reader" | "parents" | "avatar") => void; onStoryReady: () => void }> = ({ onViewChange, onStoryReady }) => {
  const [theme, setTheme] = useState("");
  const [character, setCharacter] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setStories, stories, setCurrentStory, avatar, language } = useAppStore();

  const handleGenerate = async () => {
    if (!theme || !character) return;
    setIsLoading(true);
    try {
      const story = await generateNewStory(theme, character, isInteractive, avatar, language);
      setStories([story, ...stories]);
      setCurrentStory(story);
      onStoryReady();
    } catch (error) {
      console.error(error);
      alert(language === "id" ? "Gagal membuat cerita. Coba lagi ya!" : "Failed to generate story. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    id: {
      back: "Kembali",
      title: "Petualangan Apa Hari Ini?",
      theme: "Pilih Tema",
      character: "Siapa Tokohnya?",
      adventureType: "Jenis Petualangan",
      nonInteractive: "📖 Cerita Klasik",
      interactive: "🎮 Petualangan Interaktif",
      interactiveDesc: "Kamu bisa membuat pilihan!",
      button: "SIHIRKAN CERITA! ✨",
      generating: "AI sedang menulis...",
      themes: ["Luar Angkasa 🚀", "Hutan Ajaib 🌳", "Bawah Laut 🌊", "Negeri Permen 🍭", "Dunia Dino 🦕", "Kastil Awan ☁️"],
      characters: ["Anak Berani 🧒", "Robot Lucu 🤖", "Naga Baik 🐉", "Kucing Pintar 🐱", "Peri Kecil 🧚", "Astronot 👨‍🚀"]
    },
    en: {
      back: "Back",
      title: "Choose Your Adventure!",
      theme: "Pick a Theme",
      character: "Who's the Hero?",
      adventureType: "Adventure Type",
      nonInteractive: "📖 Classic Story",
      interactive: "🎮 Interactive Story",
      interactiveDesc: "You make the choices!",
      button: "MAGIC MY STORY! ✨",
      generating: "AI is writing...",
      themes: ["Outer Space 🚀", "Magic Forest 🌳", "Underwater 🌊", "Candy Land 🍭", "Dino World 🦕", "Cloud Castle ☁️"],
      characters: ["Brave Kid 🧒", "Cute Robot 🤖", "Friendly Dragon 🐉", "Smart Cat 🐱", "Small Fairy 🧚", "Astronaut 👨‍🚀"]
    }
  }[language];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 flex flex-col min-h-screen">
      <header className="mb-8">
        <button onClick={() => onViewChange("dashboard")} className="text-blue-600 hover:bg-blue-100 rounded-full px-6 py-2 font-bold flex items-center shadow-sm border-2 border-blue-200 transition-colors bg-white">
           <ArrowLeft className="mr-2" size={20} /> {t.back}
        </button>
      </header>

      <div className="bg-white rounded-[40px] p-8 shadow-xl border-8 border-white space-y-10">
        <h2 className="text-4xl font-black text-blue-950 text-center tracking-tight">{t.title}</h2>

        <div className="space-y-8">
          <div>
            <label className="block text-xl font-black text-blue-900 mb-4">{t.theme}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {t.themes.map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`py-4 px-2 rounded-2xl font-bold text-sm transition-all border-4 ${theme === th ? 'bg-blue-100 border-blue-400 text-blue-900 scale-105 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}
                >
                  {th}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xl font-black text-blue-900 mb-4">{t.character}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {t.characters.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setCharacter(ch)}
                  className={`py-4 px-2 rounded-2xl font-bold text-sm transition-all border-4 ${character === ch ? 'bg-orange-100 border-orange-400 text-orange-900 scale-105 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-orange-200'}`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xl font-black text-blue-900 mb-4">{t.adventureType}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div 
                 onClick={() => setIsInteractive(false)}
                 className={`p-6 rounded-[32px] border-4 cursor-pointer transition-all ${!isInteractive ? 'bg-green-50 border-green-400 shadow-md' : 'bg-white border-slate-100'}`}
               >
                 <div className="font-black text-2xl text-green-700">{t.nonInteractive}</div>
               </div>
               <div 
                 onClick={() => setIsInteractive(true)}
                 className={`p-6 rounded-[32px] border-4 cursor-pointer transition-all ${isInteractive ? 'bg-purple-50 border-purple-400 shadow-md' : 'bg-white border-slate-100'}`}
               >
                 <div className="font-black text-2xl text-purple-700">{t.interactive}</div>
                 <div className="text-purple-600 text-sm font-bold opacity-70">{t.interactiveDesc}</div>
               </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !theme || !character}
          className={`w-full py-6 rounded-3xl font-black text-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${isLoading || !theme || !character ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-white" />
              {t.generating}
            </div>
          ) : (
            <>{t.button}</>
          )}
        </button>
      </div>
    </div>
  );
};
