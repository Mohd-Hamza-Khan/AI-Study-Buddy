import { useState, useRef, useCallback, useEffect } from 'react';
import { ModelCategory, ModelManager } from '@runanywhere/web';
import { AudioCapture, VAD, SpeechActivity, STT } from '@runanywhere/web-onnx';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';

type RecordingState = 'idle' | 'loading-models' | 'recording' | 'summarizing';

interface Note {
  transcript: string;
  summary: string;
  timestamp: Date;
}

export function SmartNotesTab() {
  const sttLoader = useModelLoader(ModelCategory.SpeechRecognition, true);
  const vadLoader = useModelLoader(ModelCategory.Audio, true);
  const llmLoader = useModelLoader(ModelCategory.Language, true);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  const micRef = useRef<AudioCapture | null>(null);
  const vadUnsub = useRef<(() => void) | null>(null);
  const transcriptBuffer = useRef<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micRef.current?.stop();
      vadUnsub.current?.();
    };
  }, []);

  // Ensure models are loaded
  const ensureModels = useCallback(async (): Promise<boolean> => {
    setRecordingState('loading-models');
    setError(null);

    const results = await Promise.all([
      vadLoader.ensure(),
      sttLoader.ensure(),
      llmLoader.ensure(),
    ]);

    if (results.every(Boolean)) {
      setRecordingState('idle');
      return true;
    }

    setError('Failed to load one or more models');
    setRecordingState('idle');
    return false;
  }, [vadLoader, sttLoader, llmLoader]);

  // Start recording
  const startRecording = useCallback(async () => {
    setCurrentTranscript('');
    transcriptBuffer.current = [];
    setError(null);

    // Load models if needed
    const anyMissing = !ModelManager.getLoadedModel(ModelCategory.Audio)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      || !ModelManager.getLoadedModel(ModelCategory.Language);

    if (anyMissing) {
      const ok = await ensureModels();
      if (!ok) return;
    }

    setRecordingState('recording');

    const mic = new AudioCapture({ sampleRate: 16000 });
    micRef.current = mic;

    // Start VAD + mic
    VAD.reset();

    vadUnsub.current = VAD.onSpeechActivity((activity) => {
      if (activity === SpeechActivity.Ended) {
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples.length > 1600) {
          transcribeSegment(segment.samples);
        }
      }
    });

    await mic.start(
      (chunk) => { VAD.processSamples(chunk); },
      (level) => { setAudioLevel(level); },
    );
  }, [ensureModels]);

  // Transcribe a speech segment
  const transcribeSegment = useCallback(async (audioData: Float32Array) => {
    try {
      const result = await STT.transcribe(audioData);
      if (result.text.trim()) {
        transcriptBuffer.current.push(result.text);
        setCurrentTranscript((prev) => {
          const newText = prev + (prev ? ' ' : '') + result.text;
          return newText;
        });
      }
    } catch (err) {
      console.error('Transcription error:', err);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    micRef.current?.stop();
    vadUnsub.current?.();
    setRecordingState('idle');
    setAudioLevel(0);
  }, []);

  // Summarize and save notes
  const saveNotes = useCallback(async () => {
    if (!currentTranscript.trim()) {
      setError('No transcript to summarize');
      return;
    }

    stopRecording();
    setRecordingState('summarizing');

    try {
      // Ensure LLM is loaded
      if (!ModelManager.getLoadedModel(ModelCategory.Language)) {
        await llmLoader.ensure();
      }

      const result = await TextGeneration.generate(
        `Summarize the following lecture notes or study session into key points. Use bullet points for clarity:\n\n${currentTranscript}`,
        {
          maxTokens: 300,
          temperature: 0.5,
          systemPrompt: 'You are a note-taking assistant. Create clear, organized summaries of study material.',
        },
      );

      const newNote: Note = {
        transcript: currentTranscript,
        summary: result.text,
        timestamp: new Date(),
      };

      setNotes((prev) => [newNote, ...prev]);
      setCurrentTranscript('');
      transcriptBuffer.current = [];
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRecordingState('idle');
    }
  }, [currentTranscript, stopRecording, llmLoader]);

  const clearCurrentTranscript = useCallback(() => {
    setCurrentTranscript('');
    transcriptBuffer.current = [];
  }, []);

  const deleteNote = useCallback((index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const exportNotes = useCallback(() => {
    const text = notes.map((note, i) => {
      return `\n--- Note ${i + 1} (${note.timestamp.toLocaleString()}) ---\n\nTranscript:\n${note.transcript}\n\nSummary:\n${note.summary}\n`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-notes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  // Which loaders are still loading?
  const pendingLoaders = [
    { label: 'VAD', loader: vadLoader },
    { label: 'STT', loader: sttLoader },
    { label: 'LLM', loader: llmLoader },
  ].filter((l) => l.loader.state !== 'ready');

  return (
    <div className="tab-panel notes-panel">
      <div className="panel-header">
        <h2>Smart Note-Taking</h2>
        <p>Record lectures or study sessions with automatic transcription and AI summarization</p>
      </div>

      {pendingLoaders.length > 0 && recordingState === 'idle' && (
        <ModelBanner
          state={pendingLoaders[0].loader.state}
          progress={pendingLoaders[0].loader.progress}
          error={pendingLoaders[0].loader.error}
          onLoad={ensureModels}
          label={`Models (${pendingLoaders.map((l) => l.label).join(', ')})`}
        />
      )}

      {error && <div className="error-banner"><span className="error-text">{error}</span></div>}

      <div className="recording-area">
        <div className="recording-indicator" data-state={recordingState}>
          {recordingState === 'recording' && (
            <div className="audio-level-bar" style={{ '--level': audioLevel } as React.CSSProperties}>
              <div className="audio-level-fill" />
            </div>
          )}
          <p className="recording-status">
            {recordingState === 'idle' && 'Ready to record'}
            {recordingState === 'loading-models' && 'Loading models...'}
            {recordingState === 'recording' && 'Recording... speak naturally'}
            {recordingState === 'summarizing' && 'Generating summary...'}
          </p>
        </div>

        <div className="recording-controls">
          {recordingState === 'idle' || recordingState === 'loading-models' ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={startRecording}
              disabled={recordingState === 'loading-models'}
            >
              Start Recording
            </button>
          ) : recordingState === 'recording' ? (
            <>
              <button className="btn btn-lg" onClick={stopRecording}>
                Stop Recording
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={saveNotes}
                disabled={!currentTranscript.trim()}
              >
                Save & Summarize
              </button>
            </>
          ) : null}
        </div>

        {currentTranscript && (
          <div className="current-transcript">
            <div className="transcript-header">
              <h4>Live Transcript</h4>
              <button className="btn btn-sm" onClick={clearCurrentTranscript}>Clear</button>
            </div>
            <p>{currentTranscript}</p>
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="notes-list">
          <div className="notes-header">
            <h3>Saved Notes ({notes.length})</h3>
            <button className="btn btn-sm btn-primary" onClick={exportNotes}>
              Export All
            </button>
          </div>
          {notes.map((note, i) => (
            <div key={i} className="note-card">
              <div className="note-header">
                <span className="note-time">{note.timestamp.toLocaleString()}</span>
                <button className="btn btn-sm" onClick={() => deleteNote(i)}>Delete</button>
              </div>
              <div className="note-section">
                <h5>Summary:</h5>
                <p>{note.summary}</p>
              </div>
              <details className="note-transcript">
                <summary>View full transcript</summary>
                <p>{note.transcript}</p>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
