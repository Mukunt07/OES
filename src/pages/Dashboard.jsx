import { Link } from "react-router-dom";
import {
  Brain,
  Code,
  Newspaper,
  Trophy,
  Globe,
  BookOpen,
  Building2,
  Book,
  Film,
  Music,
  Microscope,
  Monitor,
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const topics = [
    {
      name: "General Knowledge",
      code: "general",
      icon: Brain,
      colors: "from-blue-500 to-blue-600",
      info: "20 Questions",
      categoryId: 9
    },
    {
      name: "JavaScript",
      code: "javascript",
      icon: Code,
      colors: "from-yellow-500 to-yellow-600",
      info: "10 Questions"
    },
    {
      name: "Current Affairs",
      code: "current",
      icon: Newspaper,
      colors: "from-green-500 to-green-600",
      info: "Latest Questions"
    },
    {
      name: "Sports",
      code: "sports",
      icon: Trophy,
      colors: "from-orange-500 to-orange-600",
      info: "Sports Trivia",
      categoryId: 21
    },
    {
      name: "Geography",
      code: "geography",
      icon: Globe,
      colors: "from-teal-500 to-teal-600",
      info: "World Places",
      categoryId: 22
    },
    {
      name: "History",
      code: "history",
      icon: BookOpen,
      colors: "from-purple-500 to-purple-600",
      info: "Historical Trivia",
      categoryId: 23
    },
    {
      name: "Politics",
      code: "politics",
      icon: Building2,
      colors: "from-red-500 to-red-600",
      info: "Political Trivia",
      categoryId: 24
    },
    {
      name: "Books",
      code: "books",
      icon: Book,
      colors: "from-indigo-500 to-indigo-600",
      info: "Literature Trivia",
      categoryId: 10
    },
    {
      name: "Movies",
      code: "movies",
      icon: Film,
      colors: "from-pink-500 to-pink-600",
      info: "Film Trivia",
      categoryId: 11
    },
    {
      name: "Music",
      code: "music",
      icon: Music,
      colors: "from-rose-500 to-rose-600",
      info: "Musical Knowledge",
      categoryId: 12
    },
    {
      name: "Science",
      code: "science",
      icon: Microscope,
      colors: "from-cyan-500 to-cyan-600",
      info: "Science Questions",
      categoryId: 17
    },
    {
      name: "Computers",
      code: "computers",
      icon: Monitor,
      colors: "from-gray-500 to-gray-600",
      info: "Tech & IT",
      categoryId: 18
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-thin tracking-tight mb-6">
              Choose Your
              <span className="block font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Challenge
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Test your knowledge across diverse topics. Select a category and begin your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic, index) => {
            const IconComponent = topic.icon;
            return (
              <Link
                key={index}
                to={`/quiz/${topic.code}`}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 hover:bg-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/20"
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${topic.colors} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium text-white mb-2 group-hover:text-gray-200 transition-colors duration-300">
                    {topic.name}
                  </h3>

                  {/* Info */}
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {topic.info}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
