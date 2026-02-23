# AI Study Buddy 📚

**Private, Offline AI Learning Companion** — A completely privacy-first educational app built with the [`@runanywhere/web`](https://www.npmjs.com/package/@runanywhere/web) SDK. All AI inference runs locally in your browser via WebAssembly. No server, no API key, 100% private.

Perfect for students who want:
- **Privacy**: All data stays in your browser — never sent to any server
- **Offline Learning**: Study anywhere without internet dependency
- **Free AI Tutor**: No subscription fees or API costs
- **Multimodal Learning**: Voice, vision, text, and interactive quizzes

## ✨ Features

### 🎙️ Voice Q&A Sessions
Ask questions out loud and get spoken explanations from your AI tutor. Perfect for:
- Quick clarifications while studying
- Hands-free learning
- Practicing pronunciation
- Natural conversation-style learning

**Tech**: Speech-to-Text (Whisper) + LLM (LFM2) + Text-to-Speech (Piper)

### 📷 Visual Learning
Point your camera at textbooks, diagrams, homework problems, or any educational material:
- Get instant explanations of concepts
- Step-by-step problem solving
- Image analysis and identification
- Diagram interpretation

**Tech**: Vision Language Model (LFM2-VL) + Camera integration

### 📝 Smart Note-Taking
Record lectures or study sessions with automatic transcription and AI summarization:
- Real-time speech transcription
- AI-generated summaries with key points
- Export notes for later review
- Voice Activity Detection for smart segmentation

**Tech**: VAD (Silero) + STT (Whisper) + LLM summarization

### 🎯 Quiz Me
Test your knowledge with AI-generated quizzes on any topic:
- Customizable difficulty (easy/medium/hard)
- Multiple choice questions with explanations
- Adaptive question generation
- Instant feedback and scoring

**Tech**: LLM with structured JSON output

## 🚀 Quick Start

```bash
npm install
npm run dev
``` 

**First-time setup**: Models will automatically download on first use (~200MB total) and are cached in your browser for instant future access.

## 💡 How It Works

```
Browser (Your Device)
  ├── WebAssembly AI Engine (llama.cpp, whisper.cpp, sherpa-onnx)
  ├── Model Storage (Origin Private File System)
  └── Zero server communication after model download
```

All AI models run **entirely in your browser**:
- **LFM2 350M**: Fast language model for chat and generation
- **LFM2-VL 450M**: Vision-language model for image understanding  
- **Whisper Tiny**: Speech-to-text transcription
- **Piper TTS**: Natural voice synthesis
- **Silero VAD**: Voice activity detection

## 📂 Project Structure

```
src/
├── App.tsx                      # Main app with tab navigation
├── runanywhere.ts               # SDK initialization + model catalog
├── components/
│   ├── VoiceQATab.tsx          # Voice Q&A with conversation history
│   ├── VisualLearningTab.tsx   # Camera + VLM analysis
│   ├── SmartNotesTab.tsx       # Recording + transcription + summarization
│   ├── QuizMeTab.tsx           # Quiz generation with structured output
│   └── ModelBanner.tsx         # Download progress UI
├── hooks/
│   └── useModelLoader.ts       # Model management hook
├── workers/
│   └── vlm-worker.ts           # VLM Web Worker
└── styles/
    └── index.css               # Educational-themed styling
```

## 🎨 Key Technologies

- **React 19** + TypeScript + Vite
- **RunAnywhere Web SDK** — On-device AI inference
- **llama.cpp** (WASM) — LLM/VLM inference engine
- **sherpa-onnx** (WASM) — STT/TTS/VAD inference
- **Web Workers** — VLM processing off main thread
- **OPFS** — Persistent model caching

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm run build
npx vercel --prod
```

The included `vercel.json` configures required Cross-Origin-Isolation headers.

### Netlify

Add a `_headers` file:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
```

### Custom Hosting

Serve the `dist/` folder with these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

## 📱 Browser Support

- Chrome 96+ or Edge 96+ (Chrome 120+ recommended)
- WebAssembly support (required)
- SharedArrayBuffer (requires COOP/COEP headers)
- OPFS for persistent storage
- Camera access for Visual Learning
- Microphone access for Voice features

## 🔧 Customization

### Add Custom Models

Edit `src/runanywhere.ts`:

```typescript
const MODELS: CompactModelDef[] = [
  {
    id: 'my-model',
    name: 'Custom Model',
    repo: 'username/model-repo',
    files: ['model.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 500_000_000,
  },
  // ... existing models
];
```

### Customize System Prompts

Each feature has tunable system prompts:
- **Voice Q&A**: `src/components/VoiceQATab.tsx:118-125`
- **Quiz Generation**: `src/components/QuizMeTab.tsx:94`
- **Note Summarization**: `src/components/SmartNotesTab.tsx:127`

## 🎯 Use Cases

### For Students
- Get instant help with homework
- Study for exams with AI-generated quizzes
- Take better notes in lectures
- Learn complex concepts through visual explanations

### For Self-Learners
- Privacy-first learning environment
- No subscription fees or API costs
- Works offline after initial model download
- Multimodal learning approaches

### For Privacy-Conscious Users
- All processing happens locally
- No data leaves your device
- No accounts or sign-ups required
- Works completely offline

## 📚 Documentation

- [RunAnywhere SDK Docs](https://docs.runanywhere.ai)
- [Web SDK API](https://docs.runanywhere.ai/web/introduction)
- [npm Package](https://www.npmjs.com/package/@runanywhere/web)
- [GitHub](https://github.com/RunanywhereAI/runanywhere-sdks)

## 🤝 Contributing

Built for the VibeSingularity Hackathon. Feel free to fork and extend!

## 📄 License

MIT

---

**Built with RunAnywhere Web SDK** — Bringing powerful AI to every browser, privately and securely.
