import React, { useEffect, useState } from "react";
import { useAppStore } from "../store";
import { useAudioContext } from "../lib/audio";
import { ArrowLeft, Play, Square, Mic, StopCircle, ChevronLeft, ChevronRight, Award, CheckCircle, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import confetti from "canvas-confetti";
import { generateNextPage } from "../lib/gemini";

export const StoryReader: React.FC<{ onViewChange: (view: "dashboard") => void }> = ({ onViewChange }) => {
  const { currentStory, currentPageIndex, setCurrentPageIndex, updateStory, addPoints, addRecording, points, avatar } = useAppStore();
  const { speak, isSpeaking, stopSpeaking, startRecording, stopRecording, isRecording } = useAudioContext();
  
  const [hasFinishedStory, setHasFinishedStory] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  if (!currentStory) {
    return <div>No story selected.</div>;
  }

  const page = currentStory.pages[currentPageIndex];
  const progress = ((currentPageIndex + 1) / currentStory.pages.length) * 100;

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
      const nextPage = await generateNextPage(currentStory, choice, avatar);
      updateStory(currentStory.id, {
        pages: [...currentStory.pages, nextPage]
      });
      setCurrentPageIndex(currentStory.pages.length); // go to the newly added page
    } catch (e) {
      console.error(e);
      alert("Failed to continue the story. Please try again.");
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
    addPoints(50); // Give 50 stars for reading a book
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fffb00', '#ff0088', '#00ffaa']
    });
  };

  const playFunSound = (type: 'magic' | 'laugh' | 'applause') => {
    // We can use simple oscillator frequencies to simulate fun sounds without needing external assets
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'magic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.8 }, colors: ['#a855f7'] });
    } else if (type === 'laugh') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      for(let i=0; i<3; i++) {
        osc.frequency.setValueAtTime(300 + Math.random()*200, ctx.currentTime + i*0.1);
      }
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'applause') {
      // Noise
      const bufferSize = ctx.sampleRate * 1.5; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 1000;
      noise.connect(noiseFilter);
      noiseFilter.connect(gainNode);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      noise.start(ctx.currentTime);
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.7 }});
    }
  };

  const toggleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(page.text + (page.choices ? " What should they do next? " + page.choices.join(" or ") : ""));
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const url = await stopRecording();
      if (url) {
        addRecording({
          id: crypto.randomUUID(),
          storyId: currentStory.id,
          pageId: page.id,
          blobUrl: url,
          timestamp: Date.now()
        });
        addPoints(10); // Reward for recording
      }
    } else {
      startRecording();
    }
  };

  // Generate image URL from Pollinations
  // We append nologo=true to keep it clean, and use a seed based on the story ID so the style is semi-consistent 
  // but unique per page id.
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(page.illustrationPrompt + " 2d vector art bright child friendly")}?width=800&height=500&nologo=true&seed=${page.id}`;

  const isLastPage = currentPageIndex === currentStory.pages.length - 1;
  const isInteractiveChoicePage = isLastPage && currentStory.isInteractive && page.choices && page.choices.length > 0;

  if (hasFinishedStory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sky-50 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl border-4 border-sky-100">
          <Award className="w-32 h-32 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-slate-800 mb-4">You Finished the Book!</h2>
          <p className="text-xl font-bold text-sky-600 mb-8">+50 Stars Added!</p>
          <Button size="lg" className="h-16 text-2xl px-10 rounded-2xl bg-sky-500 hover:bg-sky-600 font-bold" onClick={() => onViewChange("dashboard")}>
            Back to Bookshelf
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1024px] mx-auto p-4 sm:p-8 flex flex-col min-h-screen gap-6 font-sans">
      {/* Top Header Bar styled like Bento Grid theme */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-400 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg font-bold">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">StoryTime AI</h1>
            <p className="text-blue-700 font-semibold text-sm">Level 5 Story Explorer</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-3 border-2 border-orange-200">
            <span className="text-2xl">⭐</span>
            <span className="font-black text-orange-600 text-xl">{points} XP</span>
          </div>
          <button className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 text-xl border-2 border-blue-200 transition-colors" onClick={() => onViewChange("dashboard")}>
             <ArrowLeft size={24} />
          </button>
        </div>
      </header>
      
      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 flex-grow">
               {/* Primary Content: The Story Page */}
        <div className="md:col-span-8 md:row-span-6 bg-white rounded-[48px] shadow-xl overflow-hidden border-8 border-white relative flex flex-col">
          <div className="relative h-64 sm:h-80 md:h-3/5 w-full bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 flex items-center justify-center group overflow-hidden">
            {isGeneratingNext ? (
              <div className="flex flex-col items-center justify-center z-20">
                 <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
                 <h2 className="text-2xl font-black text-white drop-shadow-md">Writing the next page...</h2>
              </div>
            ) : (
              <>
                <img 
                  src={imageUrl} 
                  alt="Story Illustration" 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
                  <div className="w-48 h-48 bg-yellow-300 rounded-full blur-2xl ml-20"></div>
                </div>
                <div className="z-10 text-center flex flex-col items-center mt-auto mb-4">
                  <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-blue-900 uppercase tracking-widest text-sm shadow-sm">
                    Page {currentPageIndex + 1}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between overflow-y-auto">
            {!isGeneratingNext && (
              <div>
                {currentPageIndex === 0 && <h2 className="text-3xl sm:text-4xl font-black text-blue-950 mb-4">{currentStory.title}</h2>}
                <p className="text-xl sm:text-2xl leading-relaxed text-blue-800 font-medium mb-6">
                  {page.text}
                </p>
                
                {isInteractiveChoicePage && (
                  <div className="mt-8 space-y-4 bg-purple-50 p-6 rounded-3xl border-4 border-purple-200">
                    <h3 className="text-xl font-black text-purple-900 flex items-center gap-2"><Sparkles className="text-orange-500" /> What happens next?</h3>
                    <div className="flex flex-col gap-3">
                      {page.choices?.map((choice, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleChoice(choice)}
                          className="w-full text-left px-6 py-4 bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-100 font-bold text-purple-800 transition-colors"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               <button 
                onClick={toggleReadAloud}
                className={`py-4 px-8 h-auto rounded-3xl font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center \${isSpeaking ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white'}`}
              >
                {isSpeaking ? <Square fill="currentColor" size={24} className="mr-2" /> : <Play fill="currentColor" size={24} className="mr-2" />}
                {isSpeaking ? "Stop Reading" : "Read Aloud"}
              </button>
              <button 
                onClick={() => playFunSound('magic')}
                className="py-4 px-8 h-auto bg-pink-100 text-pink-600 hover:bg-pink-200 rounded-3xl font-bold text-xl border-2 border-pink-200 transition-all hover:scale-105 active:scale-95"
              >
                ✨ Surprise Me!
              </button>
            </div>
          </div>
        </div>

        {/* Recording Studio Module */}
        <div className="md:col-span-4 md:row-span-3 bg-red-400 rounded-[40px] p-6 shadow-lg flex flex-col items-center justify-center text-center gap-4 text-white">
          <button 
             onClick={toggleRecording}
             className={`w-24 h-24 rounded-full flex items-center justify-center border-8 transition-transform hover:scale-105 ${isRecording ? 'bg-red-600 border-red-500 animate-pulse' : 'bg-red-500 border-red-300'}`}
          >
            {isRecording ? <StopCircle size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
          </button>
          <div>
            <h3 className="text-2xl font-black">My Voice Studio</h3>
            <p className="opacity-90 font-medium">{isRecording ? "Recording..." : "Press to record your reading!"}</p>
          </div>
          <div className="w-full flex items-end justify-center gap-1 h-12">
            <div className={`w-2 bg-white/40 rounded-full transition-all duration-300 ${isRecording ? 'h-8' : 'h-4'}`}></div>
            <div className={`w-2 bg-white/60 rounded-full transition-all duration-300 ${isRecording ? 'h-12' : 'h-8'}`}></div>
            <div className={`w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-14' : 'h-10'}`}></div>
            <div className={`w-2 bg-white/60 rounded-full transition-all duration-300 ${isRecording ? 'h-10' : 'h-6'}`}></div>
            <div className={`w-2 bg-white/40 rounded-full transition-all duration-300 ${isRecording ? 'h-6' : 'h-4'}`}></div>
          </div>
        </div>

        {/* Rewards / Badges Module */}
        <div className="md:col-span-4 md:row-span-2 bg-blue-900 rounded-[40px] p-6 shadow-lg flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black text-xl">My Badges</h3>
            <span className="text-blue-300 text-sm font-bold uppercase tracking-wider">3 collected</span>
          </div>
          <div className="flex justify-around items-center">
            <div className="group relative">
                <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-200 flex items-center justify-center text-2xl shadow-inner">🏆</div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-800 text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Super Reader</div>
            </div>
            <div className="group relative">
                <div className="w-16 h-16 bg-emerald-400 rounded-full border-4 border-emerald-200 flex items-center justify-center text-2xl shadow-inner">🌈</div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-800 text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Art Lover</div>
            </div>
             <div className="group relative">
                <button onClick={() => playFunSound('laugh')} className="w-16 h-16 bg-pink-400 rounded-full border-4 border-pink-200 flex items-center justify-center text-2xl shadow-inner hover:scale-110 transition-transform">😄</button>
            </div>
          </div>
        </div>

        {/* Next/Prev Controls */}
        <div className="md:col-span-4 md:row-span-1 flex gap-4 h-full">
            <button 
              disabled={currentPageIndex === 0 || isGeneratingNext} 
              onClick={handlePrev}
              className="flex-1 bg-white rounded-3xl border-4 border-blue-100 flex items-center justify-center text-4xl shadow-sm text-blue-300 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ◀
            </button>
            {!isInteractiveChoicePage && (
              <button 
                onClick={handleNext}
                disabled={isGeneratingNext}
                className="flex-[2] bg-green-400 hover:bg-green-500 text-white rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-green-200 transition-colors disabled:opacity-50"
              >
                 {isLastPage ? "FINISH ▶" : "NEXT PAGE ▶"}
              </button>
            )}
            {isInteractiveChoicePage && (
              <div className="flex-[2] bg-purple-100 rounded-3xl flex items-center justify-center text-purple-500 text-xl font-black border-4 border-purple-200 p-2 text-center leading-tight">
                Choose an action above!
              </div>
            )}
        </div>
      </div>
      
      {/* Progress Footer */}
      <footer className="flex justify-center mt-2">
        <div className="bg-blue-100/50 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
           <Progress value={progress} className="h-2 w-24 bg-blue-200" />
           <span>✓ Offline Ready</span>
        </div>
      </footer>
    </div>
  );
};
