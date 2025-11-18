import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar({ theme, toggleTheme }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (location.pathname === "/" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-black/80 via-gray-900/60 to-black/80 backdrop-blur-2xl shadow-2xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-300 tracking-tight animate-pulse"
            >
              OES
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-gray-800/50 text-sm lg:text-base"
            >
              Dashboard
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-200"></span>
            </Link>
            <Link
              to="/quiz/javascript"
              className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-gray-800/50 text-sm lg:text-base"
            >
              Quiz
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-200"></span>
            </Link>
            <Link
              to="/profile"
              className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-gray-800/50 text-sm lg:text-base"
            >
              Profile
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-200"></span>
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-gray-800/50 text-sm lg:text-base"
            >
              Leaderboard
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-200"></span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-800/80 text-gray-300 hover:bg-gray-700/90 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md backdrop-blur-sm ml-2"
              aria-label="Toggle theme"
            >
              <div className={`transform transition-transform duration-500 ${theme === 'light' ? 'rotate-0' : 'rotate-180'}`}>
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 lg:px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base font-medium ml-2"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700/90 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              <div className={`transform transition-transform duration-500 ${theme === 'light' ? 'rotate-0' : 'rotate-180'}`}>
                {theme === 'light' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700/90 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md backdrop-blur-sm"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 backdrop-blur-2xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/quiz/javascript"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Quiz
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/leaderboard"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <div className="pt-2 border-t border-gray-800/50">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
