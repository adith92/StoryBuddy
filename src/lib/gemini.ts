import { GoogleGenAI, Type } from "@google/genai";
import { Story, StoryPage, Avatar, AppLanguage, useAppStore } from "../store";
import { generateImageWithVynaa } from "./vynaa";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateImage(prompt: string, seed?: string): Promise<string> {
  const { aiSettings } = useAppStore.getState();

  if (aiSettings.imageProvider === 'vynaa') {
    try {
      return await generateImageWithVynaa(prompt, aiSettings.vynaaImageMode, seed);
    } catch (error) {
      console.warn("Failed to generate image using Vynaa, falling back to Pollinations directly.", error);
      const numSeed = seed ? Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
      const safePrompt = (prompt + " 2d vector art children style").slice(0, 800);
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=800&height=600&nologo=true&seed=${numSeed}`;
    }
  }

  // GEMINI FALLBACK
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt + " Bright, colorful, 2D vector children's book illustration style." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    const errorMessage = error?.message || "";
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
      console.warn("Quota exceeded for Gemini Image API, falling back to Pollinations.");
    } else {
      console.warn("Failed to generate image using Gemini, falling back to Pollinations.");
    }
    const numSeed = seed ? Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
    const safePrompt = (prompt + " 2d vector art children style").slice(0, 800);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=800&height=600&nologo=true&seed=${numSeed}`;
  }
}

export async function cartoonifyPhoto(fileData: string, mimeType: string): Promise<string> {
  // Convert real photo to cartoon style avatar based on user's child's photo
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: fileData.split(',')[1] || fileData,
            mimeType: mimeType,
          },
        },
        {
          text: 'Turn this photo into a cute, bright, colorful 2D vector cartoon avatar suitable for a children\'s book main character. White background.',
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No cartoon image generated.");
}

export async function generateNewStory(theme: string, character: string, isInteractive: boolean, avatar: Avatar, language: AppLanguage): Promise<Story> {
  const languageName = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const avatarDesc = `[CRITICAL CHARACTER CONSISTENCY]: The main character MUST look EXACTLY like this in EVERY single illustration prompt: A cute child with ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing ${avatar.clothing}, and holding/wearing: ${avatar.accessory}. Do NOT change the character's face, clothes, or hair between pages. Start EVERY illustrationPrompt with this exact description to lock the character's appearance.`;
  
  const rules = isInteractive ? 
    `This is an interactive "Choose Your Own Adventure" story. Generate ONLY the FIRST page of the story (1-3 sentences) setting up the beginning. Include 2 or 3 choices for the child to decide what the character does next.` :
    `Break the story into 4 to 6 pages. Each page should contain 1-3 sentences. Do not include choices.`;

  const prompt = `Write a short, engaging children's story (for ages 4-8) in ${languageName} about a ${character} related to the theme "${theme}". 
  Use very simple words suitable for a 4-year-old.
  ${avatarDesc} (Always include these character visual traits in the illustrationPrompt for every page to ensure consistency).
  ${rules}
  
  For each page, also provide a highly descriptive prompt for an AI image generator to create an illustration for that page.
  The illustration prompt should specify a bright, colorful, 2D vector children's book illustration style.`;

  const { aiSettings } = useAppStore.getState();
  let rawData: any = {};

  if ((aiSettings.provider === 'sumopod' || aiSettings.provider === 'custom') && aiSettings.sumoPodApiKey) {
    const jsonSchemaInstructions = `You MUST return a JSON object with this exact structure, containing no markdown formatting outside the JSON: { "title": "string", "genre": "string", "pages": [{ "text": "string", "illustrationPrompt": "string", "choices": ["string", "string"] }] }`;
    const baseUrl = aiSettings.provider === 'custom' && aiSettings.customBaseUrl ? aiSettings.customBaseUrl : "https://ai.sumopod.com/v1";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${aiSettings.sumoPodApiKey}`
      },
      body: JSON.stringify({
        model: aiSettings.sumoPodModelId || "gpt-4o",
        messages: [
          { role: "system", content: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and use simple language for young children. ${jsonSchemaInstructions}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`SumoPod API error: ${err}`);
    }

    const data = await response.json();
    rawData = JSON.parse(data.choices[0].message.content);
  } else {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and use simple language for young children.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            genre: { type: Type.STRING },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The paragraph to be read on this page",
                  },
                  illustrationPrompt: {
                    type: Type.STRING,
                    description: "Prompt for the AI image generator.",
                  },
                  choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Choices in the same language as the story.",
                  }
                },
                required: ["text", "illustrationPrompt"],
              },
            },
          },
          required: ["title", "genre", "pages"],
        },
      },
    });

    rawData = JSON.parse(response.text?.trim() || "{}");
  }

  try {
    const story: Story = {
      id: crypto.randomUUID(),
      title: rawData.title || (language === "id" ? "Cerita Baru" : "New Story"),
      genre: rawData.genre || (language === "id" ? "Petualangan" : "Adventure"),
      isInteractive: isInteractive,
      pages: (rawData.pages || []).map((p: any) => ({
        id: crypto.randomUUID(),
        text: p.text,
        illustrationPrompt: p.illustrationPrompt,
        choices: p.choices?.length > 0 ? p.choices : undefined,
      })),
    };
    return story;
  } catch (error) {
    console.error("Failed to parse story generation response.", error);
    throw new Error("Could not generate story.");
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

  if ((aiSettings.provider === 'sumopod' || aiSettings.provider === 'custom') && aiSettings.sumoPodApiKey) {
    const jsonSchemaInstructions = `You MUST return a JSON object with this exact structure, containing no markdown formatting outside the JSON: { "text": "string", "illustrationPrompt": "string", "choices": ["string", "string"] }`;
    const baseUrl = aiSettings.provider === 'custom' && aiSettings.customBaseUrl ? aiSettings.customBaseUrl : "https://ai.sumopod.com/v1";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${aiSettings.sumoPodApiKey}`
      },
      body: JSON.stringify({
        model: aiSettings.sumoPodModelId || "gpt-4o",
        messages: [
          { role: "system", content: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and simple. ${jsonSchemaInstructions}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`SumoPod API error: ${err}`);
    }

    const data = await response.json();
    rawData = JSON.parse(data.choices[0].message.content);
  } else {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a creative children's book author writing in ${languageName}. Your stories are engaging, safe, positive, and simple.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            illustrationPrompt: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          },
          required: ["text", "illustrationPrompt"],
        },
      },
    });

    rawData = JSON.parse(response.text?.trim() || "{}");
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
