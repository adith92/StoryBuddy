import { GoogleGenAI, Type } from "@google/genai";
import { Story, StoryPage, Avatar } from "../store";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateNewStory(theme: string, character: string, isInteractive: boolean, avatar: Avatar): Promise<Story> {
  const avatarDesc = `The main character looks like this: ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing a ${avatar.clothing}. Accessory: ${avatar.accessory}.`;
  
  const rules = isInteractive ? 
    `This is an interactive "Choose Your Own Adventure" story. Generate ONLY the FIRST page of the story (1-3 sentences) setting up the beginning. Include 2 or 3 choices for the child to decide what the character does next.` :
    `Break the story into 4 to 6 pages. Each page should contain 1-3 sentences. Do not include choices.`;

  const prompt = `Write a short, engaging children's story (for ages 4-8) about a ${character} related to the theme "${theme}".
  ${avatarDesc} (Always include these character visual traits in the illustrationPrompt for every page to ensure consistency).
  ${rules}
  
  For each page, also provide a highly descriptive prompt for an AI image generator to create an illustration for that page.
  The illustration prompt should specify a bright, colorful, 2D vector children's book illustration style.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a creative children's book author. Your stories are engaging, safe, positive, and have clear moral lessons. Use simple language.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The title of the story",
          },
          genre: {
            type: Type.STRING,
            description: "The genre, e.g., Fantasy, Adventure, Bedtime",
          },
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
                  description: "Prompt for the AI image generator. ALWAYS include the character's visual description (skin tone, hair, clothing, accessory) in this prompt. E.g., 'A cute child with short brown hair, medium skin tone, wearing a superhero cape, holding no accessory, in a bright sunny meadow, 2D vector illustration, child-friendly'",
                },
                choices: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Only provide this if it is an interactive story. An array of 2-3 choices for the next action.",
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

  try {
    const rawData = JSON.parse(response.text?.trim() || "{}");
    const story: Story = {
      id: crypto.randomUUID(),
      title: rawData.title || "My AI Story",
      genre: rawData.genre || "Adventure",
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

export async function generateNextPage(story: Story, choice: string, avatar: Avatar): Promise<StoryPage> {
  const avatarDesc = `The main character looks like this: ${avatar.skinTone} skin tone, ${avatar.hairStyle} ${avatar.hairColor} hair, wearing a ${avatar.clothing}. Accessory: ${avatar.accessory}.`;
  
  // Build story history for context
  const history = story.pages.map((p, i) => `Page ${i + 1}: ${p.text}`).join('\n');
  
  const prompt = `You are continuing an interactive children's story (ages 4-8).
  Previous story context:
  Title: ${story.title}
  ${history}
  
  The child chose to: "${choice}"
  
  Generate ONE single page containing 1-3 sentences describing the outcome of this choice and what happens next.
  Also provide an array of 2 or 3 NEW choices for the player to make at the end of this page. If this should be the final page, leave the choices array empty or omit it.
  
  Provide an illustrationPrompt for this page, ensuring the character's visual description (${avatarDesc}) is explicitly included in the prompt, along with 'bright, colorful, 2D vector children's book illustration style'.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a creative children's book author. Your stories are engaging, safe, positive.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The paragraph to be read on this page",
          },
          illustrationPrompt: {
            type: Type.STRING,
            description: "Prompt for the AI image generator. ALWAYS include the character's visual description.",
          },
          choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 2-3 choices for the next action. Leave empty if the story ends.",
          }
        },
        required: ["text", "illustrationPrompt"],
      },
    },
  });

  try {
    const p = JSON.parse(response.text?.trim() || "{}");
    return {
      id: crypto.randomUUID(),
      text: p.text,
      illustrationPrompt: p.illustrationPrompt,
      choices: p.choices?.length > 0 ? p.choices : undefined,
    };
  } catch (error) {
    console.error("Failed to parse next page response.", error);
    throw new Error("Could not generate next page.");
  }
}
