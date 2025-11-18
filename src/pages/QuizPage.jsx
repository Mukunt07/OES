import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Base64 decode helper
const decodeBase64 = (str) => atob(str);

export default function QuizPage() {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [showResults, setShowResults] = useState(false);
  const [revealed, setRevealed] = useState({});

  // Category map for OpenTDB
  const categoryMap = {
    general: 9,
    books: 10,
    movies: 11,
    music: 12,
    sports: 21,
    geography: 22,
    history: 23,
    politics: 24,
    science: 17,
    computers: 18,
  };

  // Fetch from API
  const fetchQuestions = async () => {
    setLoading(true);

    const categoryId = categoryMap[topic];
    const url = categoryId
      ? `https://opentdb.com/api.php?amount=10&type=multiple&encode=base64&category=${categoryId}`
      : `https://opentdb.com/api.php?amount=10&type=multiple&encode=base64`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Convert trivia API format → your quiz format
      const formatted = data.results.map((q) => {
        const decodedQuestion = decodeBase64(q.question);
        const correctAns = decodeBase64(q.correct_answer);
        const incorrect = q.incorrect_answers.map((x) => decodeBase64(x));

        // Shuffle options
        const allOptions = [...incorrect, correctAns].sort(() => Math.random() - 0.5);

        return {
          question: decodedQuestion,
          options: allOptions,
          correct: allOptions.indexOf(correctAns),
        };
      });

      setQuestions(formatted);
      setLoading(false);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      await fetchQuestions();
    };
    loadQuestions();
  }, [topic]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [current]: answerIndex,
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      navigate("/result", {
        state: {
          topic,
          answers: selectedAnswers,
          questions,
          timeSpent: 300 - timeLeft,
        },
      });
    }, 2000);
  }, [navigate, topic, selectedAnswers, questions, timeLeft]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResults, loading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show result loading animation
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Quiz Completed!</h2>
          <p className="text-gray-600 dark:text-gray-400">Calculating your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-thin tracking-tight mb-4 capitalize">
            {topic} Quiz
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
            <span className="text-lg">Question {current + 1} of {questions.length}</span>
            <div className="relative">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / 300)}`}
                  className={`transition-all duration-1000 ease-linear ${timeLeft > 60 ? "text-blue-500" : "text-red-500"}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-1 mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light mb-8 text-white leading-relaxed">
            {questions[current].question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {questions[current].options.map((option, index) => {
              const isSelected = selectedAnswers[current] === index;
              const isCorrect = index === questions[current].correct;
              const isRevealed = revealed[current];
              const isWrongSelected = isSelected && !isCorrect;

              let buttonClass = "group relative p-6 rounded-2xl text-left font-medium transition-all duration-300 border ";

              if (isRevealed) {
                if (isCorrect) {
                  buttonClass += "bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/20";
                } else if (isWrongSelected) {
                  buttonClass += "bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20";
                } else if (!isSelected && isCorrect) {
                  buttonClass += "bg-green-500/10 border-green-500/50 text-green-300";
                } else {
                  buttonClass += "bg-gray-800/50 border-gray-700 text-gray-400";
                }
              } else {
                buttonClass += isSelected
                  ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
                  : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600 hover:text-white";
              }

              return (
                <button
                  key={index}
                  onClick={() => !isRevealed && handleAnswer(index)}
                  disabled={isRevealed}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isRevealed
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : isWrongSelected
                          ? "bg-red-500 text-white"
                          : "bg-gray-600 text-gray-300"
                        : isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-white"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Show Correct Answer Button */}
          {selectedAnswers[current] !== undefined && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setRevealed({ ...revealed, [current]: true })}
                disabled={revealed[current]}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  revealed[current]
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400"
                }`}
              >
                {revealed[current] ? "Answer Revealed" : "Reveal Answer"}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="w-full sm:w-auto px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Previous
          </button>

          <div className="text-gray-400 text-center">
            {Object.keys(selectedAnswers).length} of {questions.length} answered
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswers[current] === undefined}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            {current === questions.length - 1 ? "Complete Quiz" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
