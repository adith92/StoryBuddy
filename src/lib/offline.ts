import { useEffect, useState } from 'react';
import { get, set, del } from 'idb-keyval';
import { Story } from '../store';
import { generateImage } from './gemini';

export async function downloadStoryImages(story: Story, onProgress?: (progress: number) => void): Promise<void> {
  const tasks = [];
  tasks.push(async () => {
    const key = `cover-${story.id}`;
    if (!(await get(key))) {
      try {
        const dataUrl = await generateImage(story.title + " children story book cover", story.id);
        await set(key, await (await fetch(dataUrl)).blob());
      } catch (e) { console.warn("Failed to download cover image", e); }
    }
  });

  for (const p of story.pages) {
    tasks.push(async () => {
      const key = `page-${p.id}`;
      if (!(await get(key))) {
        try {
          const dataUrl = await generateImage(p.illustrationPrompt, p.id);
          await set(key, await (await fetch(dataUrl)).blob());
        } catch (e) { console.warn("Failed to download page image", e); }
      }
    });
  }

  let completed = 0;
  for (const task of tasks) {
    await task();
    completed++;
    onProgress?.(completed / tasks.length);
  }
}

export async function removeStoryImages(story: Story): Promise<void> {
  await del(`cover-${story.id}`);
  for (const p of story.pages) {
    await del(`page-${p.id}`);
  }
}

export function useOfflineImage(cacheKey: string, prompt?: string) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;
    
    const loadImage = async () => {
      let blob = await get<Blob>(cacheKey);
      
      if (!blob && prompt) {
        // Try to generate on the fly if not found
        try {
          const dataUrl = await generateImage(prompt, cacheKey);
          blob = await (await fetch(dataUrl)).blob();
          await set(cacheKey, blob);
        } catch (e) {
          console.warn("Generating image on the fly ultimately failed even with fallback", e);
        }
      }

      if (!isMounted) return;

      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [cacheKey, prompt]);

  return src;
}

