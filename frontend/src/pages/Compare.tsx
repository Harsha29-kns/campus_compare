import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Plus, X, IndianRupee, Trophy, Briefcase, Building2, ChevronDown, ArrowRight, GraduationCap } from 'lucide-react';

interface College {
  id: number;
  name: string;
  location: string;
  feesPerYear: number | null;
  ranking: number | null;
  averagePlacementPct: number | null;
  highestPackageLpa: number | null;
  averagePackageLpa: number | null;
  studentFacultyRatio: number | null;
  course: string | null;
}

export default function Compare() {
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparedColleges, setComparedColleges] = useState<College[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get('/api/colleges').then(res => setAllColleges(res.data));
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      axios.get(`/api/colleges/compare?ids=${selectedIds.join(',')}`).then(res => {
        setComparedColleges(res.data);
      });
    } else {
      setComparedColleges([]);
    }
  }, [selectedIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCollege = (id: number) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
    setSearch('');
    setShowDropdown(false);
  };

  const removeCollege = (id: number) => {
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const filteredColleges = allColleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) && !selectedIds.includes(c.id)
  );

  return (
    <div className="relative min-h-[80vh] space-y-12 animate-in fade-in duration-700">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="text-center space-y-6 pt-12 pb-4">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 tracking-tight">
          Head-to-Head Comparison
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Make an informed decision. Select up to 3 colleges to compare their rankings, placements, and fees in detail.
        </p>
      </div>

      {/* Modern Search/Select UI */}
      <div className="max-w-3xl mx-auto relative z-20" ref={dropdownRef}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 w-6 h-6" />
            <input 
              type="text" 
              placeholder={selectedIds.length >= 3 ? "Maximum of 3 colleges selected" : "Search or pick a college from the list..."} 
              className="w-full pl-16 pr-14 py-5 bg-transparent focus:outline-none text-lg font-medium placeholder-slate-400 dark:text-white"
              value={search}
              onFocus={() => setShowDropdown(true)}
              onChange={e => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              disabled={selectedIds.length >= 3}
            />
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-2"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={selectedIds.length >= 3}
            >
              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {showDropdown && selectedIds.length < 3 && (
          <div className="absolute w-full mt-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
            {filteredColleges.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                <Search className="w-8 h-8 opacity-20" />
                <p>No colleges found matching "{search}"</p>
              </div>
            ) : (
              filteredColleges.map(college => (
                <button 
                  key={college.id}
                  onClick={() => addCollege(college.id)}
                  className="w-full text-left px-6 py-4 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 flex justify-between items-center transition-all border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{college.name}</p>
                      <p className="text-sm text-slate-500">{college.location}</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {comparedColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {comparedColleges.map((college, index) => (
            <div 
              key={college.id} 
              className="relative group bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Header Background */}
              <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative flex justify-center items-center">
                <button 
                  onClick={() => removeCollege(college.id)} 
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500 hover:text-white transition-colors backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute -bottom-10 w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-950 transform group-hover:rotate-6 transition-transform duration-500">
                  <GraduationCap className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pt-14 pb-8 flex-1 flex flex-col items-center text-center">
                <Link to={`/colleges/${college.id}`} className="text-xl font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors mb-1 line-clamp-2">
                  {college.name}
                </Link>
                <p className="text-sm font-medium text-slate-500 mb-8">{college.location}</p>

                <div className="w-full space-y-4">
                  {/* Feature Row */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Ranking
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {college.ranking ? `#${college.ranking}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <IndianRupee className="w-4 h-4 text-emerald-500" /> Fees / Year
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {college.feesPerYear ? `₹${college.feesPerYear.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Placement
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {college.averagePlacementPct ? `${college.averagePlacementPct}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium ml-6">Avg Package</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {college.averagePackageLpa ? `${college.averagePackageLpa} LPA` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-500 font-medium ml-6">High Package</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {college.highestPackageLpa ? `${college.highestPackageLpa} LPA` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 w-full">
                  <Link to={`/colleges/${college.id}`} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                    View Full Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {comparedColleges.length < 3 && (
            <div className="hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 min-h-[500px]">
              <Plus className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">Add another college to compare</p>
            </div>
          )}
        </div>
      ) : (
        <div className="pt-20 pb-32 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10" />
          </div>
          <p className="text-xl font-medium">Select colleges from the search above to begin comparing.</p>
        </div>
      )}
    </div>
  );
}
