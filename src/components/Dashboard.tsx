import React, { useState } from "react";
import { useAppStore, Story } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { OfflineImage } from "./OfflineImage";
import { downloadStoryImages, removeStoryImages } from "../lib/offline";
import { CloudDownload, WifiOff, Loader2 } from "lucide-react";

export const Dashboard: React.FC<{ onViewChange: (view: "dashboard" | "generator" | "reader" | "parents" | "avatar") => void }> = ({ onViewChange }) => {
  const { stories, points, setCurrentStory, avatar, language, setLanguage, updateStory } = useAppStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "offline">("all");

  const filteredStories = stories.filter(s => filter === "all" || s.isOffline);

  const handleDownload = async (story: Story) => {
    setDownloadingId(story.id);
    try {
      await downloadStoryImages(story);
      updateStory(story.id, { isOffline: true });
    } catch (e) {
      console.error(e);
      alert(language === "id" ? "Gagal mengunduh." : "Failed to download.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRemoveOffline = async (story: Story) => {
    try {
      await removeStoryImages(story);
      updateStory(story.id, { isOffline: false });
    } catch (e) {
      console.error(e);
    }
  };

  const t = {
    id: {
      explorer: "Penjelajah Cerita Level 5",
      create: "Buat Cerita Ajaib!",
      createDesc: "Gunakan AI untuk membuat petualangan baru hanya untukmu.",
      start: "✨ MULAI PETUALANGAN ✨",
      shelf: "Rak Bukuku",
      all: "Semua",
      offline: "Tersedia Offline",
      empty: "Rakmu masih kosong!",
      emptyDesc: "Klik \"Mulai Petualangan\" untuk menulis buku pertamamu.",
      pages: "Halaman",
      read: "BACA"
    },
    en: {
      explorer: "Level 5 Story Explorer",
      create: "Create a Magic Story!",
      createDesc: "Use AI to generate a brand new adventure just for you.",
      start: "✨ START ADVENTURE ✨",
      shelf: "My Bookshelf",
      all: "All",
      offline: "Offline Ready",
      empty: "Your shelf is empty!",
      emptyDesc: "Click \"Start Adventure\" to write your first book.",
      pages: "Pages",
      read: "READ"
    }
  }[language];

  return (
    <div className="w-full max-w-[1024px] mx-auto p-4 sm:p-8 flex flex-col gap-6">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onViewChange("avatar")}
            className="w-16 h-16 bg-orange-400 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform overflow-hidden border-4 border-white"
          >
            <OfflineImage cacheKey="custom-avatar" prompt={`cute child ${avatar.skinTone} skin ${avatar.hairStyle} ${avatar.hairColor} hair ${avatar.clothing} avatar icon 2d vector art bright`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">StoryBuddy</h1>
            <p className="text-blue-700 font-semibold text-sm">{t.explorer}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Switcher - Swipe/Drag feel for kids */}
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 50) {
                setLanguage(language === "id" ? "en" : "id");
              }
            }}
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border-2 border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors touch-none"
          >
            <span className="text-xl">{language === "id" ? "🇮🇩" : "🇺🇸"}</span>
            <span className="font-black text-blue-600 text-sm uppercase">{language}</span>
          </motion.div>

          <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-3 border-2 border-orange-200">
            <span className="text-2xl">⭐</span>
            <span className="font-black text-orange-600 text-xl">{points} XP</span>
          </div>
          
          <button onClick={() => onViewChange("parents")} className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl border-2 border-blue-200 text-blue-600 hover:bg-blue-200 hover:scale-105 transition-all">
            ⚙️
          </button>
        </div>
      </header>

      <main className="space-y-6">
        <section className="bg-white border-8 border-white rounded-[48px] shadow-xl text-center relative overflow-hidden flex flex-col items-center justify-center py-20 px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 opacity-30"></div>
           <div className="absolute inset-0 flex items-center justify-center opacity-40">
             <div className="w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
             <div className="w-48 h-48 bg-yellow-300 rounded-full blur-2xl ml-20"></div>
          </div>
          
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-blue-950 tracking-tight drop-shadow-sm">{t.create}</h2>
            <p className="text-blue-800 text-xl font-medium">{t.createDesc}</p>
            <button className="bg-green-400 text-white font-black text-2xl px-10 py-6 rounded-3xl shadow-lg shadow-green-200 hover:bg-green-500 hover:scale-105 active:scale-95 transition-all outline-none" onClick={() => onViewChange("generator")}>
               {t.start}
            </button>
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-black text-blue-900 tracking-tight">{t.shelf}</h3>
              <span className="text-blue-600 font-bold bg-blue-100 px-4 py-1 rounded-full text-sm">{stories.length} {language === "id" ? "Buku" : "Books"}</span>
            </div>
            
            {stories.length > 0 && (
              <div className="flex bg-slate-100 p-1 rounded-full border-2 border-slate-200">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t.all}</button>
                <button onClick={() => setFilter('offline')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${filter === 'offline' ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                  <CloudDownload size={16} /> {t.offline}
                </button>
              </div>
            )}
          </div>
          
          {filteredStories.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-blue-200 rounded-[40px] p-16 text-center shadow-sm">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-blue-500 text-2xl font-bold">{t.empty}</p>
              <p className="text-blue-400 font-medium">{t.emptyDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <div key={story.id} className="bg-white rounded-[32px] border-4 border-blue-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group overflow-hidden flex flex-col relative" onClick={() => {
                  setCurrentStory(story);
                  onViewChange("reader");
                }}>
                  <div className="absolute top-4 right-4 z-30">
                    {downloadingId === story.id ? (
                      <div className="bg-white/90 p-2 rounded-full shadow-sm text-blue-500">
                        <Loader2 size={24} className="animate-spin" />
                      </div>
                    ) : story.isOffline ? (
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveOffline(story); }} className="bg-green-100 text-green-600 p-2 rounded-full border-2 border-green-200 hover:bg-green-200 transition-colors shadow-sm" title={language === "id" ? "Hapus dari Offline" : "Remove from Offline"}>
                        <WifiOff size={24} />
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(story); }} className="bg-white/90 text-blue-500 p-2 rounded-full border-2 border-slate-100 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all shadow-sm" title={language === "id" ? "Unduh untuk Offline" : "Download for Offline"}>
                        <CloudDownload size={24} />
                      </button>
                    )}
                  </div>
                  <div className="h-48 bg-blue-50 relative overflow-hidden flex items-center justify-center">
                     <OfflineImage cacheKey={`cover-${story.id}`} prompt={story.title + " children story book cover vibrant 2d vector vector art"} alt={story.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply opacity-80" />
                     <div className="absolute inset-x-0 bottom-0 py-6 px-4 bg-gradient-to-t from-blue-900/90 to-transparent flex flex-col justify-end h-full">
                       <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-2 shadow-sm">{story.genre}</span>
                     </div>
                  </div>
                  <div className="p-6 pb-8 bg-white relative z-20 flex-1 flex flex-col justify-between">
                    <h4 className="font-black text-2xl text-blue-950 mb-4 leading-tight">{story.title}</h4>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-blue-400 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">{story.pages.length} {t.pages}</span>
                      <button className="bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full px-6 py-2 font-black transition-colors text-sm shadow-sm border-2 border-blue-200 uppercase">{t.read}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
