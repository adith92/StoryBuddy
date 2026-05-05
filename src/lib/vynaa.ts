import { useAppStore } from "../store";

export async function generateImageWithVynaa(prompt: string, mode: "maker" | "deepimg" | "pollinations" = "maker", seed?: string): Promise<string> {
  const tryGenerate = async (currentMode: string) => {
    const finalPrompt = seed ? `${prompt} Bright, colorful, 2D vector children's book illustration style. Seed: ${seed}` : `${prompt} Bright, colorful, 2D vector children's book illustration style.`;
    const response = await fetch("/api/vynaa/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        mode: currentMode
      })
    });

    if (!response.ok) {
      let errorMsg = await response.text();
      try {
        const errorJson = JSON.parse(errorMsg);
        if (errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch (e) {}
      throw new Error(`Vynaa Image API error: ${errorMsg}`);
    }

    const data = await response.json();
    if (data.url) {
      return data.url;
    } else if (data.rawData) {
      console.warn("Vynaa API returned JSON but couldn't parse image automatically. Raw:", data.rawData);
      throw new Error(`Could not parse image URL from Vynaa JSON (Mode: ${currentMode}). Raw: ${JSON.stringify(data.rawData)}`);
    }
    
    throw new Error(`No image generated from Vynaa backend API (Mode: ${currentMode}).`);
  };

  try {
    return await tryGenerate(mode);
  } catch (err: any) {
    if (mode === "maker") {
      console.warn("Vynaa maker failed, falling back to deepimg...", err);
      return await tryGenerate("deepimg");
    }
    throw err;
  }
}
