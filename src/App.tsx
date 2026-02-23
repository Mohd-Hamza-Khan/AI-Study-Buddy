import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { VoiceQATab } from './components/VoiceQATab';
import { VisualLearningTab } from './components/VisualLearningTab';
import { SmartNotesTab } from './components/SmartNotesTab';
import { QuizMeTab } from './components/QuizMeTab';

type Tab = 'voice-qa' | 'visual' | 'notes' | 'quiz';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('voice-qa');

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>SDK Error</h2>
        <p className="error-text">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2>Loading AI Study Buddy...</h2>
        <p>Initializing on-device AI engine</p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Study Buddy</h1>
        <p className="app-subtitle">Your Private, Offline Learning Companion</p>
        {accel && <span className="badge">{accel === 'webgpu' ? 'WebGPU' : 'CPU'}</span>}
      </header>

      <nav className="tab-bar">
        <button className={activeTab === 'voice-qa' ? 'active' : ''} onClick={() => setActiveTab('voice-qa')}>
          🎙️ Voice Q&A
        </button>
        <button className={activeTab === 'visual' ? 'active' : ''} onClick={() => setActiveTab('visual')}>
          📷 Visual
        </button>
        <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>
          📝 Notes
        </button>
        <button className={activeTab === 'quiz' ? 'active' : ''} onClick={() => setActiveTab('quiz')}>
          🎯 Quiz
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'voice-qa' && <VoiceQATab />}
        {activeTab === 'visual' && <VisualLearningTab />}
        {activeTab === 'notes' && <SmartNotesTab />}
        {activeTab === 'quiz' && <QuizMeTab />}
      </main>
    </div>
  );
}
