import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, IndianRupee, Trophy, Building, Briefcase, BookOpen, MessageSquare, Send, CheckCircle2, Star } from 'lucide-react';

interface UserInfo {
  name: string;
}

interface Answer {
  id: string;
  content: string;
  user: UserInfo;
  createdAt: string;
}

interface Discussion {
  id: string;
  question: string;
  user: UserInfo;
  answers: Answer[];
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: UserInfo;
  createdAt: string;
}

interface CollegeDetail {
  id: number;
  name: string;
  location: string;
  state: string;
  yearEstablished: number | null;
  type: string | null;
  mode: string | null;
  course: string | null;
  durationYears: number | null;
  feesPerYear: number | null;
  entranceExam: string | null;
  cutoffRank: number | null;
  averagePlacementPct: number | null;
  highestPackageLpa: number | null;
  averagePackageLpa: number | null;
  livingCostPerMonth: number | null;
  hostelAvailability: boolean | null;
  studentFacultyRatio: number | null;
  ranking: number | null;
  source: string | null;
  discussions: Discussion[];
  reviews: Review[];
}

export default function CollegeDetails() {
  const { id } = useParams<{ id: string }>();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswers, setNewAnswers] = useState<{ [key: string]: string }>({});
  
  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCollege = async () => {
    try {
      const res = await axios.get(`/api/colleges/${id}`);
      setCollege(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCollege();
  }, [id]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !id) return;
      try {
        const res = await axios.get('/api/users/saved');
        const isSaved = res.data.some((c: any) => c.id === Number(id));
        setSaved(isSaved);
      } catch (err) {
        console.error("Could not check saved status", err);
      }
    };
    checkIfSaved();
  }, [id, user]);

  const handleSaveCollege = async () => {
    if (!user) return navigate('/login');
    try {
      await axios.post('/api/users/saved', { collegeId: Number(id) });
      setSaved(true);
    } catch (err) {
      console.error("Could not save college", err);
    }
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!newQuestion.trim()) return;
    try {
      await axios.post('/api/discussions', { collegeId: Number(id), question: newQuestion });
      setNewQuestion('');
      fetchCollege();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent, discussionId: string) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    const answerContent = newAnswers[discussionId];
    if (!answerContent?.trim()) return;
    try {
      await axios.post(`/api/discussions/${discussionId}/answers`, { content: answerContent });
      setNewAnswers(prev => ({ ...prev, [discussionId]: '' }));
      fetchCollege();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!reviewComment.trim()) return;
    try {
      await axios.post('/api/reviews', { collegeId: Number(id), rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      fetchCollege();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;
  if (!college) return <div className="py-20 text-center text-slate-500">College not found</div>;

  const averageRating = college.reviews?.length 
    ? (college.reviews.reduce((acc, curr) => acc + curr.rating, 0) / college.reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              {college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {college.location}, {college.state}</span>
              {college.yearEstablished && (
                <span className="flex items-center gap-1"><Building className="w-4 h-4" /> Est. {college.yearEstablished}</span>
              )}
              {college.type && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium uppercase">{college.type}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            {averageRating && (
              <div className="flex items-center gap-1 justify-end text-amber-500 font-bold text-xl mb-1">
                <Star className="w-6 h-6 fill-current" /> {averageRating} <span className="text-sm font-medium text-slate-400">/ 5</span>
              </div>
            )}
            {college.ranking && (
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-500/20 font-bold shadow-sm">
                <Trophy className="w-5 h-5" /> NIRF Rank: #{college.ranking}
              </div>
            )}
            <button 
              onClick={handleSaveCollege}
              disabled={saved}
              className={`flex justify-center items-center gap-2 px-6 py-2 rounded-xl font-medium shadow-lg transition-all ${saved ? 'bg-emerald-500 text-white cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'}`}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : 'Save College'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Academic Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Offered Course</p>
                  <p className="font-semibold text-lg">{college.course || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Duration</p>
                  <p className="font-semibold text-lg">{college.durationYears ? `${college.durationYears} Years` : 'N/A'} ({college.mode})</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Entrance Exam</p>
                  <p className="font-semibold text-lg">{college.entranceExam || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Cutoff Rank</p>
                  <p className="font-semibold text-lg">{college.cutoffRank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Student-Faculty Ratio</p>
                  <p className="font-semibold text-lg">{college.studentFacultyRatio ? `${college.studentFacultyRatio}:1` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Q&A Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Q&A Discussions
            </h2>
            
            <form onSubmit={handlePostQuestion} className="mb-8 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask a question about this college..." 
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                Ask
              </button>
            </form>

            <div className="space-y-6">
              {college.discussions?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No questions asked yet. Be the first!</p>
              ) : (
                college.discussions?.map(disc => (
                  <div key={disc.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{disc.question}</p>
                    <p className="text-xs text-slate-500 mb-4">Asked by {disc.user.name}</p>
                    
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mb-4">
                      {disc.answers.map(ans => (
                        <div key={ans.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{ans.content}</p>
                          <p className="text-xs text-slate-400 mt-1">&mdash; {ans.user.name}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={(e) => handlePostAnswer(e, disc.id)} className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Write an answer..." 
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newAnswers[disc.id] || ''}
                        onChange={e => setNewAnswers({ ...newAnswers, [disc.id]: e.target.value })}
                      />
                      <button type="submit" className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" /> Student Reviews
            </h2>

            <form onSubmit={handlePostReview} className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Write a Review</label>
                  <textarea 
                    rows={2}
                    placeholder="Share your experience..." 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-amber-500 text-white px-6 py-2 h-11 rounded-xl hover:bg-amber-600 transition-colors font-medium">
                  Submit
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {college.reviews?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No reviews yet. Be the first to review!</p>
              ) : (
                college.reviews?.map(review => (
                  <div key={review.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 dark:text-white">{review.user.name}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl shadow-lg text-white">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <IndianRupee className="w-5 h-5" /> Fee Structure
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-indigo-100 mb-1">Tuition Fees</p>
                <p className="text-3xl font-extrabold">₹{college.feesPerYear?.toLocaleString()}</p>
                <p className="text-sm text-indigo-200">per year</p>
              </div>
              <hr className="border-indigo-400/30" />
              <div>
                <p className="text-indigo-100 mb-1">Living Cost</p>
                <p className="text-xl font-bold">₹{college.livingCostPerMonth?.toLocaleString()}</p>
                <p className="text-sm text-indigo-200">per month (approx)</p>
              </div>
              <hr className="border-indigo-400/30" />
              <div className="flex justify-between items-center">
                <p className="text-indigo-100">Hostel Available</p>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {college.hostelAvailability ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-emerald-500" /> Placements
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Placement Rate</p>
                <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{college.averagePlacementPct}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Highest Package</p>
                <p className="font-bold text-lg">{college.highestPackageLpa ? `${college.highestPackageLpa} LPA` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Average Package</p>
                <p className="font-bold text-lg">{college.averagePackageLpa ? `${college.averagePackageLpa} LPA` : 'N/A'}</p>
              </div>
            </div>
          </section>

          {college.source && (
            <a href={college.source} target="_blank" rel="noreferrer" className="block text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium hover:shadow-sm transition-all">
              Visit Official Website &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
