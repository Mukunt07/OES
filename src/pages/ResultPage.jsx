import { useEffect, useRef, useState } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, limit, where } from "firebase/firestore";

export default function ResultPage() {
  const location = useLocation();
  // Use a ref to prevent double-saving in React Strict Mode
  const hasSaved = useRef(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);

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

  // 🔥 Save result to Firestore with gamification
  useEffect(() => {
    // 2. PREVENT DUPLICATES: Check if we already saved
    if (hasSaved.current) return;

    const saveToFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        hasSaved.current = true; // Mark as saved immediately

        // Calculate points and XP
        const pointsEarned = (score * 10) + 2 + (timeSpent < 120 ? 5 : 0); // +10 per correct, +2 completion, +5 speed
        const xpEarned = score * 5;

        // Get current user stats
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let userData = userSnap.exists() ? userSnap.data() : {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          createdAt: serverTimestamp(),
          stats: {
            totalPoints: 0,
            xp: 0,
            level: 1,
            totalQuizzes: 0,
            averageScore: 0,
            maxScore: 0
          }
        };

        // Update stats
        const currentStats = userData.stats;
        const newTotalQuizzes = currentStats.totalQuizzes + 1;
        const newTotalPoints = currentStats.totalPoints + pointsEarned;
        const newXP = currentStats.xp + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newAverageScore = Math.round(((currentStats.averageScore * currentStats.totalQuizzes) + percentage) / newTotalQuizzes);
        const newMaxScore = Math.max(currentStats.maxScore, percentage);

        // Check if leveled up
        const leveledUp = newLevel > currentStats.level;
        if (leveledUp) {
          setNewLevel(newLevel);
          setShowLevelUp(true);
        }

        // Update user document
        await setDoc(userRef, {
          ...userData,
          stats: {
            totalPoints: newTotalPoints,
            xp: newXP,
            level: newLevel,
            totalQuizzes: newTotalQuizzes,
            averageScore: newAverageScore,
            maxScore: newMaxScore,
            lastUpdated: serverTimestamp()
          }
        }, { merge: true });

        // Check and award badges
        const badgesEarned = await checkAndAwardBadges(user.uid, topic, percentage, timeSpent, score === questions.length, newTotalQuizzes);
        setEarnedBadges(badgesEarned);

        // Save to user's results
        await addDoc(collection(db, "users", user.uid, "results"), {
          topic,
          score,
          totalQuestions: questions.length,
          percentage,
          timeSpent,
          answers,
          pointsEarned,
          xpEarned,
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

        console.log("🎉 Result saved to Firestore with gamification!");
      } catch (error) {
        console.error("❌ Error saving result:", error);
        hasSaved.current = false; // Reset if error, so it tries again if needed
      }
    };

    saveToFirestore();
    // Remove extensive dependencies to ensure this only attempts to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Badge checking function
  const checkAndAwardBadges = async (uid, topic, percentage, timeSpent, isPerfect, totalQuizzes) => {
    const badgesEarned = [];
    const userBadgesRef = collection(db, "users", uid, "badges");
    const existingBadgesSnap = await getDocs(userBadgesRef);
    const existingBadges = existingBadgesSnap.docs.map(doc => doc.data().name);

    // Beginner badge
    if (totalQuizzes === 1 && !existingBadges.includes("Beginner")) {
      await addDoc(userBadgesRef, {
        name: "Beginner",
        description: "Completed your first quiz",
        achievedAt: serverTimestamp()
      });
      badgesEarned.push({ name: "Beginner", description: "Completed your first quiz" });
    }

    // Sharp Mind badge
    if (percentage >= 80 && !existingBadges.includes("Sharp Mind")) {
      await addDoc(userBadgesRef, {
        name: "Sharp Mind",
        description: "Scored 80% or higher",
        achievedAt: serverTimestamp()
      });
      badgesEarned.push({ name: "Sharp Mind", description: "Scored 80% or higher" });
    }

    // Speedster badge
    if (timeSpent < 120 && !existingBadges.includes("Speedster")) {
      await addDoc(userBadgesRef, {
        name: "Speedster",
        description: "Completed quiz under 2 minutes",
        achievedAt: serverTimestamp()
      });
      badgesEarned.push({ name: "Speedster", description: "Completed quiz under 2 minutes" });
    }

    // Quiz King/Queen badge
    if (isPerfect && !existingBadges.includes("Quiz King/Queen")) {
      await addDoc(userBadgesRef, {
        name: "Quiz King/Queen",
        description: "Got all answers correct",
        achievedAt: serverTimestamp()
      });
      badgesEarned.push({ name: "Quiz King/Queen", description: "Got all answers correct" });
    }

    // Streak Master badge - check last 3 quizzes
    const resultsRef = collection(db, "users", uid, "results");
    const resultsQuery = query(resultsRef, orderBy("createdAt", "desc"), limit(3));
    const resultsSnap = await getDocs(resultsQuery);
    const recentResults = resultsSnap.docs.map(doc => doc.data());
    if (recentResults.length >= 3) {
      const allAbove70 = recentResults.every(r => r.percentage >= 70);
      if (allAbove70 && !existingBadges.includes("Streak Master")) {
        await addDoc(userBadgesRef, {
          name: "Streak Master",
          description: "3 quizzes in a row with ≥70%",
          achievedAt: serverTimestamp()
        });
        badgesEarned.push({ name: "Streak Master", description: "3 quizzes in a row with ≥70%" });
      }
    }

    // Category Pro badge - check if scored >=80% in same topic 3 times
    const topicResultsQuery = query(resultsRef, where("topic", "==", topic));
    const topicResultsSnap = await getDocs(topicResultsQuery);
    const topicResults = topicResultsSnap.docs.map(doc => doc.data());
    const highScoresInTopic = topicResults.filter(r => r.percentage >= 80).length;
    const badgeName = `Category Pro - ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
    if (highScoresInTopic >= 3 && !existingBadges.includes(badgeName)) {
      await addDoc(userBadgesRef, {
        name: badgeName,
        description: `Scored ≥80% in ${topic} 3 times`,
        achievedAt: serverTimestamp()
      });
      badgesEarned.push({ name: badgeName, description: `Scored ≥80% in ${topic} 3 times` });
    }

    return badgesEarned;
  };

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

        {/* Level Up Popup */}
        {showLevelUp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 text-center max-w-md mx-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-xl text-gray-300 mb-6">You reached Level {newLevel}</p>
              <button
                onClick={() => setShowLevelUp(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Badge Earned Animation */}
        {earnedBadges.length > 0 && (
          <div className="fixed bottom-4 right-4 z-40">
            {earnedBadges.map((badge, index) => (
              <div
                key={index}
                className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 mb-2 animate-bounce shadow-2xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-white font-medium">Badge Earned!</p>
                    <p className="text-gray-300 text-sm">{badge.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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