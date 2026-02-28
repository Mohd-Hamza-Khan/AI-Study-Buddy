import { useState, useCallback, useEffect } from 'react';
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
  const [bufferedQuestion, setBufferedQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const fetchQuestion = useCallback(async (attempt = 1): Promise<Question> => {
    const difficultyDesc = {
      easy: 'easy (basic knowledge)',
      medium: 'medium (intermediate knowledge)',
      hard: 'hard (advanced knowledge)',
    };

    const historyPrompt =
      askedQuestions.length > 0
        ? `\n\nPreviously asked questions (for topic "${topic}"):\n- ${askedQuestions.join('\n- ')}`
        : '';

    const prompt = `Generate a ${difficultyDesc[difficulty]} multiple choice quiz question about ${topic}.${historyPrompt}

Ensure the question is conceptually different from previous ones.
Ensure all 4 answer options are distinct and not paraphrases of each other.

Question: [Your question here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Correct: [A, B, C, or D]
Explanation: [Why the answer is correct]`;

    const result = await TextGeneration.generate(prompt, {
      maxTokens: 200,
      temperature: 0.8,
      systemPrompt:
        'You are a quiz generator. Create clear, educational, non-repetitive multiple choice questions.',
    });

    const lines = result.text.split('\n').filter((l) => l.trim());
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
        if (!options.some(opt => opt.toLowerCase() === optionText.toLowerCase())) {
          options.push(optionText);
        }
      } else if (trimmed.startsWith('Correct:')) {
        const correctLetter = trimmed.replace('Correct:', '').trim().toUpperCase()[0];
        correctAnswer = correctLetter.charCodeAt(0) - 65;
      } else if (trimmed.startsWith('Explanation:')) {
        explanation = trimmed.replace('Explanation:', '').trim();
      }
    }

    const uniqueOptions = new Set(options.map(o => o.toLowerCase()));

    if (
      question &&
      options.length === 4 &&
      uniqueOptions.size === 4 &&
      explanation &&
      !askedQuestions.includes(question)
    ) {
      return {
        question,
        options,
        correctAnswer: Math.max(0, Math.min(3, correctAnswer)),
        explanation,
      };
    }

    if (attempt < 3) {
      console.warn('Parsing failed or duplicate question, retrying...', attempt + 1);
      return fetchQuestion(attempt + 1);
    }
    throw new Error('Unable to generate a valid and unique quiz question');
  }, [topic, difficulty, askedQuestions]);

  const generateNextQuestion = useCallback(async () => {
    setSelectedAnswer(null);
    setQuizResult(null);

    try {
      const q = await fetchQuestion();
      setAskedQuestions((prev) => [...prev, q.question]);
      return q;
    } catch (err) {
      setError(`Failed to generate question.`);
      setQuizState('setup');
      return null;
    }
  }, [fetchQuestion]);

  const startQuiz = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    setQuizState('loading');
    setError(null);
    setScore(0);
    setCurrentIndex(0);
    setAskedQuestions([]);
    setBufferedQuestion(null);

    const firstQuestion = await generateNextQuestion();
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setQuizState('quiz-active');

      // Pre-fetch the next question
      generateNextQuestion().then(setBufferedQuestion);
    }
  }, [topic, loader, generateNextQuestion]);

  const checkAnswer = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    if (correct) setScore((prev) => prev + 1);

    setQuizResult({
      correct,
      explanation: currentQuestion.explanation,
    });

    setQuizState('showing-result');
  }, [selectedAnswer, currentQuestion]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setQuizResult(null);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= numQuestions) {
      setQuizState('completed');
      return;
    }

    setCurrentIndex(nextIndex);

    if (bufferedQuestion) {
      setCurrentQuestion(bufferedQuestion);
      setBufferedQuestion(null);
      setQuizState('quiz-active');
      generateNextQuestion().then(setBufferedQuestion);
    } else {
      setQuizState('loading');
      generateNextQuestion().then((q) => {
        if (q) {
          setCurrentQuestion(q);
          setQuizState('quiz-active');
          generateNextQuestion().then(setBufferedQuestion);
        }
      });
    }
  }, [currentIndex, numQuestions, bufferedQuestion, generateNextQuestion]);

  const restartQuiz = useCallback(() => {
    setQuizState('setup');
    setTopic('');
    setCurrentQuestion(null);
    setBufferedQuestion(null);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizResult(null);
    setError(null);
    setAskedQuestions([]);
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
            Question {currentIndex + 1} of {numQuestions} | Score: {score}
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
            {score === numQuestions
              ? 'Perfect score! Outstanding!'
              : score >= numQuestions * 0.8
              ? 'Great job! You really know your stuff!'
              : score >= numQuestions * 0.6
              ? 'Good effort! Keep studying!'
              : 'Keep learning! Practice makes perfect.'}
          </p>
          <div className="quiz-actions">
            <button className="btn btn-primary btn-lg" onClick={restartQuiz}>
              New Quiz
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                restartQuiz();
                // We can assume the user wants to try the same topic again
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Renders a debug panel with various states shown */}
      {import.meta.env.DEV && (
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '10px',
            margin: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >

        </div>
      )}
    </div>
  );
}
