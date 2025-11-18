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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-4 lg:p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 capitalize">
            {topic} Quiz
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600 dark:text-gray-400">
            <span className="text-sm sm:text-base">Question {current + 1} of {questions.length}</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeLeft > 60 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              Time: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 sm:mb-6 lg:mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl dark:shadow-gray-900/20 border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 lg:mb-8 text-gray-800 dark:text-gray-200 leading-relaxed">
            {questions[current].question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {questions[current].options.map((option, index) => {
              const isSelected = selectedAnswers[current] === index;
              const isCorrect = index === questions[current].correct;
              const isRevealed = revealed[current];
              const isWrongSelected = isSelected && !isCorrect;

              let buttonClass = "p-3 sm:p-4 rounded-xl text-left font-medium transition-all duration-200 transform hover:scale-[1.02] ";

              if (isRevealed) {
                if (isCorrect) {
                  buttonClass += "bg-green-500 text-white shadow-lg";
                } else if (isWrongSelected) {
                  buttonClass += "bg-red-500 text-white shadow-lg";
                } else if (!isSelected && isCorrect) {
                  buttonClass += "bg-green-200 text-gray-800 border-2 border-green-500 dark:bg-green-900 dark:text-gray-200";
                } else {
                  buttonClass += "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300";
                }
              } else {
                buttonClass += isSelected
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600";
              }

              return (
                <button
                  key={index}
                  onClick={() => !isRevealed && handleAnswer(index)}
                  disabled={isRevealed}
                  className={buttonClass}
                >
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-current mr-3 text-sm flex items-center justify-center">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Show Correct Answer Button */}
          {selectedAnswers[current] !== undefined && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setRevealed({ ...revealed, [current]: true })}
                disabled={revealed[current]}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  revealed[current]
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {revealed[current] ? "Answer Shown" : "Show Correct Answer"}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {Object.keys(selectedAnswers).length} of {questions.length} answered
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswers[current] === undefined}
            className="
              w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium
              hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 transition-all duration-200 shadow-lg
            "
          >
            {current === questions.length - 1 ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
