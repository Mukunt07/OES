import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, where, getDocs, collectionGroup, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const topics = ["all", "javascript", "general", "current", "sports", "geography", "history", "politics", "books", "movies", "music", "science", "computers"];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let q;
        if (selectedTopic === "all") {
          q = query(
            collectionGroup(db, "results"),
            orderBy("percentage", "desc"),
            orderBy("score", "desc"),
            orderBy("createdAt", "desc"),
            limit(20)
          );
        } else {
          q = query(
            collectionGroup(db, "results"),
            where("topic", "==", selectedTopic),
            orderBy("percentage", "desc"),
            orderBy("score", "desc"),
            orderBy("createdAt", "desc"),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.ref.parent.parent.id, // Extract uid from path
          ...doc.data(),
        }));

        // Batch fetch user docs for displayName/email
        const uids = [...new Set(results.map(r => r.uid))];
        const userPromises = uids.map(uid => getDoc(doc(db, "users", uid)));
        const userDocs = await Promise.all(userPromises);
        const userMap = {};
        userDocs.forEach((userDoc, index) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userMap[uids[index]] = {
              displayName: userData.name || userData.email.split('@')[0],
              email: userData.email
            };
          }
        });

        // Combine results with user data
        const data = results.map((result, index) => ({
          id: result.id,
          rank: index + 1,
          ...result,
          displayName: userMap[result.uid]?.displayName || userMap[result.uid]?.email || "Anonymous",
          email: userMap[result.uid]?.email || "",
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
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarLetter = (displayName, email) => {
    return (displayName !== "Anonymous" ? displayName : email).charAt(0).toUpperCase();
  };

  const filteredData = leaderboardData.filter(entry =>
    entry.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-thin tracking-tight mb-4 text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Top performers across all quizzes</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-blue-500 transition-colors w-64"
            />
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-6 py-3 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic} className="bg-white dark:bg-gray-800">
                {topic === "all" ? "All Topics" : topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-center justify-center">
            <svg className="w-8 h-8 mr-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-light text-white">Top 20 Players</h2>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-6 border-b border-gray-800 animate-pulse">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="h-8 w-8 bg-gray-700 rounded"></div>
                    <div className="h-5 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : leaderboardData.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-lg font-medium mb-2">No results yet</div>
                <div className="text-sm">Be the first to take a quiz!</div>
              </div>
            ) : (
              leaderboardData.map((entry) => {
                const isCurrentUser = entry.userId === auth.currentUser?.uid;
                return (
                  <div
                    key={entry.id}
                    className={`p-6 border-b border-gray-800 hover:bg-gray-800/30 transition-colors duration-300 ${
                      isCurrentUser ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-white">
                          {entry.rank === 1 && "🥇"}
                          {entry.rank === 2 && "🥈"}
                          {entry.rank === 3 && "🥉"}
                          {entry.rank > 3 && `#${entry.rank}`}
                        </span>
                        <span className="font-medium text-white">
                          {entry.displayName}
                          {isCurrentUser && <span className="ml-3 text-sm text-blue-400">(You)</span>}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 capitalize bg-gray-700/50 px-3 py-1 rounded-xl">
                        {entry.topic}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        Score: <span className="font-medium text-white">{entry.score}</span>
                      </span>
                      <span className="text-gray-400">
                        {entry.percentage}%
                      </span>
                      <span className="text-gray-400">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Percentage</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
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
                        className={`hover:bg-gray-800/30 transition-colors duration-300 ${
                          isCurrentUser ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {entry.rank === 1 && "🥇"}
                          {entry.rank === 2 && "🥈"}
                          {entry.rank === 3 && "🥉"}
                          {entry.rank > 3 && entry.rank}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {entry.displayName}
                          {isCurrentUser && <span className="ml-3 text-sm text-blue-400">(You)</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 capitalize">{entry.topic}</td>
                        <td className="px-6 py-4 text-sm text-white">{entry.score}</td>
                        <td className="px-6 py-4 text-sm text-white">{entry.percentage}%</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(entry.timestamp)}</td>
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
