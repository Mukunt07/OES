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

  // Fetch from API
  const fetchQuestions = async () => {
    setLoading(true);

    const url = `https://opentdb.com/api.php?amount=10&type=multiple&encode=base64`;

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  // Show result loading animation
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
          <p className="text-gray-600">Calculating your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 animate-fadeIn">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 capitalize">
            {topic} Quiz
          </h1>
          <div className="flex justify-center items-center space-x-6 text-gray-600">
            <span>Question {current + 1} of {questions.length}</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeLeft > 60 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              Time: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800 leading-relaxed">
            {questions[current].question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[current].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`
                  p-4 rounded-2xl text-left font-medium transition-all duration-200 transform hover:scale-[1.02]
                  ${selectedAnswers[current] === index
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }
                `}
              >
                <span className="inline-block w-6 h-6 rounded-full border-2 border-current mr-3 text-sm flex items-center justify-center">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            {Object.keys(selectedAnswers).length} of {questions.length} answered
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswers[current] === undefined}
            className="
              px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium
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
