import { create } from "zustand";

export interface Avatar {
  hairStyle: string;
  hairColor: string;
  clothing: string;
  accessory: string;
  skinTone: string;
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
  elevenLabsApiKey: string;
  customVoiceId: string;
  useCustomVoice: boolean;
}

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
}

export const useAppStore = create<AppState>((set) => ({
  stories: [],
  currentStory: null,
  currentPageIndex: 0,
  badges: [],
  points: 0,
  recordings: [],
  parentPin: null,
  avatar: {
    hairStyle: "short",
    hairColor: "brown",
    clothing: "superhero cape",
    accessory: "none",
    skinTone: "medium",
  },
  voiceSettings: {
    elevenLabsApiKey: "",
    customVoiceId: "",
    useCustomVoice: false,
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
}));
