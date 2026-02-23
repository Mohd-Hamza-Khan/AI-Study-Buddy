import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { VideoCapture, VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';

const CAPTURE_DIM = 256;

interface AnalysisResult {
  text: string;
  prompt: string;
  totalMs: number;
  timestamp: Date;
}

const PRESET_PROMPTS = [
  { label: 'Explain this concept', prompt: 'Explain the concept shown in this image in simple terms.' },
  { label: 'Solve this problem', prompt: 'Walk me through how to solve this problem step by step.' },
  { label: 'Identify & define', prompt: 'Identify what this is and provide a clear definition.' },
  { label: 'Summarize this', prompt: 'Summarize the key information shown in this image.' },
];

export function VisualLearningTab() {
  const loader = useModelLoader(ModelCategory.Multimodal);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Explain the concept shown in this image in simple terms.');

  const videoMountRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<VideoCapture | null>(null);

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    if (captureRef.current?.isCapturing) return;

    setError(null);

    try {
      const cam = new VideoCapture({ facingMode: 'environment' });
      await cam.start();
      captureRef.current = cam;

      const mount = videoMountRef.current;
      if (mount) {
        const el = cam.videoElement;
        el.style.width = '100%';
        el.style.borderRadius = '12px';
        mount.appendChild(el);
      }

      setCameraActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError(
          'Camera permission denied. Please allow camera access in your browser settings.',
        );
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setError('No camera found on this device.');
      } else if (msg.includes('NotReadable') || msg.includes('TrackStartError')) {
        setError('Camera is in use by another application.');
      } else {
        setError(`Camera error: ${msg}`);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const cam = captureRef.current;
      if (cam) {
        cam.stop();
        cam.videoElement.parentNode?.removeChild(cam.videoElement);
        captureRef.current = null;
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // Core: capture + analyze
  // ------------------------------------------------------------------
  const analyzeImage = useCallback(async () => {
    const cam = captureRef.current;
    if (!cam?.isCapturing || processing) return;

    // Ensure model loaded
    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    const frame = cam.captureFrame(CAPTURE_DIM);
    if (!frame) return;

    setProcessing(true);
    setError(null);

    const t0 = performance.now();

    try {
      const bridge = VLMWorkerBridge.shared;
      if (!bridge.isModelLoaded) {
        throw new Error('VLM model not loaded in worker');
      }

      const res = await bridge.process(
        frame.rgbPixels,
        frame.width,
        frame.height,
        prompt,
        { maxTokens: 200, temperature: 0.6 },
      );

      const newResult: AnalysisResult = {
        text: res.text,
        prompt: prompt,
        totalMs: performance.now() - t0,
        timestamp: new Date(),
      };

      setResults((prev) => [newResult, ...prev]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [loader, prompt, processing]);

  const clearHistory = useCallback(() => {
    setResults([]);
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="tab-panel vision-panel">
      <div className="panel-header">
        <h2>Visual Learning</h2>
        <p>Point your camera at textbooks, diagrams, or problems to get instant explanations</p>
      </div>

      <ModelBanner
        state={loader.state}
        progress={loader.progress}
        error={loader.error}
        onLoad={loader.ensure}
        label="Vision Model"
      />

      <div className="vision-camera">
        {!cameraActive && (
          <div className="empty-state">
            <h3>Camera Preview</h3>
            <p>Start camera to analyze images</p>
          </div>
        )}
        <div ref={videoMountRef} />
      </div>

      <div className="prompt-presets">
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            className={`btn btn-sm ${prompt === preset.prompt ? 'btn-primary' : ''}`}
            onClick={() => setPrompt(preset.prompt)}
            disabled={processing}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        className="vision-prompt-textarea"
        placeholder="Or type your own question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={processing}
        rows={2}
      />

      <div className="vision-actions">
        {!cameraActive ? (
          <button className="btn btn-primary btn-lg" onClick={startCamera}>
            Start Camera
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={analyzeImage}
            disabled={processing || !prompt.trim()}
          >
            {processing ? 'Analyzing...' : 'Analyze Image'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="analysis-results">
          <div className="results-header">
            <h3>Analysis History</h3>
            <button className="btn btn-sm" onClick={clearHistory}>Clear</button>
          </div>
          <div className="results-list">
            {results.map((result, i) => (
              <div key={i} className="analysis-card">
                <div className="analysis-prompt">
                  <strong>Question:</strong> {result.prompt}
                </div>
                <div className="analysis-answer">
                  <strong>AI Explanation:</strong>
                  <p>{result.text}</p>
                </div>
                <div className="analysis-meta">
                  {result.timestamp.toLocaleTimeString()} · {(result.totalMs / 1000).toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
