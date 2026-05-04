import { useEffect, useState } from 'react';
import { get, set, del } from 'idb-keyval';
import { Story } from '../store';

export async function downloadStoryImages(story: Story, onProgress?: (progress: number) => void): Promise<void> {
  const imageUrls = story.pages.map(p => `https://image.pollinations.ai/prompt/${encodeURIComponent(p.illustrationPrompt)}?width=800&height=600&nologo=true&seed=${p.id}`);
  
  const coverUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(story.title + " children story book cover vibrant 2d vector vector art")}?width=400&height=300&nologo=true&seed=${story.id}`;
  
  imageUrls.push(coverUrl);

  let completed = 0;
  for (const url of imageUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        await set(url, blob);
      }
    } catch (e) {
      console.error("Failed to download image", url, e);
    }
    completed++;
    onProgress?.(completed / imageUrls.length);
  }
}

export async function removeStoryImages(story: Story): Promise<void> {
  const imageUrls = story.pages.map(p => `https://image.pollinations.ai/prompt/${encodeURIComponent(p.illustrationPrompt)}?width=800&height=600&nologo=true&seed=${p.id}`);
  const coverUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(story.title + " children story book cover vibrant 2d vector vector art")}?width=400&height=300&nologo=true&seed=${story.id}`;
  
  imageUrls.push(coverUrl);
  
  for (const url of imageUrls) {
    await del(url);
  }
}

export function useOfflineImage(url: string) {
  const [src, setSrc] = useState<string>(url);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;
    
    get<Blob>(url).then((blob) => {
      if (!isMounted) return;
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } else {
        setSrc(url);
      }
    });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return src;
}
