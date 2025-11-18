import { Link } from "react-router-dom";

export default function Dashboard() {
  const topics = [
    {
      name: "General Knowledge",
      code: "general",
      icon: "GK",
      colors: "from-blue-400 to-indigo-500",
      border: "border-blue-300",
      info: "20 Questions"
    },
    {
      name: "JavaScript",
      code: "javascript",
      icon: "JS",
      colors: "from-yellow-400 to-orange-500",
      border: "border-yellow-300",
      info: "10 Questions"
    },
    {
      name: "Current Affairs",
      code: "current",
      icon: "CA",
      colors: "from-green-400 to-emerald-500",
      border: "border-green-300",
      info: "Latest Questions"
    },
    // NEW API TOPICS
    {
      name: "Sports",
      code: "sports",
      icon: "SP",
      colors: "from-red-400 to-orange-500",
      border: "border-red-300",
      info: "Sports Trivia"
    },
    {
      name: "Geography",
      code: "geography",
      icon: "GE",
      colors: "from-teal-400 to-blue-500",
      border: "border-teal-300",
      info: "World Places"
    },
    {
      name: "History",
      code: "history",
      icon: "HI",
      colors: "from-purple-400 to-pink-500",
      border: "border-purple-300",
      info: "Historical Trivia"
    },
    {
      name: "Politics",
      code: "politics",
      icon: "PO",
      colors: "from-rose-500 to-red-600",
      border: "border-rose-300",
      info: "Political Trivia"
    },
    {
      name: "Books",
      code: "books",
      icon: "BK",
      colors: "from-indigo-400 to-purple-500",
      border: "border-indigo-300",
      info: "Literature Trivia"
    },
    {
      name: "Movies",
      code: "movies",
      icon: "MV",
      colors: "from-yellow-500 to-red-500",
      border: "border-yellow-400",
      info: "Film Trivia"
    },
    {
      name: "Music",
      code: "music",
      icon: "MU",
      colors: "from-pink-400 to-purple-600",
      border: "border-pink-300",
      info: "Musical Knowledge"
    },
    {
      name: "Science",
      code: "science",
      icon: "SC",
      colors: "from-blue-500 to-cyan-500",
      border: "border-blue-300",
      info: "Science Questions"
    },
    {
      name: "Computers",
      code: "computers",
      icon: "CP",
      colors: "from-gray-400 to-gray-700",
      border: "border-gray-400",
      info: "Tech & IT"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-8 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Page Title */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Choose Your Quiz Topic
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge and challenge yourself with our interactive quizzes
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {topics.map((t) => (
            <Link
              key={t.code}
              to={`/quiz/${t.code}`}
              className={`
                group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl 
                border ${t.border}
                hover:scale-[1.05] hover:shadow-2xl 
                duration-300 ease-out cursor-pointer animate-fadeIn
              `}
            >
              <div className="text-center">
                <div
                  className={`
                    w-16 h-16 bg-gradient-to-r ${t.colors}
                    rounded-2xl flex items-center justify-center mx-auto
                    mb-4 group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <span className="text-2xl font-bold text-white">{t.icon}</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 duration-300">
                  {t.name}
                </h2>
                <p className="text-gray-600">{t.info}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
