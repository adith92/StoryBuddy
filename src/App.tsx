/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useAppStore } from "./store";
import { AudioProvider } from "./lib/audio";
import { Dashboard } from "./components/Dashboard";
import { StoryGenerator } from "./components/StoryGenerator";
import { StoryReader } from "./components/StoryReader";
import { ParentPortal } from "./components/ParentPortal";
import { AvatarCreator } from "./components/AvatarCreator";

export default function App() {
  const [view, setView] = useState<"dashboard" | "generator" | "reader" | "parents" | "avatar" | "parentPortal">("dashboard");
  const { currentStory } = useAppStore();

  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
      }, 800); // Give the loading bar a bit of time
    }
  }, []);

  const handleOpenReader = () => {
    setView("reader");
  };

  return (
    <AudioProvider>
      <div className="min-h-screen bg-yellow-50 text-blue-950 font-sans p-4 sm:p-8 flex flex-col">
        {view === "dashboard" && <Dashboard onViewChange={setView} />}
        {view === "generator" && <StoryGenerator onViewChange={setView} onStoryReady={handleOpenReader} />}
        {view === "reader" && <StoryReader onViewChange={setView} />}
        {(view === "parents" || view === "parentPortal") && <ParentPortal onViewChange={setView} />}
        {view === "avatar" && <AvatarCreator onViewChange={setView} />}
      </div>
    </AudioProvider>
  );
}

