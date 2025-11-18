import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");

  const topics = ["all", "javascript", "general", "current"];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let q;
        if (selectedTopic === "all") {
          q = query(
            collection(db, "leaderboard"),
            orderBy("percentage", "desc"),
            orderBy("score", "desc"),
            orderBy("timestamp", "desc"),
            limit(20)
          );
        } else {
          q = query(
            collection(db, "leaderboard"),
            where("topic", "==", selectedTopic),
            orderBy("percentage", "desc"),
            orderBy("score", "desc"),
            orderBy("timestamp", "desc"),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data(),
        }));
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTopic]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600">Top performers across all quizzes</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic === "all" ? "All Topics" : topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Top 20 Players</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Percentage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => <SkeletonRow key={index} />)
                ) : leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg font-medium mb-2">No results yet</div>
                      <div className="text-sm">Be the first to take a quiz!</div>
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((entry) => {
                    const isCurrentUser = entry.userId === auth.currentUser?.uid;
                    return (
                      <tr
                        key={entry.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          isCurrentUser ? "bg-gradient-to-r from-blue-50 to-purple-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {entry.rank === 1 && "🥇"}
                          {entry.rank === 2 && "🥈"}
                          {entry.rank === 3 && "🥉"}
                          {entry.rank > 3 && entry.rank}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {entry.displayName}
                          {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{entry.topic}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.score}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.percentage}%</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(entry.timestamp)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
