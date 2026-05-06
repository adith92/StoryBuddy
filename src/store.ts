import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Avatar {
  hairStyle: string;
  hairColor: string;
  clothing: string;
  accessory: string;
  skinTone: string;
  customImageData?: string;
}

export interface StoryPage {
  id: string;
  text: string;
  illustrationPrompt: string;
  choices?: string[];
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  pages: StoryPage[];
  isInteractive: boolean; // True if it's a 'Choose Your Own Adventure' story
  isOffline?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface AudioRecording {
  id: string;
  storyId: string;
  pageId: string;
  blobUrl: string;
  timestamp: number;
}

export interface VoiceSettings {
  provider: "native" | "elevenlabs" | "sumopod" | "vynaa";
  elevenLabsApiKey: string;
  customVoiceId: string;
  sumoPodApiKey: string;
  sumoPodVoiceId: string; // e.g. 'alloy', 'echo', or their own custom voice
  vynaaVoiceId: string;
}

export interface AiSettings {
  provider: "gemini" | "sumopod" | "custom";
  sumoPodApiKey: string;
  sumoPodModelId: string;
  
  imageProvider: "gemini" | "vynaa";
  vynaaImageMode: "maker" | "deepimg" | "pollinations";
  
  customBaseUrl?: string;
}

export type AppLanguage = "id" | "en";

export const clearAllDataAndReload = async () => {
  if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data? Ini akan menghapus semua cerita, pengaturan, dan avatar.\n\nAre you sure you want to clear ALL data? This will delete all stories, settings, and avatars.")) {
    localStorage.clear();
    const { clear } = await import("idb-keyval");
    await clear();
    alert("Data berhasil dihapus! / Data successfully deleted!");
    window.location.reload();
  }
};

interface AppState {
  stories: Story[];
  currentStory: Story | null;
  currentPageIndex: number;
  badges: string[];
  points: number;
  recordings: AudioRecording[];
  parentPin: string | null;
  avatar: Avatar;
  voiceSettings: VoiceSettings;
  aiSettings: AiSettings;
  language: AppLanguage;

  setStories: (stories: Story[]) => void;
  updateStory: (storyId: string, updatedStory: Partial<Story>) => void;
  setCurrentStory: (story: Story | null) => void;
  setCurrentPageIndex: (index: number) => void;
  addRecording: (recording: AudioRecording) => void;
  addPoints: (points: number) => void;
  unlockBadge: (badgeId: string) => void;
  setParentPin: (pin: string | null) => void;
  setAvatar: (avatar: Partial<Avatar>) => void;
  setVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  setAiSettings: (settings: Partial<AiSettings>) => void;
  setLanguage: (lang: AppLanguage) => void;
  bgMusicEnabled: boolean;
  setBgMusicEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      stories: [],
      currentStory: null,
      currentPageIndex: 0,
      badges: [],
      points: 0,
      bgMusicEnabled: false,
      recordings: [],
      parentPin: null,
      language: "id", // Default to Indonesian
      avatar: {
        hairStyle: "short",
        hairColor: "brown",
        clothing: "superhero cape",
        accessory: "none",
        skinTone: "medium",
      },
      voiceSettings: {
        provider: "native",
        elevenLabsApiKey: "",
        customVoiceId: "",
        sumoPodApiKey: "",
        sumoPodVoiceId: "alloy",
        vynaaVoiceId: "aura-asteria-en",
      },
      aiSettings: {
        provider: "gemini",
        sumoPodApiKey: "",
        sumoPodModelId: "gpt-4o",
        imageProvider: "vynaa",
        vynaaImageMode: "maker",
      },

      setStories: (stories) => set({ stories }),
      updateStory: (storyId, updated) => set((state) => {
        const newStories = state.stories.map(s => s.id === storyId ? { ...s, ...updated } : s);
        const newCurrent = state.currentStory?.id === storyId ? { ...state.currentStory, ...updated } : state.currentStory;
        return { stories: newStories, currentStory: newCurrent as Story | null };
      }),
      setCurrentStory: (story) => set({ currentStory: story, currentPageIndex: 0 }),
      setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
      addRecording: (recording) =>
        set((state) => ({ recordings: [...state.recordings, recording] })),
      addPoints: (points) => set((state) => ({ points: state.points + points })),
      setBgMusicEnabled: (enabled) => set({ bgMusicEnabled: enabled }),
      unlockBadge: (badgeId) =>
        set((state) => {
          if (!state.badges.includes(badgeId)) {
            return { badges: [...state.badges, badgeId] };
          }
          return state;
        }),
      setParentPin: (pin) => set({ parentPin: pin }),
      setAvatar: (avatar) => set((state) => ({ avatar: { ...state.avatar, ...avatar } })),
      setVoiceSettings: (settings) => set((state) => ({ voiceSettings: { ...state.voiceSettings, ...settings } })),
      setAiSettings: (settings) => set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "story-buddy-storage",
      partialize: (state) => ({ 
        stories: state.stories, 
        points: state.points, 
        avatar: state.avatar, 
        language: state.language, 
        voiceSettings: state.voiceSettings, 
        aiSettings: state.aiSettings,
        parentPin: state.parentPin 
      }),
    }
  )
);
