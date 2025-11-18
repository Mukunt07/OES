import { useState, useEffect } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || "");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      setEditing(false);
      // Refresh user data
      setUser({ ...auth.currentUser });
    } catch (error) {
      alert(error.message);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h2>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 animate-fadeIn">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8">
          {/* Avatar */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your display name"
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(user.displayName || "");
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-800 font-medium">
                    {user.displayName || "No display name set"}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-800 font-medium">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created
              </label>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-800 font-medium">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Sign In
              </label>
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-800 font-medium">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/dashboard"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Quizzes Taken</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
