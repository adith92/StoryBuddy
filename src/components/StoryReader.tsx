import React, { useEffect, useState } from "react";
import { useAppStore } from "../store";
import { useAudioContext } from "../lib/audio";
import { ArrowLeft, Play, Square, Mic, StopCircle, Loader2, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import { generateNextPage } from "../lib/gemini";
import { motion, AnimatePresence } from "motion/react";
import { OfflineImage } from "./OfflineImage";
import { LoadingBar } from "./LoadingBar";

export const StoryReader: React.FC<{ onViewChange: (view: "dashboard" | "generator" | "reader") => void }> = ({ onViewChange }) => {
  const { currentStory, currentPageIndex, setCurrentPageIndex, updateStory, addPoints, addRecording, points, avatar, language, setLanguage, bgMusicEnabled } = useAppStore();
  const { speak, isSpeaking, stopSpeaking, startRecording, stopRecording, isRecording } = useAudioContext();
  
  const [hasFinishedStory, setHasFinishedStory] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15; // Set volume to 15%
    }
  }, [bgMusicEnabled]);

  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  if (!currentStory) return null;

  const page = currentStory.pages[currentPageIndex];
  const isLastPage = currentPageIndex === currentStory.pages.length - 1;
  const isInteractiveChoicePage = isLastPage && currentStory.isInteractive && page.choices && page.choices.length > 0;

  const handleNext = () => {
    stopSpeaking();
    if (currentPageIndex < currentStory.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      if (!currentStory.isInteractive || !page.choices || page.choices.length === 0) {
        handleFinishStory();
      }
    }
  };

  const handleChoice = async (choice: string) => {
    stopSpeaking();
    setIsGeneratingNext(true);
    try {
      const nextPage = await generateNextPage(currentStory, choice, avatar, language);
      updateStory(currentStory.id, {
        pages: [...currentStory.pages, nextPage]
      });
      setCurrentPageIndex(currentStory.pages.length); 
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
        alert(language === "id" ? "Quota API habis (Rate limit exceeded). Silakan coba lagi nanti ya!" : "API Quota exceeded. Please try again later!");
      } else {
        alert(language === "id" ? "Gagal melanjutkan cerita. Coba lagi ya!" : "Failed to continue. Try again!");
      }
    } finally {
      setIsGeneratingNext(false);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleFinishStory = () => {
    setHasFinishedStory(true);
    addPoints(50);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fffb00', '#ff0088', '#00ffaa']
    });
  };

  const toggleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(page.text + (page.choices ? " . . . " + page.choices.join(" . atau . ") : ""));
    }
  };

  const t = {
    id: {
      back: "Berhenti",
      stars: "Kamu Hebat!",
      added: "+50 Bintang!",
      done: "YEY! SELESAI!",
      next: "LANJUT",
      finish: "SELESAI",
      voice: "Baca Untukku",
      stop: "Berhenti Baca",
      choicePrompt: "Apa yang harus kita lakukan?",
      writing: "AI sedang menulis cerita baru..."
    },
    en: {
      back: "Close",
      stars: "You're Amazing!",
      added: "+50 Stars!",
      done: "YAY! FINISHED!",
      next: "NEXT",
      finish: "FINISH",
      voice: "Read Aloud",
      stop: "Stop Reading",
      choicePrompt: "What happens next?",
      writing: "Writing next page..."
    }
  }[language];

  if (hasFinishedStory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-blue-50 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-xl border-8 border-white">
          <span className="text-8xl mb-6 block">🏆</span>
          <h2 className="text-5xl font-black text-blue-900 mb-4">{t.stars}</h2>
          <p className="text-3xl font-bold text-orange-500 mb-10">{t.added}</p>
          <button className="w-full h-20 text-3xl font-black bg-blue-600 text-white rounded-3xl shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95" onClick={() => onViewChange("dashboard")}>
            {t.done}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1024px] mx-auto p-4 sm:p-8 flex flex-col min-h-screen gap-6">
      {bgMusicEnabled && (
        <audio ref={audioRef} src="https://upload.wikimedia.org/wikipedia/commons/1/14/Brahms_Lullaby.ogg" autoPlay loop className="hidden" />
      )}
      <header className="flex justify-between items-center">
        <button onClick={() => onViewChange("dashboard")} className="text-red-500 hover:bg-red-50 px-6 py-2 rounded-full font-black border-4 border-red-100 flex items-center gap-2 bg-white transition-all active:scale-95">
          <X size={20} /> {t.back}
        </button>

        <div className="flex gap-4 items-center">
           <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 40) {
                setLanguage(language === "id" ? "en" : "id");
              }
            }}
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border-2 border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors touch-none"
          >
            <span className="text-xl">{language === "id" ? "🇮🇩" : "🇺🇸"}</span>
          </motion.div>
          <div className="bg-white px-6 py-2 rounded-full border-4 border-blue-100 shadow-sm font-black text-blue-600">
            {currentPageIndex + 1} / {currentStory.isInteractive ? '?' : currentStory.pages.length}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0 pb-6 overflow-y-auto">
        <div className="bg-white rounded-[48px] shadow-xl overflow-hidden border-8 border-white relative h-[40vh] md:h-[55vh] flex-shrink-0">
           {isGeneratingNext ? (
             <div className="absolute inset-0 bg-blue-50/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-10">
                <LoadingBar message={t.writing} />
             </div>
           ) : (
             <OfflineImage 
               cacheKey={`page-${page.id}`}
               prompt={page.illustrationPrompt}
               seed={currentStory.id}
               alt="illustration"
               className="w-full h-full object-cover md:object-contain bg-slate-100"
             />
           )}
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="bg-white rounded-[40px] p-6 md:p-8 shadow-xl border-4 border-blue-50 text-center">
             <p className="text-2xl md:text-3xl font-bold text-blue-950 leading-relaxed">{page.text}</p>
          </div>

          <div className="bg-white rounded-[40px] p-6 shadow-lg space-y-4 border-4 border-orange-100 mt-auto md:w-3/4 mx-auto w-full">
             {isInteractiveChoicePage ? (
               <div className="space-y-3">
                  <h3 className="font-black text-purple-900 flex items-center gap-2 mb-2"><Sparkles className="text-orange-500" /> {t.choicePrompt}</h3>
                  {page.choices?.map((choice, i) => (
                    <button key={i} onClick={() => handleChoice(choice)} className="w-full py-4 px-6 bg-purple-500 hover:bg-purple-600 text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-95 leading-snug text-left md:text-center">
                      {choice}
                    </button>
                  ))}
               </div>
             ) : (
               <div className="flex gap-4">
                  {currentPageIndex > 0 && (
                    <button onClick={handlePrev} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-3xl transition-all active:scale-95 uppercase">
                      ◀
                    </button>
                  )}
                  <button onClick={handleNext} className="flex-[3] py-4 bg-orange-400 hover:bg-orange-500 text-white font-black text-2xl rounded-3xl shadow-lg transition-all active:scale-95 uppercase tracking-wide">
                    {isLastPage ? t.finish : t.next} ▶
                  </button>
               </div>
             )}

             <button onClick={toggleReadAloud} className={`w-full py-4 rounded-3xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${isSpeaking ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                {isSpeaking ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
                {isSpeaking ? t.stop : t.voice}
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};
