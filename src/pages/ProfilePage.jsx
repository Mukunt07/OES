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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-4 lg:p-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your profile & view quiz performance</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-gray-900/20 mb-4 sm:mb-6 lg:mb-8">

          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Display Name Editing */}
          <div className="mb-4 sm:mb-6">
            <label className="text-gray-600 dark:text-gray-400 font-medium">Display Name</label>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="mt-2 flex gap-2">
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">
                  Save
                </button>
              </form>
            ) : (
              <div className="mt-2 flex justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-gray-900 dark:text-gray-100">{displayName || "No Name Set"}</span>
                <button
                  className="text-blue-600 dark:text-blue-400"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4 sm:mb-6">
            <label className="text-gray-600 dark:text-gray-400 font-medium">Email</label>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl mt-2 text-gray-900 dark:text-gray-100">
              {user.email}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-gray-900/20 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Your Quiz Stats</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.quizzesTaken}</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Quizzes Taken</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.averageScore}%</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-gray-900/20 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Past Quiz Results</h2>

          {results.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No quiz attempts yet.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <h3 className="font-bold capitalize text-sm sm:text-base text-gray-800 dark:text-gray-200">{r.topic} Quiz</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Score: {r.score}/{r.totalQuestions} ({r.percentage}%)
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
