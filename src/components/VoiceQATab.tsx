import { useState, useRef, useCallback, useEffect } from 'react';
import { VoicePipeline, ModelCategory, ModelManager } from '@runanywhere/web';
import { AudioCapture, AudioPlayback, VAD, SpeechActivity } from '@runanywhere/web-onnx';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';

type VoiceState = 'idle' | 'loading-models' | 'listening' | 'processing' | 'speaking';

interface ConversationTurn {
  question: string;
  answer: string;
  timestamp: Date;
}

export function VoiceQATab() {
  const llmLoader = useModelLoader(ModelCategory.Language, true);
  const sttLoader = useModelLoader(ModelCategory.SpeechRecognition, true);
  const ttsLoader = useModelLoader(ModelCategory.SpeechSynthesis, true);
  const vadLoader = useModelLoader(ModelCategory.Audio, true);

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const micRef = useRef<AudioCapture | null>(null);
  const pipelineRef = useRef<VoicePipeline | null>(null);
  const vadUnsub = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micRef.current?.stop();
      vadUnsub.current?.();
    };
  }, []);

  // Ensure all 4 models are loaded
  const ensureModels = useCallback(async (): Promise<boolean> => {
    setVoiceState('loading-models');
    setError(null);

    const results = await Promise.all([
      vadLoader.ensure(),
      sttLoader.ensure(),
      llmLoader.ensure(),
      ttsLoader.ensure(),
    ]);

    if (results.every(Boolean)) {
      setVoiceState('idle');
      return true;
    }

    setError('Failed to load one or more voice models');
    setVoiceState('idle');
    return false;
  }, [vadLoader, sttLoader, llmLoader, ttsLoader]);

  // Start listening for student questions
  const startListening = useCallback(async () => {
    setCurrentQuestion('');
    setCurrentAnswer('');
    setError(null);

    // Load models if needed
    const anyMissing = !ModelManager.getLoadedModel(ModelCategory.Audio)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      || !ModelManager.getLoadedModel(ModelCategory.Language)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechSynthesis);

    if (anyMissing) {
      const ok = await ensureModels();
      if (!ok) return;
    }

    setVoiceState('listening');

    const mic = new AudioCapture({ sampleRate: 16000 });
    micRef.current = mic;

    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline();
    }

    // Start VAD + mic
    VAD.reset();

    vadUnsub.current = VAD.onSpeechActivity((activity) => {
      if (activity === SpeechActivity.Ended) {
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples.length > 1600) {
          processSpeech(segment.samples);
        }
      }
    });

    await mic.start(
      (chunk) => { VAD.processSamples(chunk); },
      (level) => { setAudioLevel(level); },
    );
  }, [ensureModels]);

  // Process student question through the educational Q&A pipeline
  const processSpeech = useCallback(async (audioData: Float32Array) => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;

    // Stop mic during processing
    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('processing');

    try {
      const result = await pipeline.processTurn(audioData, {
        maxTokens: 256,
        temperature: 0.7,
        systemPrompt: `You are an expert tutor helping students learn. Your role is to:
- Provide clear, accurate explanations
- Break down complex topics into simple steps
- Use examples and analogies to aid understanding
- Encourage critical thinking
- Keep answers concise but thorough (2-4 sentences)
- If you don't know something, suggest how to research it`,
      }, {
        onTranscription: (text) => {
          setCurrentQuestion(text);
        },
        onResponseToken: (_token, accumulated) => {
          setCurrentAnswer(accumulated);
        },
        onResponseComplete: (text) => {
          setCurrentAnswer(text);
        },
        onSynthesisComplete: async (audio, sampleRate) => {
          setVoiceState('speaking');
          const player = new AudioPlayback({ sampleRate });
          await player.play(audio, sampleRate);
          player.dispose();
        },
        onStateChange: (s) => {
          if (s === 'processingSTT') setVoiceState('processing');
          if (s === 'generatingResponse') setVoiceState('processing');
          if (s === 'playingTTS') setVoiceState('speaking');
        },
      });

      if (result) {
        setCurrentQuestion(result.transcription);
        setCurrentAnswer(result.response);
        
        // Add to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            question: result.transcription,
            answer: result.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

  const stopListening = useCallback(() => {
    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setCurrentQuestion('');
    setCurrentAnswer('');
  }, []);

  // Which loaders are still loading?
  const pendingLoaders = [
    { label: 'VAD', loader: vadLoader },
    { label: 'STT', loader: sttLoader },
    { label: 'LLM', loader: llmLoader },
    { label: 'TTS', loader: ttsLoader },
  ].filter((l) => l.loader.state !== 'ready');

  return (
    <div className="tab-panel voice-panel">
      <div className="panel-header">
        <h2>Voice Q&A Session</h2>
        <p>Ask questions out loud and get spoken explanations</p>
      </div>

      {pendingLoaders.length > 0 && voiceState === 'idle' && (
        <ModelBanner
          state={pendingLoaders[0].loader.state}
          progress={pendingLoaders[0].loader.progress}
          error={pendingLoaders[0].loader.error}
          onLoad={ensureModels}
          label={`Voice Models (${pendingLoaders.map((l) => l.label).join(', ')})`}
        />
      )}

      {error && <div className="model-banner"><span className="error-text">{error}</span></div>}

      <div className="voice-center">
        <div className="voice-orb" data-state={voiceState} style={{ '--level': audioLevel } as React.CSSProperties}>
          <div className="voice-orb-inner" />
        </div>

        <p className="voice-status">
          {voiceState === 'idle' && 'Tap to ask a question'}
          {voiceState === 'loading-models' && 'Loading AI models...'}
          {voiceState === 'listening' && 'Listening... ask your question'}
          {voiceState === 'processing' && 'Thinking...'}
          {voiceState === 'speaking' && 'Speaking answer...'}
        </p>

        {voiceState === 'idle' || voiceState === 'loading-models' ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={startListening}
            disabled={voiceState === 'loading-models'}
          >
            Ask a Question
          </button>
        ) : voiceState === 'listening' ? (
          <button className="btn btn-lg" onClick={stopListening}>
            Cancel
          </button>
        ) : null}
      </div>

      {currentQuestion && (
        <div className="voice-transcript">
          <h4>Your Question:</h4>
          <p>{currentQuestion}</p>
        </div>
      )}

      {currentAnswer && (
        <div className="voice-response">
          <h4>AI Tutor Answer:</h4>
          <p>{currentAnswer}</p>
        </div>
      )}

      {conversationHistory.length > 0 && (
        <div className="conversation-history">
          <div className="history-header">
            <h3>Session History</h3>
            <button className="btn btn-sm" onClick={clearHistory}>Clear</button>
          </div>
          <div className="history-list">
            {conversationHistory.map((turn, i) => (
              <div key={i} className="history-turn">
                <div className="history-question">
                  <strong>Q:</strong> {turn.question}
                </div>
                <div className="history-answer">
                  <strong>A:</strong> {turn.answer}
                </div>
                <div className="history-time">
                  {turn.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
