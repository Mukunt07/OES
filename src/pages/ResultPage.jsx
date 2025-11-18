import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ResultPage() {
  const location = useLocation();
  const { topic, answers, questions, timeSpent } = location.state || {};

  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    Object.keys(answers).forEach((i) => {
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
    const saveToFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
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
      }
    };

    saveToFirestore();
  }, [topic, score, questions.length, percentage, timeSpent, answers]); // Runs only once

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Quiz Results
          </h1>
          <p className="text-gray-600 capitalize">{topic} Quiz</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 mb-8 text-center">
          <div className={`w-32 h-32 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <span className="text-4xl font-bold text-white">{grade}</span>
          </div>

          <div className="mb-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              {score} / {questions.length}
            </div>
            <div className="text-2xl font-semibold text-gray-600">{percentage}%</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{timeFormatted}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg text-center"
          >
            Take Another Quiz
          </Link>

          <Link
            to={`/quiz/${topic}`}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-center"
          >
            Retake This Quiz
          </Link>
        </div>

        {/* Detailed Review */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Question Review</h3>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Question {i + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {correct ? "Correct" : "Incorrect"}
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
