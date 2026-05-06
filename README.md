# StoryBuddy

A magical AI-generated children's story book maker. 

## Env Configuration

Depending on the backend API requirements, configure the following secrets in your `.env` or environment variables panel:

- `SUMOPOD_API_KEY`: Required for SumoPod AI Text Generation and TTS Generation.
- `VYNAA_API_KEY`: Required for Vynaa high-quality image generation and TTS text-to-speech.
- `SUMOPOD_BASE_URL`: Optional (default `https://ai.sumopod.com/v1`)
- `SUMOPOD_TEXT_MODEL`: Optional (default `gpt-4o-mini`)
- `SUMOPOD_TTS_MODEL`: Optional (default `tts-1`)
- `SUMOPOD_TTS_VOICE`: Optional (default `alloy`)
- `GEMINI_API_KEY`: Optional fallback for Gemini LLM.

### Integrations & Server-Side Security
This app supports a flexible multi-provider architecture for text, voice, and image generation, safely proxied via the `server.ts` Express application, ensuring API keys are never exposed on the client.

- **Defaults**: By default, Sumopod is used for text responses and TTS, and Vynaa is used for TTS and Images. 
- **Settings**: In the Parent Portal, you can switch providers. The keys you inputted via environment variables are the "Owner Default API" keys and won't be revealed.

### Vynaa Image Integration & Multi-Provider 

- **Vynaa Endpoints used:** 
  1. Maker (`https://vynaa.web.id/maker/botcahx-maker/text2img`)
  2. DeepImg (`https://vynaa.web.id/ai/deepimg/deepimg`)
  3. Pollinations (`https://vynaa.web.id/pollinations/pollinations/image`)

Do not hardcode your API Key in the source code. The keys are strictly retrieved via `process.env` in the backend service (`server.ts`) keeping client-side secure.

### How to Run
```bash
npm install
npm run dev
```
