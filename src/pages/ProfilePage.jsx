import { useState, useEffect } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: Quiz History State
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
  });

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || "");

        // Fetch quiz history
        await loadUserResults(user.uid);
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

        {/* Stats Card */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-light mb-6 text-white">Your Quiz Stats</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-4xl font-thin text-blue-400">{stats.quizzesTaken}</div>
              </div>
              <div className="text-gray-400">Quizzes Taken</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-4xl font-thin text-green-400">{stats.averageScore}%</div>
              </div>
              <div className="text-gray-400">Average Score</div>
            </div>
          </div>
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
