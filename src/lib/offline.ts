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
          const dataUrl = await generateImage(p.illustrationPrompt, story.id);
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

export function useOfflineImage(cacheKey: string, prompt?: string, seed?: string) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;
    
    const loadImage = async () => {
      let blob = await get<Blob>(cacheKey);
      
      if (!blob && prompt) {
        // Try to generate on the fly if not found
        try {
          const dataUrl = await generateImage(prompt, seed || cacheKey);
          if (!isMounted) return;
          
          if (dataUrl.startsWith("data:")) {
            // It's a base64 from proxy, avoid double-fetching if not needed
            setSrc(dataUrl);
            try {
               const res = await fetch(dataUrl);
               blob = await res.blob();
               await set(cacheKey, blob);
            } catch (ignore) {}
            return;
          }

          try {
            const res = await fetch(dataUrl);
            if (!res.ok) throw new Error("Fetch failed for image URL");
            blob = await res.blob();
            await set(cacheKey, blob);
          } catch (e) {
            console.warn("Failed to save generated image to offline cache (possibly CORS), falling back to direct URL", e);
            if (!isMounted) return;
            setSrc(dataUrl);
            return;
          }
        } catch (e) {
          console.error("Generating image on the fly ultimately failed", e);
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
  }, [cacheKey, prompt, seed]);

  return src;
}

