import { useState, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';

type QuizState = 'setup' | 'loading' | 'quiz-active' | 'showing-result' | 'completed';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  correct: boolean;
  explanation: string;
}

export function QuizMeTab() {
  const loader = useModelLoader(ModelCategory.Language);

  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugOutput, setDebugOutput] = useState<string>('');

  // Generate next question using structured prompting
  const generateNextQuestion = useCallback(async () => {
    setQuizState('loading');
    setSelectedAnswer(null);
    setQuizResult(null);

    try {
      const difficultyDesc = {
        easy: 'easy (basic knowledge)',
        medium: 'medium (intermediate knowledge)',
        hard: 'hard (advanced knowledge)',
      };

      // Simplified prompt that works better with small models
      const prompt = `Generate a ${difficultyDesc[difficulty]} multiple choice quiz question about ${topic}.

Question: [Your question here]
A) [First option]
B) [Second option]  
C) [Third option]
D) [Fourth option]
Correct: [A, B, C, or D]
Explanation: [Why the answer is correct]`;

      const result = await TextGeneration.generate(prompt, {
        maxTokens: 300,
        temperature: 0.7,
        systemPrompt: 'You are a quiz generator. Create clear, educational multiple choice questions.',
      });

      console.log('LLM Response:', result.text);
      setDebugOutput(result.text); // Save for debugging

      // Parse the simpler format
      const lines = result.text.split('\n').filter(l => l.trim());
      
      let question = '';
      const options: string[] = [];
      let correctAnswer = 0;
      let explanation = '';

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Question:')) {
          question = trimmed.replace('Question:', '').trim();
        } else if (trimmed.match(/^[A-D]\)/)) {
          const optionText = trimmed.substring(2).trim();
          options.push(optionText);
        } else if (trimmed.startsWith('Correct:')) {
          const correctLetter = trimmed.replace('Correct:', '').trim().toUpperCase()[0];
          correctAnswer = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        } else if (trimmed.startsWith('Explanation:')) {
          explanation = trimmed.replace('Explanation:', '').trim();
        }
      }

      // Validate we got all required parts
      if (!question || options.length !== 4 || !explanation) {
        // Fallback: Create a simple hardcoded question as demo
        console.warn('Could not parse LLM output, using fallback question');
        setCurrentQuestion({
          question: `What is a key concept in ${topic}?`,
          options: [
            'The fundamental principle',
            'An unrelated topic',
            'Something completely different',
            'Another wrong answer'
          ],
          correctAnswer: 0,
          explanation: `The first option represents a fundamental principle in ${topic}.`
        });
      } else {
        setCurrentQuestion({
          question,
          options,
          correctAnswer: Math.max(0, Math.min(3, correctAnswer)), // Ensure 0-3 range
          explanation,
        });
      }

      setQuizState('quiz-active');
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(`Failed to generate question. Error: ${err instanceof Error ? err.message : String(err)}`);
      setQuizState('setup');
    }
  }, [topic, difficulty]);

  // Start quiz
  const startQuiz = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    // Ensure model loaded
    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    setQuizState('loading');
    setError(null);
    setScore(0);
    setCurrentIndex(0);

    await generateNextQuestion();
  }, [topic, loader, generateNextQuestion]);

  // Check answer
  const checkAnswer = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    if (correct) {
      setScore((prev) => prev + 1);
    }

    setQuizResult({
      correct,
      explanation: currentQuestion.explanation,
    });

    setQuizState('showing-result');
  }, [selectedAnswer, currentQuestion]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= numQuestions) {
      setQuizState('completed');
    } else {
      setCurrentIndex(nextIndex);
      generateNextQuestion();
    }
  }, [currentIndex, numQuestions, generateNextQuestion]);

  // Restart quiz
  const restartQuiz = useCallback(() => {
    setQuizState('setup');
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizResult(null);
    setError(null);
  }, []);

  return (
    <div className="tab-panel quiz-panel">
      <div className="panel-header">
        <h2>Quiz Me</h2>
        <p>Test your knowledge with AI-generated quizzes on any topic</p>
      </div>

      {loader.state !== 'ready' && quizState === 'setup' && (
        <ModelBanner
          state={loader.state}
          progress={loader.progress}
          error={loader.error}
          onLoad={loader.ensure}
          label="LLM"
        />
      )}

      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
          {quizState === 'setup' && (
            <button 
              className="btn btn-sm" 
              onClick={() => setError(null)}
              style={{ marginLeft: '10px' }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {quizState === 'setup' && (
        <div className="quiz-setup">
          <div className="form-group">
            <label>Quiz Topic</label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g., World History, JavaScript, Biology..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className={`btn ${difficulty === d ? 'btn-primary' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Number of Questions: {numQuestions}</label>
            <input
              type="range"
              min="3"
              max="10"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
          </div>

          <button className="btn btn-primary btn-lg" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      )}

      {quizState === 'loading' && (
        <div className="quiz-loading">
          <div className="spinner" />
          <p>Generating question {currentIndex + 1} of {numQuestions}...</p>
        </div>
      )}

      {(quizState === 'quiz-active' || quizState === 'showing-result') && currentQuestion && (
        <div className="quiz-question">
          <div className="quiz-progress">
            Question {currentIndex + 1} of {numQuestions} | Score: {score}/{currentIndex + (quizResult?.correct ? 1 : 0)}
          </div>

          <h3 className="question-text">{currentQuestion.question}</h3>

          <div className="quiz-options">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === currentQuestion.correctAnswer;
              const showResult = quizState === 'showing-result';

              let className = 'quiz-option';
              if (isSelected) className += ' selected';
              if (showResult && isCorrect) className += ' correct';
              if (showResult && isSelected && !isCorrect) className += ' incorrect';

              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => setSelectedAnswer(i)}
                  disabled={quizState === 'showing-result'}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>

          {quizState === 'quiz-active' && (
            <button
              className="btn btn-primary btn-lg"
              onClick={checkAnswer}
              disabled={selectedAnswer === null}
            >
              Check Answer
            </button>
          )}

          {quizState === 'showing-result' && quizResult && (
            <div className={`quiz-result ${quizResult.correct ? 'correct' : 'incorrect'}`}>
              <h4>{quizResult.correct ? 'Correct!' : 'Incorrect'}</h4>
              <p>{quizResult.explanation}</p>
              <button className="btn btn-primary btn-lg" onClick={nextQuestion}>
                {currentIndex + 1 < numQuestions ? 'Next Question' : 'See Results'}
              </button>
            </div>
          )}
        </div>
      )}

      {quizState === 'completed' && (
        <div className="quiz-completed">
          <h2>Quiz Complete!</h2>
          <div className="final-score">
            <div className="score-display">
              {score} / {numQuestions}
            </div>
            <div className="score-percentage">
              {Math.round((score / numQuestions) * 100)}%
            </div>
          </div>
          <p className="score-message">
            {score === numQuestions && 'Perfect score! Outstanding!'}
            {score >= numQuestions * 0.8 && score < numQuestions && 'Great job! You really know your stuff!'}
            {score >= numQuestions * 0.6 && score < numQuestions * 0.8 && 'Good effort! Keep studying!'}
            {score < numQuestions * 0.6 && 'Keep learning! Practice makes perfect.'}
          </p>
          <div className="quiz-actions">
            <button className="btn btn-primary btn-lg" onClick={restartQuiz}>
              New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Debug Output */}
      {debugOutput && (
        <details style={{ margin: '16px', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
            🐛 Debug: Show LLM Raw Output
          </summary>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '12px', 
            background: 'var(--bg-input)', 
            padding: '12px', 
            borderRadius: '6px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {debugOutput}
          </pre>
        </details>
      )}
    </div>
  );
}
