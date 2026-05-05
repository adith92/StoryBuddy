# StoryBuddy

A magical AI-generated children's story book maker. 

## Env Configuration

depending on the backend API requirements, configure the following secrets in your environment variables/secrets panel:

- `GEMINI_API_KEY`: Required for Gemini LLM and standard Gemini generation.
- `VYNAA_API_KEY`: Required for Vynaa high-quality image generation.

### Vynaa Image Integration & Multi-Provider 
This app supports a flexible multi-provider architecture for image generation.

- **Multi-Provider Selector:** In the Parent Portal settings, you can seamlessly switch between "Vynaa AI" and "Google Gemini". Vynaa AI is set as the **default** provider for standard illustration generation.
- **Vynaa Endpoints used:** 
  1. Maker (`https://vynaa.web.id/maker/botcahx-maker/text2img`)
  2. DeepImg (`https://vynaa.web.id/ai/deepimg/deepimg`)
  3. Pollinations (`https://vynaa.web.id/pollinations/pollinations/image`)
- **How to test the integration:** 
  Visit the "Parent Portal" -> "Settings", scroll down to "Image Provider". Select "Vynaa AI" and choose your desired mode (e.g. Maker). Click on the "Cek API Vynaa" button to invoke the internal `/api/vynaa/test` endpoint ensuring your keys are correct.
- **Setting the Secret (`VYNAA_API_KEY`):**
  Do not hardcode your API Key in the source code. Use the "Secrets" panel in Google AI Studio or set the `VYNAA_API_KEY` environment variable in your deployment environment. 
  The key is strictly retrieved via `process.env.VYNAA_API_KEY` in the backend service (`server.ts`) keeping client-side secure. None of the keys are sent to the client browser.

### How to Run
```bash
npm install
npm run dev
```
