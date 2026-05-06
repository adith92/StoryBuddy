import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

function getSumoPodBase() {
  let base = process.env.SUMOPOD_BASE_URL || "https://ai.sumopod.com";
  base = base.replace(/\/+$/, "");
  if (!base.endsWith("/v1")) {
    base += "/v1";
  }
  return base;
}

function getOwnerSumoPodKey() {
  return process.env.SUMOPOD_API_KEY || "";
}

function getOwnerVynaaKey() {
  return process.env.VYNAA_API_KEY || "";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function extractImageUrl(data: any): string | null {
  if (!data) return null;
  if (typeof data === "string") {
    if (data.startsWith("http") || data.startsWith("data:")) return data;
    return null;
  }
  if (typeof data !== "object") return null;

  const directKeys = ["url", "image", "imageUrl", "output", "result", "data"];
  for (const key of directKeys) {
    if (data[key]) {
      const val = data[key];
      if (typeof val === "string" && (val.startsWith("http") || val.startsWith("data:"))) {
        return val;
      }
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string" && (val[0].startsWith("http") || val[0].startsWith("data:"))) {
        return val[0];
      }
      if (Array.isArray(val) && val.length > 0 && val[0].url && typeof val[0].url === "string") {
        return val[0].url;
      }
    }
  }

  // Recursive search
  for (const key in data) {
    if (typeof data[key] === "object") {
      const found = extractImageUrl(data[key]);
      if (found) return found;
    }
  }

  return null;
}

import { GoogleGenAI, Type } from "@google/genai";

const geminiAi = () => {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GoogleGenAI({ apiKey: key }) : null;
};

export async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      sumopodConfigured: !!getOwnerSumoPodKey(),
      vynaaConfigured: !!getOwnerVynaaKey(),
      geminiConfigured: !!process.env.GEMINI_API_KEY
    });
  });

  app.get("/api/provider/status", (req, res) => {
    res.json({
      textProvider: "sumopod",
      imageProvider: "vynaa",
      voiceProvider: "vynaa",
      sumopodConfigured: !!getOwnerSumoPodKey(),
      vynaaConfigured: !!getOwnerVynaaKey(),
      geminiConfigured: !!process.env.GEMINI_API_KEY
    });
  });

  // SUMOPOD API ROUTES
  app.get("/api/sumopod/test", async (req, res) => {
    const apiKey = getOwnerSumoPodKey();
    if (!apiKey) {
      return res.status(200).json({ success: false, error: "SUMOPOD_API_KEY not configured" });
    }
    const baseUrl = getSumoPodBase();
    const start = Date.now();
    try {
      const resp = await fetch(`${baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const latencyMs = Date.now() - start;
      if (resp.ok) {
        return res.json({ success: true, latencyMs });
      }
      const errText = await resp.text();
      return res.status(200).json({ success: false, latencyMs, error: `Error ${resp.status}: ${errText.slice(0, 100)}` });
    } catch (e: any) {
      return res.status(200).json({ success: false, error: e.message });
    }
  });

  app.post("/api/sumopod/chat", async (req, res) => {
    const apiKey = getOwnerSumoPodKey();
    if (!apiKey) return res.status(401).json({ error: "SUMOPOD_API_KEY not configured" });

    const baseUrl = getSumoPodBase();
    const model = req.body.model || process.env.SUMOPOD_TEXT_MODEL || "gpt-4o-mini";
    
    try {
      if (!req.body.messages || req.body.messages.length === 0) {
        return res.status(400).json({ error: "Messages cannot be empty" });
      }
      
      const payload: any = {
        model,
        messages: req.body.messages,
      };
      if (req.body.response_format) {
        payload.response_format = req.body.response_format;
      }
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `SumoPod Error: ${errorText.slice(0, 100)}` });
      }
      
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";
      return res.json({ content, raw: data });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Something went wrong in /api/sumopod/chat" });
    }
  });

  app.post("/api/sumopod/tts", async (req, res) => {
    const apiKey = getOwnerSumoPodKey();
    if (!apiKey) return res.status(401).json({ error: "SUMOPOD_API_KEY not configured" });

    const baseUrl = getSumoPodBase();
    const model = req.body.model || process.env.SUMOPOD_TTS_MODEL || "tts-1";
    const voice = req.body.voice || process.env.SUMOPOD_TTS_VOICE || "alloy";
    
    try {
      if (!req.body.text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await fetch(`${baseUrl}/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          voice,
          input: req.body.text
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `SumoPod TTS Error: ${errorText.slice(0, 100)}` });
      }
      
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = response.headers.get("content-type") || "audio/mpeg";
      return res.json({ audio: `data:${contentType};base64,${base64}` });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed in /api/sumopod/tts" });
    }
  });

  // GEMINI API ROUTES
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const ai = geminiAi();
      if (!ai) return res.status(401).json({ error: "GEMINI_API_KEY not configured" });
      
      const { prompt, systemInstruction, responseSchema } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required." });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: responseSchema ? "application/json" : "text/plain",
          systemInstruction,
          responseSchema: responseSchema as any
        }
      });
      return res.json({ content: response.text });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed in /api/gemini/chat" });
    }
  });

  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const ai = geminiAi();
      if (!ai) return res.status(401).json({ error: "GEMINI_API_KEY not configured" });

      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required." });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}` });
        }
      }
      return res.status(400).json({ error: "No image generated." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed in /api/gemini/generate-image" });
    }
  });

  app.post("/api/gemini/cartoonify", async (req, res) => {
    try {
      const ai = geminiAi();
      if (!ai) return res.status(401).json({ error: "GEMINI_API_KEY not configured" });

      const { fileData, mimeType } = req.body;
      if (!fileData) return res.status(400).json({ error: "fileData is required." });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: fileData, mimeType: mimeType || 'image/jpeg' } },
            { text: 'Turn this photo into a cute, bright, colorful 2D vector cartoon avatar suitable for a children\'s book main character. White background.' }
          ]
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}` });
        }
      }
      return res.status(400).json({ error: "No image generated." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed in /api/gemini/cartoonify" });
    }
  });

  // VYNAA API ROUTES
  app.get("/api/vynaa/test", async (req, res) => {
    const apiKey = getOwnerVynaaKey();
    if (!apiKey) return res.status(200).json({ success: false, error: "VYNAA_API_KEY not configured" });

    const mode = req.query.mode || "maker";
    let url = "";
    if (mode === "maker") url = `https://vynaa.web.id/maker/botcahx-maker/text2img?apikey=${apiKey}&text=test`;
    else if (mode === "deepimg") url = `https://vynaa.web.id/ai/deepimg/deepimg?apikey=${apiKey}&prompt=test`;
    else if (mode === "pollinations") url = `https://vynaa.web.id/pollinations/pollinations/image?apikey=${apiKey}&prompt=test`;
    else return res.status(200).json({ success: false, error: "Invalid mode" });

    const start = Date.now();
    try {
      const resp = await fetch(url);
      const latencyMs = Date.now() - start;
      if (resp.ok) {
        return res.json({ success: true, mode, latencyMs });
      }
      const errText = await resp.text();
      return res.status(200).json({ success: false, mode, latencyMs, error: `Error ${resp.status}: ${errText.slice(0, 100)}` });
    } catch (e: any) {
      return res.status(200).json({ success: false, error: e.message });
    }
  });

  app.post("/api/vynaa/generate-image", async (req, res) => {
    const apiKey = getOwnerVynaaKey();
    if (!apiKey) return res.status(401).json({ error: "VYNAA_API_KEY not configured" });

    const { prompt, mode } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    const generationMode = mode || "maker";
    let url = "";

    if (generationMode === "maker") {
      url = `https://vynaa.web.id/maker/botcahx-maker/text2img?apikey=${apiKey}&text=${encodeURIComponent(prompt)}`;
    } else if (generationMode === "deepimg") {
      url = `https://vynaa.web.id/ai/deepimg/deepimg?apikey=${apiKey}&prompt=${encodeURIComponent(prompt)}`;
    } else if (generationMode === "pollinations") {
      url = `https://vynaa.web.id/pollinations/pollinations/image?apikey=${apiKey}&prompt=${encodeURIComponent(prompt)}`;
    } else {
      return res.status(400).json({ error: "Invalid mode." });
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `Vynaa API returned ${response.status} ${response.statusText}`;
        const errText = await response.text();
        if (errText) errorMessage += ` - ${errText.slice(0, 100)}`;
        return res.status(response.status).json({ error: errorMessage });
      }

      const contentType = response.headers.get("content-type");

      // Direct image response
      if (contentType && contentType.startsWith("image/")) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.json({ url: `data:${contentType};base64,${base64}` });
      }

      // JSON response
      const responseText = await response.text();
      const data = safeJsonParse(responseText);
      
      if (!data) {
        return res.status(500).json({ error: `Failed to parse Vynaa JSON. Raw: ${responseText.slice(0, 100)}` });
      }

      if (data?.success === false || data?.status === false) {
        return res.status(400).json({ error: `Vynaa Error: ${JSON.stringify(data).slice(0, 100)}` });
      }

      const imageUrl = extractImageUrl(data);

      if (imageUrl && imageUrl.startsWith("http")) {
        try {
          const imgResponse = await fetch(imageUrl);
          if (imgResponse.ok) {
            const imgBuffer = await imgResponse.arrayBuffer();
            const imgBase64 = Buffer.from(imgBuffer).toString("base64");
            const imgType = imgResponse.headers.get("content-type") || "image/jpeg";
            return res.json({ url: `data:${imgType};base64,${imgBase64}` });
          }
          return res.json({ url: imageUrl }); // fallback
        } catch (fetchErr) {
          return res.json({ url: imageUrl }); // fallback
        }
      } else if (imageUrl && imageUrl.startsWith("data:")) {
        return res.json({ url: imageUrl });
      }

      return res.json({ rawData: data, warning: "Could not automatically resolve image URL" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed in /api/vynaa/generate-image" });
    }
  });

  app.post("/api/vynaa/tts", async (req, res) => {
    try {
      const { text, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required." });
      }

      const apiKey = getOwnerVynaaKey();
      if (!apiKey) {
        return res.status(401).json({ error: "VYNAA_API_KEY belum diset." });
      }

      const vid = voiceId || "aura-asteria-en";
      const url = `https://vynaa.web.id/ai/elevenlabs/elevenlabs?apikey=${apiKey}&text=${encodeURIComponent(text)}&voice_id=${vid}`;
      
      const response = await fetch(url);
      if (!response.ok) {
         return res.status(response.status).json({ error: `Vynaa TTS API Error: ${response.statusText}` });
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.startsWith("audio/")) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.json({ audio: `data:${contentType};base64,${base64}` });
      }
      
      const dataText = await response.text();
      const data = safeJsonParse(dataText);
      if (!data) {
        return res.status(500).json({ error: `Invalid TTS response: ${dataText.slice(0, 100)}` });
      }

      const audioUrl = extractImageUrl(data); // also extracts generic URL fields
      if (audioUrl && audioUrl.startsWith("http")) {
        try {
          const audRes = await fetch(audioUrl);
          if (audRes.ok) {
             const audType = audRes.headers.get("content-type") || "audio/mpeg";
             const audBuf = await audRes.arrayBuffer();
             const fileBase64 = Buffer.from(audBuf).toString("base64");
             return res.json({ audio: `data:${audType};base64,${fileBase64}` });
          }
        } catch (e) {}
        return res.json({ audio: audioUrl });
      }
      
      return res.status(500).json({ error: `Failed to synthesize speech. Raw: ${JSON.stringify(data).slice(0, 100)}` });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed to generate TTS" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
