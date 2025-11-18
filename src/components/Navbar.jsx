import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
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
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">OES</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                OES
              </span>
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
