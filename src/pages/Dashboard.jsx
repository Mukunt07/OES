import { Link } from "react-router-dom";

export default function Dashboard() {
  const topics = [
    {
      name: "General Knowledge",
      code: "general",
      icon: "🧠",
      colors: "from-blue-400 to-indigo-500",
      border: "border-blue-300 dark:border-blue-600",
      info: "20 Questions",
      categoryId: 9
    },
    {
      name: "JavaScript",
      code: "javascript",
      icon: "💻",
      colors: "from-yellow-400 to-orange-500",
      border: "border-yellow-300 dark:border-yellow-600",
      info: "10 Questions"
    },
    {
      name: "Current Affairs",
      code: "current",
      icon: "📰",
      colors: "from-green-400 to-emerald-500",
      border: "border-green-300 dark:border-green-600",
      info: "Latest Questions"
    },
    {
      name: "Sports",
      code: "sports",
      icon: "⚽",
      colors: "from-red-400 to-orange-500",
      border: "border-red-300 dark:border-red-600",
      info: "Sports Trivia",
      categoryId: 21
    },
    {
      name: "Geography",
      code: "geography",
      icon: "🌍",
      colors: "from-teal-400 to-blue-500",
      border: "border-teal-300 dark:border-teal-600",
      info: "World Places",
      categoryId: 22
    },
    {
      name: "History",
      code: "history",
      icon: "📜",
      colors: "from-purple-400 to-pink-500",
      border: "border-purple-300 dark:border-purple-600",
      info: "Historical Trivia",
      categoryId: 23
    },
    {
      name: "Politics",
      code: "politics",
      icon: "🏛️",
      colors: "from-rose-500 to-red-600",
      border: "border-rose-300 dark:border-rose-600",
      info: "Political Trivia",
      categoryId: 24
    },
    {
      name: "Books",
      code: "books",
      icon: "📚",
      colors: "from-indigo-400 to-purple-500",
      border: "border-indigo-300 dark:border-indigo-600",
      info: "Literature Trivia",
      categoryId: 10
    },
    {
      name: "Movies",
      code: "movies",
      icon: "🎬",
      colors: "from-yellow-500 to-red-500",
      border: "border-yellow-400 dark:border-yellow-600",
      info: "Film Trivia",
      categoryId: 11
    },
    {
      name: "Music",
      code: "music",
      icon: "🎵",
      colors: "from-pink-400 to-purple-600",
      border: "border-pink-300 dark:border-pink-600",
      info: "Musical Knowledge",
      categoryId: 12
    },
    {
      name: "Science",
      code: "science",
      icon: "🔬",
      colors: "from-blue-500 to-cyan-500",
      border: "border-blue-300 dark:border-blue-600",
      info: "Science Questions",
      categoryId: 17
    },
    {
      name: "Computers",
      code: "computers",
      icon: "🖥️",
      colors: "from-gray-400 to-gray-700",
      border: "border-gray-400 dark:border-gray-600",
      info: "Tech & IT",
      categoryId: 18
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-4 sm:pt-8 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2 sm:mb-4">
            Choose Your Quiz Topic
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Test your knowledge and challenge yourself with our interactive quizzes
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {topics.map((t) => (
            <Link
              key={t.code}
              to={`/quiz/${t.code}`}
              className="
                group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg dark:shadow-gray-900/20
                border ${t.border}
                hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/30
                duration-300 ease-out cursor-pointer animate-fadeIn
                transform transition-all
              "
            >
              <div className="text-center">
                <div
                  className="
                    w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${t.colors}
                    rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto
                    mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300
                  "
                >
                  <span className="text-xl sm:text-2xl">{t.icon}</span>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 duration-300">
                  {t.name}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">{t.info}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
