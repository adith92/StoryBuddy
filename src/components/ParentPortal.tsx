import React, { useState } from "react";
import { useAppStore } from "../store";
import { ArrowLeft, Shield, BarChart3, Lock, PlayCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card } from "./ui/card";

export const ParentPortal: React.FC<{ onViewChange: (view: "dashboard") => void }> = ({ onViewChange }) => {
  const { parentPin, setParentPin, points, stories, recordings } = useAppStore();
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(parentPin === null);
  const [setupPin, setSetupPin] = useState("");

  const handleUnlock = () => {
    if (pinInput === parentPin) {
      setIsUnlocked(true);
    } else {
      alert("Incorrect PIN!");
    }
  };

  const handleSetPin = () => {
    if (setupPin.length >= 4) {
      setParentPin(setupPin);
      setIsUnlocked(true);
    } else {
      alert("PIN must be at least 4 digits.");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-200">
          <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Parents Only!</h2>
          <p className="text-slate-500 mb-8 font-medium">Please enter your PIN to access controls.</p>
          
          <input 
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center text-4xl tracking-[1em] py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none mb-6 font-mono"
            placeholder="****"
          />
          
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 py-6 rounded-xl font-bold text-slate-500" onClick={() => onViewChange("dashboard")}>Cancel</Button>
            <Button className="flex-1 py-6 rounded-xl font-bold border-0 bg-indigo-500 text-white hover:bg-indigo-600" onClick={handleUnlock}>Unlock</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => onViewChange("dashboard")} className="text-slate-500 rounded-xl hover:bg-slate-200 font-bold">
          <ArrowLeft className="mr-2" /> Back to App
        </Button>
        <h1 className="text-2xl font-black text-indigo-900 flex items-center gap-2">
          <Shield className="text-indigo-500" /> Parent Dashboard
        </h1>
      </header>

      {parentPin === null && (
        <Card className="p-6 mb-8 bg-amber-50 border-amber-200 border-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <Lock className="w-10 h-10 flex-shrink-0 text-amber-500" />
            <div>
              <h3 className="font-bold text-lg">Secure the Dashboard</h3>
              <p className="text-sm opacity-80">Set up a PIN to lock kids out of the settings.</p>
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
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={handleSetPin}>Set PIN</Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-slate-200 p-1 mb-8">
          <TabsTrigger value="progress" className="rounded-xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow">Progress</TabsTrigger>
          <TabsTrigger value="recordings" className="rounded-xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow">Recordings</TabsTrigger>
          <TabsTrigger value="voice" className="rounded-xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow">AI Voice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-sm flex flex-col items-center text-center">
              <BarChart3 className="w-16 h-16 text-sky-500 mb-4" />
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm">Totals Stories Read</h3>
              <span className="text-5xl font-black text-slate-800 mt-2">{stories.length}</span>
            </Card>
            <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-sm flex flex-col items-center text-center">
              <Shield className="w-16 h-16 text-amber-500 mb-4" />
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total Stars Earned</h3>
              <span className="text-5xl font-black text-slate-800 mt-2">{points}</span>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recordings">
          <Card className="rounded-3xl border-slate-100 bg-white p-6 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Child's Voice Recordings</h3>
            
            {recordings.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">
                No recordings yet. Encourage them to read aloud using the record button!
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map(rec => {
                  const story = stories.find(s => s.id === rec.storyId);
                  return (
                    <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{story?.title || "Unknown Book"}</h4>
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
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card className="rounded-3xl border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Voice Cloning Settings</h3>
            <p className="text-slate-500 mb-6 font-medium text-sm">Enable realistic AI voices using ElevenLabs. Provide your API key and Voice ID to allow the app to read stories in a custom cloned voice.</p>
            
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <div>
                  <div className="font-bold text-slate-800">Use Custom Voice</div>
                  <div className="text-sm text-slate-500 font-medium">Toggle between Web Speech API and ElevenLabs</div>
                </div>
                <div 
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors \${useAppStore.getState().voiceSettings.useCustomVoice ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  onClick={() => useAppStore.getState().setVoiceSettings({ useCustomVoice: !useAppStore.getState().voiceSettings.useCustomVoice })}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform \${useAppStore.getState().voiceSettings.useCustomVoice ? 'translate-x-6' : ''}`} />
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
