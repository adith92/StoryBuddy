import React, { useState } from "react";
import { generateNewStory } from "../lib/gemini";
import { useAppStore } from "../store";
import { ArrowLeft, Wand2, Loader2, Sparkles } from "lucide-react";

export const StoryGenerator: React.FC<{ onViewChange: (view: "dashboard") => void, onStoryReady: () => void }> = ({ onViewChange, onStoryReady }) => {
  const [theme, setTheme] = useState("Space Adventure");
  const [characterName, setCharacterName] = useState("A brave little cat");
  const [isInteractive, setIsInteractive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setStories, stories, setCurrentStory, avatar } = useAppStore();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const finalName = characterName || "A creative child";
      const newStory = await generateNewStory(theme || "a fun adventure", finalName, isInteractive, avatar);
      setStories([newStory, ...stories]);
      setCurrentStory(newStory);
      onStoryReady();
    } catch (err) {
      alert("Oops! The magic wand fizzled. Try again!");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 flex flex-col justify-center min-h-full">
      <button onClick={() => onViewChange("dashboard")} className="self-start mb-8 text-blue-600 hover:bg-blue-100 rounded-full px-6 py-2 font-bold font-sans flex items-center shadow-sm border-2 border-blue-200 transition-colors">
        <ArrowLeft className="mr-2" size={20} /> Back to Home
      </button>
      
      <div className="bg-white p-8 sm:p-12 rounded-[48px] shadow-xl border-8 border-white">
        <h2 className="text-4xl sm:text-5xl font-black text-blue-950 mb-2 flex items-center gap-3 tracking-tight">
          <Wand2 className="text-orange-500 w-12 h-12" />
          Make Magic
        </h2>
        <p className="text-blue-700 mb-10 font-bold text-xl">Tell the AI what kind of story you want to hear!</p>
        
        <div className="space-y-8">
          <div>
            <label className="block text-xl font-black text-blue-900 mb-3">Who is the main character?</label>
            <input 
              type="text" 
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full text-2xl px-6 py-5 rounded-3xl bg-yellow-50 border-4 border-yellow-200 focus:border-orange-400 focus:ring-0 outline-none transition-all font-bold text-blue-950 placeholder-blue-300"
              placeholder="A brave little cat..."
            />
          </div>
          
          <div>
            <label className="block text-xl font-black text-blue-900 mb-3">What is the theme or setting?</label>
            <input 
              type="text" 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full text-2xl px-6 py-5 rounded-3xl bg-yellow-50 border-4 border-yellow-200 focus:border-orange-400 focus:ring-0 outline-none transition-all font-bold text-blue-950 placeholder-blue-300"
              placeholder="Magic forest..."
            />
          </div>

          <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-3xl border-4 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setIsInteractive(!isInteractive)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isInteractive ? 'bg-purple-500 border-purple-600 shadow-inner' : 'bg-white border-purple-300'}`}>
               {isInteractive && <Sparkles className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-black text-purple-900 text-xl">Choose Your Own Adventure</h3>
              <p className="text-purple-700 font-bold">You decide what happens next!</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button 
            disabled={isLoading || !theme || !characterName}
            onClick={handleGenerate}
            className="w-full h-20 text-3xl font-black bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-4 animate-spin h-10 w-10" /> 
                WRITING...
              </>
            ) : "GENERATE STORY!"}
          </button>
        </div>
      </div>
    </div>
  );
};
