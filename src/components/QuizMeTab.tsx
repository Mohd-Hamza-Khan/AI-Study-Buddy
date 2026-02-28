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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // --- Generate a single question ---
  const fetchQuestion = useCallback(async (attempt = 1): Promise<Question> => {
    const difficultyDesc = {
      easy: 'easy (basic knowledge)',
      medium: 'medium (intermediate knowledge)',
      hard: 'hard (advanced knowledge)',
    };

    const prompt = `Generate a ${difficultyDesc[difficulty]} multiple choice quiz question about ${topic}.
Use 4 distinct options labeled A-D.
Return in this format:

Question: [text]
A) [option1]
B) [option2]
C) [option3]
D) [option4]
Correct: [A-D]
Explanation: [short explanation]`;

    try {
      const result = await TextGeneration.generate(prompt, {
        maxTokens: 200,
        temperature: 0.7,
        systemPrompt: 'You are a concise quiz generator. Only return valid MCQs.',
      });

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
          if (!options.some(o => o.toLowerCase() === optionText.toLowerCase())) {
            options.push(optionText);
          }
        } else if (trimmed.startsWith('Correct:')) {
          const letter = trimmed.replace('Correct:', '').trim().toUpperCase()[0];
          correctAnswer = letter.charCodeAt(0) - 65;
        } else if (trimmed.startsWith('Explanation:')) {
          explanation = trimmed.replace('Explanation:', '').trim();
        }
      }

      if (question && options.length === 4 && explanation) {
        return { question, options, correctAnswer, explanation };
      } else if (attempt < 2) {
        return fetchQuestion(attempt + 1);
      } else {
        throw new Error('Failed to parse question');
      }
    } catch (err) {
      if (attempt < 2) return fetchQuestion(attempt + 1);
      throw err;
    }
  }, [topic, difficulty]);

  // --- Pre-generate all quiz questions ---
  const generateAllQuestions = useCallback(async () => {
    setQuizState('loading');
    setError(null);
    setScore(0);
    setCurrentIndex(0);
    setQuestions([]);
    setSelectedAnswer(null);
    setQuizResult(null);

    try {
      const promises = Array.from({ length: numQuestions }).map(() => fetchQuestion());
      const allQs = await Promise.all(promises);
      setQuestions(allQs);
      setQuizState('quiz-active');
    } catch {
      setError('Failed to generate questions. Try again.');
      setQuizState('setup');
    }
  }, [fetchQuestion, numQuestions]);

  const startQuiz = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }
    generateAllQuestions();
  }, [topic, loader, generateAllQuestions]);

  const checkAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const currentQ = questions[currentIndex];
    const correct = selectedAnswer === currentQ.correctAnswer;
    if (correct) setScore(prev => prev + 1);

    setQuizResult({ correct, explanation: currentQ.explanation });
    setQuizState('showing-result');
  }, [selectedAnswer, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setQuizState('completed');
    } else {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setQuizResult(null);
      setQuizState('quiz-active');
    }
  }, [currentIndex, questions.length]);

  const restartQuiz = useCallback(() => {
    setQuizState('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizResult(null);
    setError(null);
  }, []);

  // --- JSX ---
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
            <button className="btn btn-sm" onClick={() => setError(null)} style={{ marginLeft: 10 }}>
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
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
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
              onChange={e => setNumQuestions(Number(e.target.value))}
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
          <p>Generating {numQuestions} questions...</p>
        </div>
      )}

      {(quizState === 'quiz-active' || quizState === 'showing-result') && questions[currentIndex] && (
        <div className="quiz-question">
          <div className="quiz-progress">
            Question {currentIndex + 1} of {numQuestions} | Score: {score}/{currentIndex + (quizResult?.correct ? 1 : 0)}
          </div>

          <h3 className="question-text">{questions[currentIndex].question}</h3>

          <div className="quiz-options">
            {questions[currentIndex].options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === questions[currentIndex].correctAnswer;
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
                  disabled={showResult}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>

          {quizState === 'quiz-active' && (
            <button className="btn btn-primary btn-lg" onClick={checkAnswer} disabled={selectedAnswer === null}>
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
            <div className="score-display">{score} / {numQuestions}</div>
            <div className="score-percentage">{Math.round((score / numQuestions) * 100)}%</div>
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
    </div>
  );
}