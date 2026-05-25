import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                CampusCompa
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to='/' className='text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-medium transition-colors'>Home</Link>
            <Link to="/compare" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-medium transition-colors">
              Compare
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-1">
                  <UserIcon className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-medium transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-600/20">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
