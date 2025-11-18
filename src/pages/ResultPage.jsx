import { useEffect, useRef } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ResultPage() {
  const location = useLocation();
  // Use a ref to prevent double-saving in React Strict Mode
  const hasSaved = useRef(false);

  // 1. SAFETY CHECK: If no state exists (user refreshed page), redirect to home
  if (!location.state || !location.state.questions) {
    return <Navigate to="/" replace />;
  }

  const { topic, answers, questions, timeSpent } = location.state;

  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    Object.keys(answers).forEach((i) => {
      // Ensure question exists before checking
      if (questions[i] && answers[i] === questions[i].correct) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const timeFormatted = `${Math.floor(timeSpent / 60)}:${String(
    timeSpent % 60
  ).padStart(2, "0")}`;

  // Grade system
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "from-green-400 to-emerald-500" };
    if (percentage >= 80) return { grade: "A", color: "from-blue-400 to-blue-500" };
    if (percentage >= 70) return { grade: "B", color: "from-yellow-400 to-orange-500" };
    if (percentage >= 60) return { grade: "C", color: "from-orange-400 to-red-500" };
    return { grade: "D", color: "from-red-400 to-red-600" };
  };

  const { grade, color } = getGrade(percentage);

  // 🔥 Save result to Firestore
  useEffect(() => {
    // 2. PREVENT DUPLICATES: Check if we already saved
    if (hasSaved.current) return;

    const saveToFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        hasSaved.current = true; // Mark as saved immediately

        // Save to user's results
        await addDoc(collection(db, "users", user.uid, "results"), {
          topic,
          score,
          totalQuestions: questions.length,
          percentage,
          timeSpent,
          answers,
          createdAt: serverTimestamp(),
        });

        // Save to global leaderboard
        await addDoc(collection(db, "leaderboard"), {
          userId: user.uid,
          displayName: user.displayName || user.email,
          topic,
          score,
          percentage,
          timestamp: serverTimestamp(),
        });

        console.log("🎉 Result saved to Firestore!");
      } catch (error) {
        console.error("❌ Error saving result:", error);
        hasSaved.current = false; // Reset if error, so it tries again if needed
      }
    };

    saveToFirestore();
    // Remove extensive dependencies to ensure this only attempts to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-thin tracking-tight mb-4">
            Quiz Complete
          </h1>
          <p className="text-xl text-gray-400 capitalize">{topic} Quiz Results</p>
        </div>

        {/* Score Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8 text-center">
          <div className={`w-24 h-24 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-900/50`}>
            <span className="text-3xl font-bold text-white">{grade}</span>
          </div>

          <div className="mb-8">
            <div className="text-6xl sm:text-7xl lg:text-8xl font-thin mb-4">
              {score} <span className="text-gray-500">/</span> {questions.length}
            </div>
            <div className="text-2xl text-gray-400 font-light">{percentage}% Score</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-3xl font-bold text-green-400 mb-2 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {score}
            </div>
            <div className="text-sm text-gray-500 text-center">Correct</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-3xl font-bold text-red-400 mb-2 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {questions.length - score}
            </div>
            <div className="text-sm text-gray-500 text-center">Incorrect</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              {timeFormatted}
            </div>
            <div className="text-sm text-gray-500 text-center">Time</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/25 text-center"
          >
            Take Another Quiz
          </Link>

          <Link
            to={`/quiz/${topic}`}
            className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-2xl font-medium hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 text-center"
          >
            Retake This Quiz
          </Link>
        </div>

        {/* Detailed Review */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <h3 className="text-2xl font-light text-white mb-6">Question Review</h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questions.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
                  <span className="text-lg font-medium text-gray-300">Question {i + 1}</span>
                  <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    correct ? "bg-green-500/20 border border-green-500/50 text-green-400" : "bg-red-500/20 border border-red-500/50 text-red-400"
                  }`}>
                    {correct ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}