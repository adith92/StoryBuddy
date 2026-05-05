import React, { useState } from "react";
import { useAppStore, clearAllDataAndReload } from "../store";
import { ArrowLeft, Shield, BarChart3, Lock, PlayCircle } from "lucide-react";

export const ParentPortal: React.FC<{ onViewChange: (view: "dashboard") => void }> = ({ onViewChange }) => {
  const { parentPin, setParentPin, points, stories, recordings, language, voiceSettings, setVoiceSettings, aiSettings, setAiSettings } = useAppStore();
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(parentPin === null);
  const [setupPin, setSetupPin] = useState("");
  const [activeTab, setActiveTab] = useState("progress");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const checkTextAPI = async () => {
    setIsCheckingApi(true);
    const baseUrl = aiSettings.provider === 'custom' && aiSettings.customBaseUrl ? aiSettings.customBaseUrl : "https://ai.sumopod.com/v1";
    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${aiSettings.sumoPodApiKey}` }
      });
      if (res.ok) {
        showToast(language === "id" ? "API AI Konek Dengan Baik! ✅" : "AI API Connected Successfully! ✅");
      } else {
        showToast(language === "id" ? `Gagal Terhubung AI API ❌` : `Failed to Connect AI API ❌`);
      }
    } catch (e) {
      showToast(language === "id" ? "Gagal Terhubung ke AI API ❌" : "Failed to Connect to AI API ❌");
    } finally {
      setIsCheckingApi(false);
    }
  };

  const [isCheckingVoiceApi, setIsCheckingVoiceApi] = useState(false);
  const checkVoiceAPI = async () => {
    setIsCheckingVoiceApi(true);
    try {
      const res = await fetch("https://ai.sumopod.com/v1/models", {
        headers: { "Authorization": `Bearer ${voiceSettings.sumoPodApiKey}` }
      });
      if (res.ok) {
        showToast(language === "id" ? "Voice API Konek Dengan Baik! ✅" : "Voice API Connected Successfully! ✅");
      } else {
        showToast(language === "id" ? `Gagal Terhubung Voice API ❌` : `Failed to Connect Voice API ❌`);
      }
    } catch (e) {
      showToast(language === "id" ? "Gagal Terhubung ke Voice API ❌" : "Failed to Connect to Voice API ❌");
    } finally {
      setIsCheckingVoiceApi(false);
    }
  };

  const [isCheckingVynaaApi, setIsCheckingVynaaApi] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const checkVynaaAPI = async () => {
    setIsCheckingVynaaApi(true);
    try {
      const res = await fetch("/api/vynaa/test");
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === "id" ? "Vynaa API Konek Dengan Baik! ✅" : "Vynaa API Connected Successfully! ✅");
      } else {
        showToast(language === "id" ? `Gagal Terhubung Vynaa API: ${data.error} ❌` : `Failed to Connect Vynaa API: ${data.error} ❌`);
      }
    } catch (e: any) {
      showToast(language === "id" ? `Gagal Terhubung ke Vynaa API ❌` : `Failed to Connect to Vynaa API ❌`);
    } finally {
      setIsCheckingVynaaApi(false);
    }
  };

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
      progress: "Aktivitas",
      recordings: "Rekaman",
      voice: "Suara AI",
      settings: "Pengaturan",
      totalRead: "Cerita Yang Dibaca",
      totalStars: "Total Bintang",
      voiceSettings: "Pengaturan Kloning Suara",
      voiceDesc: "Gunakan ElevenLabs untuk suara AI yang nyata atau SumoPod API.",
      useCustom: "Provider TTS",
      toggleDesc: "Pilih antara Native TTS, ElevenLabs, atau SumoPod",
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
      voiceDesc: "Enable realistic AI voices using ElevenLabs or SumoPod API.",
      useCustom: "TTS Provider",
      toggleDesc: "Choose between Web Speech API, ElevenLabs, or SumoPod",
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
    <div className="max-w-4xl mx-auto p-4 sm:p-8 min-h-screen relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-top fade-in duration-300 font-medium">
          {toastMessage}
        </div>
      )}

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
              <div className="flex flex-col bg-slate-50 p-4 rounded-xl gap-4">
                <div>
                  <div className="font-bold text-slate-800">{t.useCustom}</div>
                  <div className="text-sm text-slate-500 font-medium">{t.toggleDesc}</div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="provider" checked={voiceSettings.provider === 'native'} onChange={() => setVoiceSettings({ provider: 'native' })} className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-700">Native API</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="provider" checked={voiceSettings.provider === 'elevenlabs'} onChange={() => setVoiceSettings({ provider: 'elevenlabs' })} className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-700">ElevenLabs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="provider" checked={voiceSettings.provider === 'sumopod'} onChange={() => setVoiceSettings({ provider: 'sumopod' })} className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-700">SumoPod</span>
                  </label>
                </div>
              </div>

              {voiceSettings.provider === 'elevenlabs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">ElevenLabs API Key</label>
                    <input 
                      type="password"
                      value={voiceSettings.elevenLabsApiKey}
                      onChange={(e) => setVoiceSettings({ elevenLabsApiKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                      placeholder="sk_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Voice ID</label>
                    <input 
                      type="text"
                      value={voiceSettings.customVoiceId}
                      onChange={(e) => setVoiceSettings({ customVoiceId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                      placeholder="e.g. pNInz6obpgDQGcFmaJcg"
                    />
                  </div>
                </div>
              )}

              {voiceSettings.provider === 'sumopod' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">SumoPod API Key</label>
                    <input 
                      type="password"
                      value={voiceSettings.sumoPodApiKey}
                      onChange={(e) => setVoiceSettings({ sumoPodApiKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                      placeholder="sk-..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Voice / Model ID</label>
                    <input
                      list="sumopod-voices"
                      value={voiceSettings.sumoPodVoiceId}
                      onChange={(e) => setVoiceSettings({ sumoPodVoiceId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                      placeholder="Select or type voice ID..."
                    />
                    <datalist id="sumopod-voices">
                      <option value="alloy" />
                      <option value="echo" />
                      <option value="fable" />
                      <option value="onyx" />
                      <option value="nova" />
                      <option value="shimmer" />
                    </datalist>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={checkVoiceAPI}
                      disabled={isCheckingVoiceApi}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors shadow-sm w-full flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isCheckingVoiceApi ? (language === "id" ? "Mengecek..." : "Checking...") : (language === "id" ? "Cek API Voice" : "Check Voice API")}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button 
                  onClick={() => showToast(language === "id" ? "Pengaturan suara berhasil disimpan! (Autosave aktif)." : "Voice settings saved successfully! (Autosave is active).")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md w-full"
                >
                  {language === "id" ? "Simpan Pengaturan" : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{t.settings}</h3>
            
            <div className="space-y-8 max-w-lg">
              {/* AI Generation Settings */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 tracking-wide">AI Text Generation</h4>
                <div className="flex flex-col bg-slate-50 p-4 rounded-xl gap-4 border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">AI Provider</div>
                    <div className="text-sm text-slate-500 font-medium">Choose between standard Gemini or SumoPod (OpenAI Compatible API)</div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ai_provider" checked={aiSettings.provider === 'gemini'} onChange={() => setAiSettings({ provider: 'gemini' })} className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-slate-700">Gemini (Default)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ai_provider" checked={aiSettings.provider === 'sumopod'} onChange={() => setAiSettings({ provider: 'sumopod' })} className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-slate-700">SumoPod</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ai_provider" checked={aiSettings.provider === 'custom'} onChange={() => setAiSettings({ provider: 'custom' })} className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-slate-700">Custom (OpenAI Compatible)</span>
                    </label>
                  </div>
                </div>

                {(aiSettings.provider === 'sumopod' || aiSettings.provider === 'custom') && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 mt-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                      <input 
                        type="password"
                        value={aiSettings.sumoPodApiKey}
                        onChange={(e) => setAiSettings({ sumoPodApiKey: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                        placeholder="sk-..."
                      />
                    </div>

                    {aiSettings.provider === 'custom' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Base URL</label>
                        <input 
                          type="text"
                          value={aiSettings.customBaseUrl || ""}
                          onChange={(e) => setAiSettings({ customBaseUrl: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                          placeholder="https://api.openai.com/v1"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Model ID (Text)</label>
                      <input
                        list="sumopod-text-models"
                        value={aiSettings.sumoPodModelId}
                        onChange={(e) => setAiSettings({ sumoPodModelId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                        placeholder="Select or type model ID..."
                      />
                      <datalist id="sumopod-text-models">
                        <option value="gemini-2.5-flash" />
                        <option value="deepseek-v3" />
                        <option value="qwen3" />
                        <option value="llama-3.1-8b" />
                        <option value="grok" />
                        <option value="mistral-small" />
                        <option value="gpt-4o" />
                        <option value="gpt-4o-mini" />
                        <option value="claude-3-5-sonnet-20241022" />
                        <option value="claude-3-haiku-20240307" />
                        <option value="google/gemini-1.5-pro" />
                        <option value="google/gemini-1.5-flash" />
                        <option value="llama-3.3-70b-versatile" />
                      </datalist>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={checkTextAPI}
                        disabled={isCheckingApi}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors shadow-sm w-full flex justify-center items-center gap-2 disabled:opacity-50"
                      >
                        {isCheckingApi ? (language === "id" ? "Mengecek..." : "Checking...") : (language === "id" ? "Cek API AI" : "Check AI API")}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Image Generation Settings */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="mb-4">
                    <div className="font-bold text-slate-800">Image Provider</div>
                    <div className="text-sm text-slate-500 font-medium">Choose between standard Gemini or Vynaa for illustrations.</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${aiSettings.imageProvider === 'vynaa' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <input type="radio" name="image_provider" className="sr-only" checked={aiSettings.imageProvider === 'vynaa'} onChange={() => setAiSettings({ imageProvider: 'vynaa' })} />
                      <span className="font-bold text-slate-800">Vynaa AI (Default)</span>
                      <span className="text-sm text-slate-500 mt-1 leading-snug">High-quality image generation using Maker, DeepImg, and Pollinations.</span>
                      {aiSettings.imageProvider === 'vynaa' && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${aiSettings.imageProvider === 'gemini' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <input type="radio" name="image_provider" className="sr-only" checked={aiSettings.imageProvider === 'gemini'} onChange={() => setAiSettings({ imageProvider: 'gemini' })} />
                      <span className="font-bold text-slate-800">Google Gemini</span>
                      <span className="text-sm text-slate-500 mt-1 leading-snug">Standard built-in image generator using Gemini models.</span>
                      {aiSettings.imageProvider === 'gemini' && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {aiSettings.imageProvider === 'vynaa' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Vynaa Image Mode</label>
                      <select
                        value={aiSettings.vynaaImageMode || "maker"}
                        onChange={(e) => setAiSettings({ vynaaImageMode: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                      >
                        <option value="maker">Vynaa Maker Text2Img</option>
                        <option value="deepimg">Vynaa DeepImg</option>
                        <option value="pollinations">Vynaa Pollinations Image</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={checkVynaaAPI}
                        disabled={isCheckingVynaaApi}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl transition-colors shadow-sm w-full flex justify-center items-center gap-2 disabled:opacity-50"
                      >
                        {isCheckingVynaaApi ? (language === "id" ? "Mengecek..." : "Checking...") : (language === "id" ? "Cek API Vynaa" : "Check Vynaa API")}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Background Music Settings */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 tracking-wide">{language === "id" ? "Musik Pengantar Tidur" : "Lullaby Music"}</h4>
                  <div className="flex flex-col bg-slate-50 p-4 rounded-xl gap-4 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{language === "id" ? "Lagu Yang Buat Ngantuk" : "Sleepy Background Music"}</div>
                        <div className="text-sm text-slate-500 font-medium">{language === "id" ? "Putar lagu tidur saat membaca cerita." : "Play lullaby music while reading stories."}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={useAppStore.getState().bgMusicEnabled} onChange={(e) => useAppStore.getState().setBgMusicEnabled(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => showToast(language === "id" ? "Pengaturan berhasil disimpan! (Autosave telah aktif)." : "Settings saved successfully! (Autosave is active).")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md w-full"
                  >
                    {language === "id" ? "Simpan Pengaturan" : "Save Settings"}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-slate-200">
                <div className="p-4 border-2 border-red-100 bg-red-50 rounded-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div>
                      <h4 className="font-bold text-red-700">{t.clearData}</h4>
                      <p className="text-sm text-red-600 opacity-90">{t.clearDataDesc}</p>
                    </div>
                    {!isConfirmingClear ? (
                      <button 
                        onClick={() => setIsConfirmingClear(true)} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-colors shadow-sm"
                      >
                        {t.clearData}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-200 bg-red-100/50 p-2 rounded-xl">
                        <span className="text-sm font-bold text-red-800">{language === "id" ? "Yakin hapus semua?" : "Are you sure?"}</span>
                        <button 
                          onClick={() => setIsConfirmingClear(false)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={async () => {
                            localStorage.clear();
                            const { clear } = await import("idb-keyval");
                            await clear();
                            showToast(language === "id" ? "Data berhasil dihapus! Memuat ulang..." : "Data successfully deleted! Reloading...");
                            setTimeout(() => window.location.href = "/", 1000);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm text-sm"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
