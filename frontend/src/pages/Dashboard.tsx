import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Trophy, Trash2 } from 'lucide-react';

interface College {
  id: number;
  name: string;
  location: string;
  ranking: number | null;
}

export default function Dashboard() {
  const [savedColleges, setSavedColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSavedColleges();
  }, [user, navigate]);

  const fetchSavedColleges = async () => {
    try {
      const res = await axios.get('/api/users/saved');
      setSavedColleges(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeCollege = async (collegeId: number) => {
    try {
      await axios.delete(`/api/users/saved/${collegeId}`);
      setSavedColleges(prev => prev.filter(c => c.id !== collegeId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user.name}</h1>
          <p className="text-slate-500">Manage your saved colleges and track your applications.</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-500" /> Your Saved Colleges
        </h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : savedColleges.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 border-dashed">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No saved colleges yet</h3>
            <p className="text-slate-500 mb-6">Start exploring colleges and save the ones you like.</p>
            <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
              Explore Colleges
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedColleges.map(college => (
              <div key={college.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-xl transition-shadow relative group">
                <button 
                  onClick={() => removeCollege(college.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/colleges/${college.id}`} className="flex-1">
                  <h3 className="text-lg font-bold mb-2 pr-8">{college.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                    <MapPin className="w-4 h-4" /> {college.location}
                  </div>
                  {college.ranking && (
                    <div className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      <Trophy className="w-3 h-3" /> Rank #{college.ranking}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
