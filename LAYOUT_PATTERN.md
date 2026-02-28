# 🏗️ REUSABLE LAYOUT PATTERN FOR ALL 4 MODULES

## Universal Layout Architecture for AI Study Buddy

This pattern ensures consistency across **Voice Q&A**, **Visual Learning**, **Notes**, and **Quiz** modules.

---

## 🎯 Core Principles

1. **Consistent Spacing**: Use 4px base scale (--space-1 through --space-12)
2. **Sectional Hierarchy**: Clear visual separation between functional sections
3. **Layout Shift Prevention**: Fixed aspect ratios for dynamic content
4. **Responsive First**: Mobile → Tablet → Desktop progression
5. **Accessibility**: ARIA labels, keyboard navigation, reduced motion support

---

## 📐 Standard Layout Structure

```tsx
<div className="tab-panel {module}-panel">
  {/* SECTION 1: Header */}
  <div className="panel-header">
    <h2>{Module Title}</h2>
    <p>{Description}</p>
  </div>

  {/* SECTION 2: Model Status (Shared Component) */}
  <ModelBanner
    state={loader.state}
    progress={loader.progress}
    error={loader.error}
    onLoad={loader.ensure}
    label="{Model Name}"
  />

  {/* SECTION 3: Primary Interaction Area */}
  <div className="{module}-primary-container">
    {/* Main UI (camera, mic, textarea, etc.) */}
  </div>

  {/* SECTION 4: Controls */}
  <div className="{module}-controls">
    {/* Buttons, inputs, presets */}
  </div>

  {/* SECTION 5: Error Display (Conditional) */}
  {error && (
    <div className="error-banner">
      <svg className="error-icon">{/* Icon */}</svg>
      <span className="error-text">{error}</span>
    </div>
  )}

  {/* SECTION 6: Results/History (Conditional) */}
  {hasResults && (
    <div className="{module}-results-section">
      <div className="section-divider" />
      <div className="results-header">
        <h3>{Results Title}</h3>
        <button className="btn btn-sm btn-ghost" onClick={clearResults}>
          Clear All
        </button>
      </div>
      <div className="results-list">
        {/* Result cards */}
      </div>
    </div>
  )}
</div>
```

---

## 🎨 Spacing Guidelines

### Vertical Rhythm (gap between sections)
```css
.tab-panel {
  gap: var(--space-6); /* 24px — Primary section spacing */
}

.{module}-controls {
  gap: var(--space-4); /* 16px — Control group spacing */
}

.results-list {
  gap: var(--space-3); /* 12px — Card spacing */
}
```

### Container Padding
```css
/* Panel padding */
padding: var(--space-4); /* 16px — Desktop/Tablet */
padding: var(--space-3); /* 12px — Mobile */

/* Card padding */
padding: var(--space-4); /* 16px — Comfortable click target */

/* Input padding */
padding: var(--space-3) var(--space-3); /* 12px — Balanced for text */
```

---

## 🔧 Module-Specific Adaptations

### 1. Voice Q&A Module

```tsx
<div className="tab-panel voice-panel">
  {/* Header */}
  <div className="panel-header">
    <h2>Voice Q&A</h2>
    <p>Ask questions using your voice and get instant audio responses</p>
  </div>

  {/* Model Banner */}
  <ModelBanner {...loaderProps} label="Speech Models" />

  {/* Primary: Audio Visualizer */}
  <div className="voice-visualizer-container">
    {/* Fixed aspect ratio: 16:9 or 2:1 */}
    <div className="voice-visualizer">
      {/* Waveform/spectrum visualization */}
    </div>
  </div>

  {/* Controls */}
  <div className="voice-controls">
    <button className="btn btn-primary btn-lg">
      {isListening ? 'Stop Listening' : 'Start Listening'}
    </button>
  </div>

  {/* Conversation History */}
  <div className="conversation-section">
    <div className="section-divider" />
    <div className="results-header">
      <h3>Conversation</h3>
      <button className="btn btn-sm btn-ghost" onClick={clearHistory}>
        Clear All
      </button>
    </div>
    <div className="conversation-list">
      {/* Message bubbles */}
    </div>
  </div>
</div>
```

**Key Styles:**
```css
.voice-visualizer-container {
  aspect-ratio: 16 / 9;
  min-height: 200px;
}

.voice-visualizer {
  width: 100%;
  height: 100%;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.message-bubble {
  padding: var(--space-3);
  background: var(--bg-card);
  border-radius: var(--radius);
  max-width: 85%;
}

.message-bubble.user {
  align-self: flex-end;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid var(--primary);
}

.message-bubble.assistant {
  align-self: flex-start;
}
```

---

### 2. Visual Learning Module

**Already implemented above** ✅

Key features:
- Fixed aspect ratio camera container (4:3)
- Preset prompt buttons
- Full-width textarea
- Analysis history cards

---

### 3. Notes Module

```tsx
<div className="tab-panel notes-panel">
  {/* Header */}
  <div className="panel-header">
    <h2>Smart Notes</h2>
    <p>Record audio and get AI-powered transcriptions and summaries</p>
  </div>

  {/* Model Banner */}
  <ModelBanner {...loaderProps} label="Transcription Model" />

  {/* Primary: Recording Controls */}
  <div className="notes-recorder-container">
    <div className="recorder-status">
      {isRecording && <span className="recording-indicator" />}
      <h3>{isRecording ? 'Recording...' : 'Ready to Record'}</h3>
      <p>{formatDuration(recordingTime)}</p>
    </div>
  </div>

  {/* Controls */}
  <div className="notes-controls">
    <button 
      className={`btn btn-lg ${isRecording ? 'btn-danger' : 'btn-primary'}`}
      onClick={toggleRecording}
    >
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
    {hasRecording && (
      <button className="btn btn-lg" onClick={transcribe}>
        Transcribe & Summarize
      </button>
    )}
  </div>

  {/* Notes History */}
  <div className="notes-section">
    <div className="section-divider" />
    <div className="results-header">
      <h3>Saved Notes</h3>
      <button className="btn btn-sm btn-ghost" onClick={clearNotes}>
        Clear All
      </button>
    </div>
    <div className="notes-list">
      {/* Note cards with transcription + summary */}
    </div>
  </div>
</div>
```

**Key Styles:**
```css
.notes-recorder-container {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recorder-status {
  text-align: center;
  padding: var(--space-6);
}

.recording-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--red);
  border-radius: 50%;
  animation: pulse-recording 1.5s ease-in-out infinite;
  margin-bottom: var(--space-2);
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.note-card {
  padding: var(--space-4);
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.note-transcription {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
}

.note-summary {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
}
```

---

### 4. Quiz Module

```tsx
<div className="tab-panel quiz-panel">
  {/* Header */}
  <div className="panel-header">
    <h2>AI Quiz Generator</h2>
    <p>Generate custom multiple-choice quizzes on any topic</p>
  </div>

  {/* Model Banner */}
  <ModelBanner {...loaderProps} label="Quiz Model" />

  {/* Primary: Topic Input */}
  <div className="quiz-generator-container">
    <textarea
      className="quiz-topic-input"
      placeholder="Enter a topic or paste study material..."
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      rows={4}
    />
    <div className="quiz-options">
      <label>
        Questions:
        <input 
          type="number" 
          min="1" 
          max="10" 
          value={numQuestions}
          onChange={(e) => setNumQuestions(+e.target.value)}
        />
      </label>
      <label>
        Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
    </div>
  </div>

  {/* Controls */}
  <div className="quiz-controls">
    <button 
      className="btn btn-primary btn-lg"
      onClick={generateQuiz}
      disabled={!topic.trim() || isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate Quiz'}
    </button>
  </div>

  {/* Active Quiz */}
  {quiz && (
    <div className="quiz-section">
      <div className="section-divider" />
      <div className="quiz-header">
        <h3>Question {currentQuestion + 1} of {quiz.length}</h3>
        <span className="quiz-score">Score: {score}/{quiz.length}</span>
      </div>
      <div className="quiz-card">
        <h4 className="question-text">{quiz[currentQuestion].question}</h4>
        <div className="answer-options">
          {quiz[currentQuestion].options.map((option, i) => (
            <button
              key={i}
              className={`answer-option ${getOptionClass(i)}`}
              onClick={() => selectAnswer(i)}
              disabled={hasAnswered}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              {option}
            </button>
          ))}
        </div>
      </div>
      {hasAnswered && (
        <button className="btn btn-primary" onClick={nextQuestion}>
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      )}
    </div>
  )}
</div>
```

**Key Styles:**
```css
.quiz-generator-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.quiz-topic-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
}

.quiz-options {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.quiz-options label {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-muted);
  flex: 1;
  min-width: 120px;
}

.quiz-options input,
.quiz-options select {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
}

.quiz-card {
  padding: var(--space-5);
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: var(--space-4);
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.answer-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-input);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.answer-option:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.answer-option.correct {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--green);
}

.answer-option.incorrect {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--red);
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-card);
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.quiz-score {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  padding: var(--space-1) var(--space-3);
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-sm);
}
```

---

## 🎨 Shared Component Patterns

### 1. Section Divider
```css
.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border) 20%,
    var(--border) 80%,
    transparent
  );
  margin: var(--space-2) 0;
}
```

### 2. Results Header
```css
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
```

### 3. Card Pattern
```css
.card {
  padding: var(--space-4);
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: border-color var(--transition-base);
}

.card:hover {
  border-color: rgba(99, 102, 241, 0.3);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First (default) */
/* 0 - 480px */

/* Small tablets */
@media (min-width: 481px) and (max-width: 768px) {
  /* Adjustments */
}

/* Desktop (if container exceeds 600px) */
@media (min-width: 769px) {
  .tab-panel {
    padding: var(--space-6);
  }
}
```

---

## ♿ Accessibility Checklist

- [ ] All interactive elements have `:focus-visible` styles
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] SVG icons have `aria-hidden="true"` or `aria-label`
- [ ] Buttons have clear text or `aria-label`
- [ ] Form inputs have associated labels
- [ ] Error messages are announced with `role="alert"`
- [ ] Respect `prefers-reduced-motion`

---

## 🚀 Implementation Checklist

For each new module:

1. **Copy base structure** from this document
2. **Replace module name** in classNames
3. **Customize primary container** (camera, recorder, input, etc.)
4. **Add module-specific controls**
5. **Implement results/history section** if needed
6. **Add module-specific styles** following spacing system
7. **Test responsiveness** at 375px, 768px, 1024px
8. **Verify accessibility** with keyboard navigation
9. **Ensure no layout shifts** during loading states

---

## 📊 Performance Considerations

### Prevent Layout Shift
```css
/* Use aspect-ratio for dynamic content */
.dynamic-container {
  aspect-ratio: 16 / 9;
  min-height: 200px;
}

/* Reserve space for loading states */
.skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-card) 0%,
    var(--bg-input) 50%,
    var(--bg-card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}
```

### Optimize Reflows
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `margin`, `padding`
- Use `will-change` sparingly for heavy animations

### WebGPU Compatibility
- Avoid `backdrop-filter` (can interfere with WebGPU rendering)
- Test with `chrome://gpu` to verify hardware acceleration
- Use CSS containment for isolated sections:
  ```css
  .results-list {
    contain: layout style paint;
  }
  ```

---

## ✅ Summary

This pattern provides:
- **Consistency**: Same structure across all 4 modules
- **Scalability**: Easy to add new sections
- **Maintainability**: Clear naming conventions
- **Performance**: Layout shift prevention
- **Accessibility**: Built-in ARIA support
- **Responsiveness**: Mobile-first approach

Use this as the blueprint for all future module development in AI Study Buddy.
