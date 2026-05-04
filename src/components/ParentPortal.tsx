import React, { useState } from "react";
import { useAppStore, clearAllDataAndReload } from "../store";
import { ArrowLeft, Shield, BarChart3, Lock, PlayCircle } from "lucide-react";

export const ParentPortal: React.FC<{ onViewChange: (view: "dashboard") => void }> = ({ onViewChange }) => {
  const { parentPin, setParentPin, points, stories, recordings, language } = useAppStore();
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(parentPin === null);
  const [setupPin, setSetupPin] = useState("");
  const [activeTab, setActiveTab] = useState("progress");

  const t = {
    id: {
      onlyParents: "Hanya Untuk Orang Tua!",
      pinDesc: "Masukkan PIN untuk masuk ke pengaturan.",
      incorrect: "PIN Salah!",
      back: "Kembali ke Aplikasi",
      cancel: "Batal",
      unlock: "Buka",
      setPin: "Buat PIN",
      pinMin: "PIN harus 4 angka.",
      dashboard: "Dashboard Orang Tua",
      secure: "Amankan Dashboard",
      secureDesc: "Buat PIN agar anak tidak bisa masuk ke sini.",
      progress: "Perkembangan",
      recordings: "Rekaman Suara",
      voice: "Suara AI",
      settings: "Pengaturan",
      totalRead: "Cerita Yang Dibaca",
      totalStars: "Total Bintang",
      voiceSettings: "Pengaturan Kloning Suara",
      voiceDesc: "Gunakan ElevenLabs untuk suara AI yang nyata.",
      useCustom: "Gunakan Suara Kustom",
      toggleDesc: "Pilih antara suara HP atau ElevenLabs",
      noRecordings: "Belum ada rekaman. Yuk suruh si kecil membaca!",
      storyList: "Rekaman Suara Anak",
      clearData: "Hapus Semua Data",
      clearDataDesc: "Hapus semua cerita, profil, dan mulai dari awal."
    },
    en: {
      onlyParents: "Parents Only!",
      pinDesc: "Please enter your PIN to access controls.",
      incorrect: "Incorrect PIN!",
      back: "Back to App",
      cancel: "Cancel",
      unlock: "Unlock",
      setPin: "Set PIN",
      pinMin: "PIN must be at least 4 digits.",
      dashboard: "Parent Dashboard",
      secure: "Secure the Dashboard",
      secureDesc: "Set up a PIN to lock kids out of the settings.",
      progress: "Progress",
      recordings: "Recordings",
      voice: "AI Voice",
      settings: "Settings",
      totalRead: "Total Stories Read",
      totalStars: "Total Stars Earned",
      voiceSettings: "Voice Cloning Settings",
      voiceDesc: "Enable realistic AI voices using ElevenLabs.",
      useCustom: "Use Custom Voice",
      toggleDesc: "Toggle between Web Speech API and ElevenLabs",
      noRecordings: "No recordings yet. Encourage them to read aloud!",
      storyList: "Child's Voice Recordings",
      clearData: "Clear All Data",
      clearDataDesc: "Delete all stories, profiles, and start fresh."
    }
  }[language];

  const handleUnlock = () => {
    if (pinInput === parentPin) {
      setIsUnlocked(true);
    } else {
      alert(t.incorrect);
    }
  };

  const handleSetPin = () => {
    if (setupPin.length >= 4) {
      setParentPin(setupPin);
      setIsUnlocked(true);
    } else {
      alert(t.pinMin);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-200">
          <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">{t.onlyParents}</h2>
          <p className="text-slate-500 mb-8 font-medium">{t.pinDesc}</p>
          
          <input 
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center text-4xl tracking-[1em] py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none mb-6 font-mono"
            placeholder="****"
          />
          
          <div className="flex gap-4">
            <button className="flex-1 py-6 rounded-xl font-bold border-2 border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => onViewChange("dashboard")}>{t.cancel}</button>
            <button className="flex-1 py-6 rounded-xl font-bold border-0 bg-indigo-500 text-white hover:bg-indigo-600" onClick={handleUnlock}>{t.unlock}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => onViewChange("dashboard")} className="text-slate-500 rounded-xl hover:bg-slate-200 font-bold px-4 py-2 flex items-center">
          <ArrowLeft className="mr-2" /> {t.back}
        </button>
        <h1 className="text-2xl font-black text-indigo-900 flex items-center gap-2">
          <Shield className="text-indigo-500" /> {t.dashboard}
        </h1>
      </header>

      {parentPin === null && (
        <div className="p-6 mb-8 bg-amber-50 border-amber-200 border-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <Lock className="w-10 h-10 flex-shrink-0 text-amber-500" />
            <div>
              <h3 className="font-bold text-lg">{t.secure}</h3>
              <p className="text-sm opacity-80">{t.secureDesc}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="password"
              placeholder="0000"
              value={setupPin}
              onChange={(e) => setSetupPin(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-amber-200 text-center w-24 font-mono font-bold outline-none"
            />
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg" onClick={handleSetPin}>{t.setPin}</button>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="grid w-full grid-cols-4 h-14 rounded-2xl bg-slate-200 p-1 mb-8">
          <button onClick={() => setActiveTab("progress")} className={`rounded-xl font-bold text-sm sm:text-lg ${activeTab === "progress" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>{t.progress}</button>
          <button onClick={() => setActiveTab("recordings")} className={`rounded-xl font-bold text-sm sm:text-lg ${activeTab === "recordings" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>{t.recordings}</button>
          <button onClick={() => setActiveTab("voice")} className={`rounded-xl font-bold text-sm sm:text-lg ${activeTab === "voice" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>{t.voice}</button>
          <button onClick={() => setActiveTab("settings")} className={`rounded-xl font-bold text-sm sm:text-lg ${activeTab === "settings" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>{t.settings}</button>
        </div>
        
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <BarChart3 className="w-16 h-16 text-sky-500 mb-4" />
                <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm">{t.totalRead}</h3>
                <span className="text-5xl font-black text-slate-800 mt-2">{stories.length}</span>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <Shield className="w-16 h-16 text-amber-500 mb-4" />
                <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm">{t.totalStars}</h3>
                <span className="text-5xl font-black text-slate-800 mt-2">{points}</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "recordings" && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{t.storyList}</h3>
            
            {recordings.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">
                {t.noRecordings}
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map(rec => {
                  const story = stories.find(s => s.id === rec.storyId);
                  return (
                    <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{story?.title || "Buku Misterius"}</h4>
                        <p className="text-sm text-slate-500">{new Date(rec.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="w-full sm:w-auto flex items-center justify-end">
                        <audio controls src={rec.blobUrl} className="h-10 w-full sm:w-64 max-w-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "voice" && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.voiceSettings}</h3>
            <p className="text-slate-500 mb-6 font-medium text-sm">{t.voiceDesc}</p>
            
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <div>
                  <div className="font-bold text-slate-800">{t.useCustom}</div>
                  <div className="text-sm text-slate-500 font-medium">{t.toggleDesc}</div>
                </div>
                <div 
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${useAppStore.getState().voiceSettings.useCustomVoice ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  onClick={() => useAppStore.getState().setVoiceSettings({ useCustomVoice: !useAppStore.getState().voiceSettings.useCustomVoice })}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${useAppStore.getState().voiceSettings.useCustomVoice ? 'translate-x-6' : ''}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ElevenLabs API Key</label>
                <input 
                  type="password"
                  value={useAppStore.getState().voiceSettings.elevenLabsApiKey}
                  onChange={(e) => useAppStore.getState().setVoiceSettings({ elevenLabsApiKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                  placeholder="sk_..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Voice ID</label>
                <input 
                  type="text"
                  value={useAppStore.getState().voiceSettings.customVoiceId}
                  onChange={(e) => useAppStore.getState().setVoiceSettings({ customVoiceId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                  placeholder="e.g. pNInz6obpgDQGcFmaJcg"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{t.settings}</h3>
            
            <div className="space-y-6 max-w-lg">
              <div className="p-4 border-2 border-red-100 bg-red-50 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div>
                    <h4 className="font-bold text-red-700">{t.clearData}</h4>
                    <p className="text-sm text-red-600 opacity-90">{t.clearDataDesc}</p>
                  </div>
                  <button onClick={clearAllDataAndReload} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-colors shadow-sm">
                    {t.clearData}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
