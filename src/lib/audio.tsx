import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";

interface AudioContextType {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { voiceSettings, language } = useAppStore();
  const audioObjRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = []; // reset chunks
        const url = URL.createObjectURL(blob);
        
        // Stop all tracks to release mic
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        resolve(url);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const speakNative = (text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) return;
    
    stopSpeaking();
    
    // Ensure voices are loaded (sometimes they load async in browsers)
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langCode = language === "id" ? "id-ID" : "en-US";
    utterance.lang = langCode;

    // Try finding a matching language voice
    const voice = voices.find(v => v.lang.includes(langCode.split('-')[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speakElevenLabs = async (text: string, onEnd?: () => void) => {
    setIsSpeaking(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.customVoiceId}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": voiceSettings.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate voice");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioObjRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      
      audio.play();

    } catch (e) {
      console.error(e);
      alert("Failed to speak using custom voice. Falling back to default.");
      speakNative(text, onEnd);
    }
  };

  const speakSumoPod = async (text: string, onEnd?: () => void) => {
    setIsSpeaking(true);
    try {
      const response = await fetch(`https://ai.sumopod.com/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${voiceSettings.sumoPodApiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: voiceSettings.sumoPodVoiceId || "alloy"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to generate voice using SumoPod: ${errText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioObjRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      
      audio.play();

    } catch (e: any) {
      console.error(e);
      alert(`Failed to speak using SumoPod Custom voice: ${e.message || "Unknown Error"}\nFalling back to default.`);
      speakNative(text, onEnd);
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    stopSpeaking();
    
    if (voiceSettings.provider === 'elevenlabs' && voiceSettings.elevenLabsApiKey && voiceSettings.customVoiceId) {
       speakElevenLabs(text, onEnd);
    } else if (voiceSettings.provider === 'sumopod' && voiceSettings.sumoPodApiKey) {
       speakSumoPod(text, onEnd);
    } else {
       speakNative(text, onEnd);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioObjRef.current) {
      audioObjRef.current.pause();
      audioObjRef.current.currentTime = 0;
      audioObjRef.current = null;
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isRecording, startRecording, stopRecording, speak, stopSpeaking, isSpeaking }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudioContext must be used within an AudioProvider");
  return ctx;
};
