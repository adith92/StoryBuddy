import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // internal API for Vynaa image generation
  app.post("/api/vynaa/generate-image", async (req, res) => {
    try {
      const { prompt, mode } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const apiKey = process.env.VYNAA_API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "VYNAA_API_KEY belum diset." });
      }

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

      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = `Vynaa API returned status ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          const parsedError = errorData?.error || errorData?.message || errorData?.detail || JSON.stringify(errorData);
          errorMessage = `Vynaa API Error: ${parsedError}`;
        } catch {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = `Vynaa API Error: ${errorText}`;
          } catch {}
        }
        return res.status(response.status).json({ error: errorMessage });
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.startsWith("image/")) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.json({ url: `data:${contentType};base64,${base64}` });
      }

      try {
        const data = await response.json();
        
        // Handle 200 OK responses that represent errors
        if (data?.success === false || data?.status === false) {
          const errMsg = data?.message || data?.error || JSON.stringify(data);
          return res.status(400).json({ error: `Vynaa API Error: ${errMsg}` });
        }

        // Find image URL from common JSON response structures
        const imageUrl = data?.data || data?.result || data?.url || data?.image || data?.imageUrl || data?.output;
        
        if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
           try {
             // Fetch the image on the server to prevent CORS issues on the frontend
             const imgResponse = await fetch(imageUrl);
             if (imgResponse.ok) {
               const imgBuffer = await imgResponse.arrayBuffer();
               const imgBase64 = Buffer.from(imgBuffer).toString("base64");
               const imgType = imgResponse.headers.get("content-type") || "image/jpeg";
               return res.json({ url: `data:${imgType};base64,${imgBase64}` });
             } else {
                 // if fails to fetch, just return the url as fallback
                 return res.json({ url: imageUrl });
             }
           } catch (fetchErr) {
             console.error("Vynaa image fetch proxy error:", fetchErr);
             return res.json({ url: imageUrl });
           }
        } else if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
           return res.json({ url: imageUrl });
        }
        
        return res.json({ rawData: data, warning: "Could not automatically resolve image URL from JSON response." });
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse JSON response from Vynaa." });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Something went wrong." });
    }
  });

  // Vynaa test API
  app.get("/api/vynaa/test", async (req, res) => {
    const apiKey = process.env.VYNAA_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error: "VYNAA_API_KEY belum diset di environment / settings.",
      });
    }

    try {
      // Just a quick check
      return res.status(200).json({
        success: true,
        provider: "Vynaa",
        baseUrl: "https://vynaa.web.id",
        apiKeyConfigured: true
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
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
