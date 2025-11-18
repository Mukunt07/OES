import { useState, useEffect } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: Quiz History State
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
  });
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    xp: 0,
    level: 1,
    totalQuizzes: 0,
    averageScore: 0,
    maxScore: 0,
  });
  const [badges, setBadges] = useState([]);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || "");

        // Fetch quiz history and gamification data
        await loadUserResults(user.uid);
        await loadUserStats(user.uid);
        await loadUserBadges(user.uid);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔥 Load user results from Firestore
  const loadUserResults = async (uid) => {
    try {
      const resultsRef = collection(db, "users", uid, "results");
      const snapshot = await getDocs(resultsRef);

      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setResults(fetched);

      // Calculate stats
      if (fetched.length > 0) {
        const totalScore = fetched.reduce((sum, r) => sum + r.score, 0);
        const totalQuestions = fetched.reduce(
          (sum, r) => sum + r.totalQuestions,
          0
        );

        setStats({
          quizzesTaken: fetched.length,
          averageScore: Math.round((totalScore / totalQuestions) * 100),
        });
      }
    } catch (error) {
      console.error("Error loading results:", error);
    }
  };

  // 🔥 Load user stats from Firestore
  const loadUserStats = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserStats(userData.stats || {
          totalPoints: 0,
          xp: 0,
          level: 1,
          totalQuizzes: 0,
          averageScore: 0,
          maxScore: 0,
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  // 🔥 Load user badges from Firestore
  const loadUserBadges = async (uid) => {
    try {
      const badgesRef = collection(db, "users", uid, "badges");
      const snapshot = await getDocs(badgesRef);
      const fetchedBadges = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBadges(fetchedBadges);
    } catch (error) {
      console.error("Error loading badges:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      setEditing(false);
      setUser({ ...auth.currentUser });
    } catch (error) {
      alert(error.message);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Please sign in to view your profile</h2>
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-thin tracking-tight mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-gray-400">Manage your profile & view quiz performance</p>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">

          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-gray-900/50">
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Display Name Editing */}
          <div className="mb-6">
            <label className="text-gray-400 font-medium flex items-center mb-3">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Display Name
            </label>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="flex gap-3">
                <input
                  type="text"
                  className="border border-gray-700 rounded-2xl px-4 py-3 flex-1 bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
                <button className="px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-2xl hover:bg-green-500/30 hover:border-green-400 transition-all duration-300">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex justify-between bg-gray-800/30 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50">
                <span className="text-white">{displayName || "No Name Set"}</span>
                <button
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 font-medium flex items-center mb-3">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-2xl text-white border border-gray-700/50">
              {user.email}
            </div>
          </div>
        </div>

        {/* Gamification Stats Card */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-light mb-6 text-white">Your Gamification Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <div className="text-4xl font-thin text-yellow-400">{userStats.totalPoints}</div>
              </div>
              <div className="text-gray-400">Total Points</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-4xl font-thin text-purple-400">{userStats.xp}</div>
              </div>
              <div className="text-gray-400">XP</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-4xl font-thin text-blue-400">{userStats.level}</div>
              </div>
              <div className="text-gray-400">Level</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-4xl font-thin text-green-400">{userStats.maxScore}</div>
              </div>
              <div className="text-gray-400">Max Score</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-light mb-6 text-white">Level Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Level {userStats.level}</span>
              <span>{userStats.xp % 100}/100 XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(userStats.xp % 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-gray-400 text-sm">
              {100 - (userStats.xp % 100)} XP to next level
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-light mb-6 text-white">Earned Badges</h2>
          {badges.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="text-gray-500">No badges earned yet. Complete quizzes to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl">
                    🏆
                  </div>
                  <h3 className="font-medium text-white mb-2">{badge.name}</h3>
                  <p className="text-gray-400 text-sm">{badge.description}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    Earned: {badge.earnedAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz History */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <h2 className="text-2xl font-light mb-6 text-white flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past Quiz Results
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No quiz attempts yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-700/30"
                >
                  <div className="flex-1">
                    <h3 className="font-medium capitalize text-lg text-white mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {r.topic} Quiz
                    </h3>
                    <p className="text-gray-400 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Score: {r.score}/{r.totalQuestions} ({r.percentage}%)
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-700/50 px-3 py-1 rounded-xl">
                    {r.timestamp?.toDate().toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
