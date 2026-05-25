import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Trophy, Building2, Search, BookOpen, Map as MapIcon, Grid } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Fix Leaflet's default icon path issues
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface College {
  id: number;
  name: string;
  location: string;
  feesPerYear: number | null;
  ranking: number | null;
  averagePlacementPct: number | null;
  latitude: number | null;
  longitude: number | null;
}

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [course, setCourse] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    // Fetch all colleges once to extract unique locations and courses
    axios.get('/api/colleges').then(res => {
      const locations = Array.from(new Set(res.data.map((c: College) => c.location))).sort();
      const courses = Array.from(new Set(res.data.map((c: College) => c.course).filter(Boolean))).sort();
      setAllLocations(locations as string[]);
      setAllCourses(courses as string[]);
    });
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axios.get('/api/colleges', {
        params: { search, location, maxFees, course }
      });
      setColleges(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [search, location, maxFees, course]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 🌟 Animated Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden rounded-b-[3rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 dark:from-indigo-950 dark:via-slate-950 dark:to-purple-950 z-0"></div>
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex justify-center gap-4 mb-6"
          >
            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-medium backdrop-blur-md flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Top Colleges
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-purple-200 text-sm font-medium backdrop-blur-md flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> 100% Free
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight"
          >
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dream College</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto"
          >
            Search, compare, and read verified student reviews to find the perfect fit for your future.
          </motion.p>
        </div>
      </section>

      {/* 🔍 Floating Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-6xl mx-auto px-4 -mt-24 relative z-20"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-slate-700/50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 h-5 w-5 transition-transform group-focus-within:scale-110" />
            <input 
              type="text" 
              placeholder="Search colleges by name..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 h-5 w-5 z-10 transition-transform group-focus-within:scale-110" />
            <select 
              className="w-full pl-12 pr-10 py-4 rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-200"
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div className="w-full md:w-56 relative group">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 h-5 w-5 z-10 transition-transform group-focus-within:scale-110" />
            <select 
              className="w-full pl-12 pr-10 py-4 rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-pink-500 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-200"
              value={course}
              onChange={e => setCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48 relative group">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 h-5 w-5 transition-transform group-focus-within:scale-110" />
            <input 
              type="number" 
              placeholder="Max Fees..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium placeholder:text-slate-400"
              value={maxFees}
              onChange={e => setMaxFees(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 🎛️ Animated View Toggle */}
        <div className="flex justify-end mb-8">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl inline-flex relative shadow-inner">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[110px] bg-white dark:bg-slate-700 rounded-xl shadow-sm z-0"
              initial={false}
              animate={{ left: viewMode === 'grid' ? '6px' : '122px' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button 
              onClick={() => setViewMode('grid')}
              className={`relative z-10 flex items-center justify-center gap-2 w-[110px] py-2.5 rounded-xl font-bold transition-colors ${viewMode === 'grid' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Grid className="w-4 h-4" /> Grid
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`relative z-10 flex items-center justify-center gap-2 w-[110px] py-2.5 rounded-xl font-bold transition-colors ${viewMode === 'map' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
        </div>

        {/* 🏢 Content Area */}
        {viewMode === 'grid' ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {colleges.map(college => (
              <motion.div key={college.id} variants={cardVariants} className="h-full">
                <Link to={`/colleges/${college.id}`} className="group block h-full">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative">
                    <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-black/10 transition-all">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-24 w-24 text-white/40 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" />
                      </div>
                      {college.ranking && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-extrabold flex items-center gap-1.5 text-yellow-600 shadow-lg">
                          <Trophy className="h-4 w-4" /> #{college.ranking}
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1 relative bg-white dark:bg-slate-900 z-10">
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                        {college.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        <MapPin className="h-4 w-4 text-red-400" />
                        <span>{college.location}</span>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Fees / Year</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {college.feesPerYear ? `₹${college.feesPerYear.toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Placement</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            {college.averagePlacementPct ? `${college.averagePlacementPct}%` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {colleges.length === 0 && (
              <div className="col-span-full py-32 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">No colleges found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search criteria to discover more institutions.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-200 dark:border-slate-800 h-[700px] relative z-0"
          >
            <MapContainer center={[22.5937, 78.9629]} zoom={5} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {colleges.filter(c => c.latitude && c.longitude).map(college => (
                <Marker key={college.id} position={[college.latitude!, college.longitude!]}>
                  <Popup className="custom-popup rounded-2xl overflow-hidden">
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{college.name}</h3>
                      <p className="text-slate-500 flex items-center gap-1 text-sm mb-3">
                        <MapPin className="w-3 h-3" /> {college.location}
                      </p>
                      {college.feesPerYear && (
                        <p className="text-sm mb-1"><span className="font-semibold text-slate-700">Fees:</span> ₹{college.feesPerYear.toLocaleString()}</p>
                      )}
                      {college.averagePlacementPct && (
                        <p className="text-sm mb-3"><span className="font-semibold text-slate-700">Placement:</span> {college.averagePlacementPct}%</p>
                      )}
                      <Link to={`/colleges/${college.id}`} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
