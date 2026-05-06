import { Story, StoryPage, Avatar, AppLanguage, useAppStore } from "../store";
import { generateImageWithVynaa } from "./vynaa";

// Fallback image handling
function getPollinationsFallback(prompt: string, seed?: string) {
  const numSeed = seed ? Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
  const safePrompt = (prompt + " 2d vector art children style").slice(0, 800);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=800&height=600&nologo=true&seed=${numSeed}`;
}

export async function generateImage(prompt: string, seed?: string): Promise<string> {
  const { aiSettings } = useAppStore.getState();

  if (aiSettings.imageProvider === 'vynaa') {
    try {
      return await generateImageWithVynaa(prompt, aiSettings.vynaaImageMode, seed);
    } catch (error) {
      console.warn("Failed to generate image using Vynaa, falling back to Pollinations directly.", error);
      return getPollinationsFallback(prompt, seed);
    }
  }

  // GEMINI FALLBACK
  try {
    const res = await fetch("/api/gemini/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt + " Bright, colorful, 2D vector children's book illustration style." })
    });
    const data = await res.json();
    if (res.ok && data.url) return data.url;
    throw new Error(data.error || "Failed");
  } catch (error: any) {
    console.warn("Failed to generate image using Gemini, falling back to Pollinations.", error);
    return getPollinationsFallback(prompt, seed);
  }
}

export async function cartoonifyPhoto(fileData: string, mimeType: string): Promise<string> {
  const res = await fetch("/api/gemini/cartoonify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileData: fileData.split(',')[1] || fileData, mimeType })
  });
  const data = await res.json();
  if (res.ok && data.url) return data.url;
  throw new Error(data.error || "No cartoon image generated.");
}

function cleanJson(text: string) {
  let c = text.trim();
  if (c.startsWith("```json")) c = c.slice(7);
  else if (c.startsWith("```")) c = c.slice(3);
  if (c.endsWith("```")) c = c.slice(0, -3);
  return c.trim();
}

export async function generateNewStory(theme: string, character: string, isInteractive: boolean, avatar: Avatar, language: AppLanguage): Promise<Story> {
  const languageName = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const avatarDesc = `[CRITICAL CHARACTER CONSISTENCY]: The main character MUST look EXACTLY like this in EVERY single illustration prompt: A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing ${avatar.clothing}, and holding/wearing: ${avatar.accessory}. Do NOT change the character's face, clothes, or hair between pages. Start EVERY illustrationPrompt with this exact description to lock the character's appearance.`;
  
  const rules = isInteractive ? 
    `This is an interactive "Choose Your Own Adventure" story. Generate ONLY the FIRST page of the story (1-3 sentences) setting up the beginning. Include 2 or 3 choices for the child to decide what the character does next.` :
    `Break the story into 4 to 6 pages. Each page should contain 1-3 sentences. Do not include choices.`;

  const prompt = `Write a short, engaging children's story (for ages 4-8) in ${languageName} about a ${character} related to the theme "${theme}". 
  Use very simple words suitable for a 4-year-old.
  ${avatarDesc}
  ${rules}
  
  For each page, also provide a highly descriptive prompt for an AI image generator to create an illustration for that page.
  The illustration prompt should specify a bright, colorful, 2D vector children's book illustration style.`;

  const { aiSettings } = useAppStore.getState();
  let rawData: any = {};

  if (aiSettings.provider === 'sumopod' || aiSettings.provider === 'custom') {
    const jsonSchemaInstructions = `You MUST return a JSON object with this exact structure, containing no markdown formatting outside the JSON: { "title": "string", "genre": "string", "pages": [{ "text": "string", "illustrationPrompt": "string", "choices": ["string", "string"] }] }`;
    
    // We proxy through our backend instead of exposing keys to frontend. If it fails, error will bubble up.
    // Assuming backend falls back to owner keys if user didn't provide custom keys
    const res = await fetch("/api/sumopod/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiSettings.sumoPodModelId || "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and use simple language for young children. ${jsonSchemaInstructions}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate story");
    
    rawData = JSON.parse(cleanJson(data.content));
  } else {
    // gemini fallback
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        systemInstruction: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and use simple language for young children.`,
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            genre: { type: "STRING" },
            pages: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING", description: "The paragraph to be read on this page" },
                  illustrationPrompt: { type: "STRING", description: "Prompt for the AI image generator." },
                  choices: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "Choices in the same language as the story."
                  }
                },
                required: ["text", "illustrationPrompt"]
              }
            }
          },
          required: ["title", "genre", "pages"]
        }
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate story");
    rawData = JSON.parse(cleanJson(data.content || "{}"));
  }

  try {
    if (!rawData.pages || !Array.isArray(rawData.pages)) throw new Error("Invalid generated story format");
    
    const story: Story = {
      id: crypto.randomUUID(),
      title: rawData.title || (language === "id" ? "Cerita Baru" : "New Story"),
      genre: rawData.genre || (language === "id" ? "Petualangan" : "Adventure"),
      isInteractive: isInteractive,
      pages: rawData.pages.map((p: any) => ({
        id: crypto.randomUUID(),
        text: p.text,
        illustrationPrompt: p.illustrationPrompt,
        choices: p.choices?.length > 0 ? p.choices : undefined,
      })),
    };
    return story;
  } catch (error: any) {
    console.error("Failed to parse story:", error);
    throw new Error(error.message || "Could not generate story.");
  }
}

export async function generateNextPage(story: Story, choice: string, avatar: Avatar, language: AppLanguage): Promise<StoryPage> {
  const languageName = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const avatarDesc = `[CRITICAL CHARACTER CONSISTENCY]: The main character MUST look EXACTLY like this in EVERY single illustration prompt: A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing ${avatar.clothing}, and holding/wearing: ${avatar.accessory}. Do NOT change the character's face, clothes, or hair between pages. Start EVERY illustrationPrompt with this exact description to lock the character's appearance.`;
  
  const history = story.pages.map((p, i) => `Page ${i + 1}: ${p.text}`).join('\n');
  
  const prompt = `You are continuing an interactive children's story (ages 4-8) in ${languageName}.
  Use very simple words.
  Previous story context:
  Title: ${story.title}
  ${history}
  
  The child chose to: "${choice}"
  
  Generate ONE single page containing 1-3 sentences in ${languageName} describing the outcome of this choice and what happens next.
  Also provide 2 or 3 NEW choices in ${languageName}.
  
  Provide an illustrationPrompt for this page, ensuring the character's visual description (${avatarDesc}) is included.`;

  const { aiSettings } = useAppStore.getState();
  let rawData: any = {};

  if (aiSettings.provider === 'sumopod' || aiSettings.provider === 'custom') {
    const jsonSchemaInstructions = `You MUST return a JSON object with this exact structure, containing no markdown formatting outside the JSON: { "text": "string", "illustrationPrompt": "string", "choices": ["string", "string"] }`;
    const res = await fetch("/api/sumopod/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiSettings.sumoPodModelId || "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and simple. ${jsonSchemaInstructions}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    rawData = JSON.parse(cleanJson(data.content));
  } else {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        systemInstruction: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and simple.`,
        responseSchema: {
          type: "OBJECT",
          properties: {
            text: { type: "STRING" },
            illustrationPrompt: { type: "STRING" },
            choices: {
              type: "ARRAY",
              items: { type: "STRING" },
            }
          },
          required: ["text", "illustrationPrompt"]
        }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    rawData = JSON.parse(cleanJson(data.content || "{}"));
  }

  try {
    return {
      id: crypto.randomUUID(),
      text: rawData.text,
      illustrationPrompt: rawData.illustrationPrompt,
      choices: rawData.choices?.length > 0 ? rawData.choices : undefined,
    };
  } catch (error) {
    console.error("Failed to parse next page response.", error);
    throw new Error("Could not generate next page.");
  }
}
