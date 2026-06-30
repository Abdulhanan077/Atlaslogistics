'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { testimonials, Testimonial } from '@/lib/testimonials';
import { Star, MessageSquare, Plus, Send, CornerDownRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Reply {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface Review extends Testimonial {
  id: string;
  replies: Reply[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(() => {
    return testimonials.map((t, index) => {
      const id = `rev-${index}`;
      let replies: Reply[] = [];
      
      if (index === 0) {
        replies = [{
          id: 'rep-0',
          author: 'Atlas Compliance Operations',
          text: 'Thank you for the feedback, Marcus! Bypassing our channels to contact border control disrupts the manifest audit, which is why our strict anti-bypass policies are enforced. We are glad our platform-mediated pre-clearance cleared your cargo successfully.',
          date: ''
        }];
      } else if (index === 2) {
        replies = [{
          id: 'rep-2',
          author: 'Atlas Global Support',
          text: 'Thank you, David! We enforce cargo carriage regulations and direct bypass prohibitions to protect active manifest bonds. We appreciate your cooperation and patience throughout the customs clearance process.',
          date: ''
        }];
      } else if (index === 4) {
        replies = [{
          id: 'rep-4',
          author: 'Atlas Cargo Security',
          text: 'We appreciate the support, Harrison! Our sole custodian registration means port terminals coordinate exclusively through our certified agency. Thank you for utilizing the official platform for payment verification.',
          date: ''
        }];
      }
      return { ...t, id, replies };
    });
  });

  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    company: '',
    rating: 5,
    quote: ''
  });

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyAuthors, setReplyAuthors] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.quote) {
      toast.error('Please fill in your name and review quote.');
      return;
    }
    const createdReview: Review = {
      id: `rev-new-${Date.now()}`,
      name: newReview.name,
      role: newReview.role || 'Consignee',
      company: newReview.company || 'Independent Importer',
      img: `https://i.pravatar.cc/150?u=${Date.now()}`,
      rating: newReview.rating,
      quote: newReview.quote,
      replies: []
    };

    setReviews((prev) => [createdReview, ...prev]);
    setNewReview({ name: '', role: '', company: '', rating: 5, quote: '' });
    toast.success('Your review has been posted successfully!');
  };

  const handlePostReply = (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    const author = replyAuthors[reviewId]?.trim() || 'Atlas Staff';
    if (!text) {
      toast.error('Please enter reply text.');
      return;
    }

    const createdReply: Reply = {
      id: `rep-new-${Date.now()}`,
      author,
      text,
      date: 'Just now'
    };

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return { ...r, replies: [...r.replies, createdReply] };
        }
        return r;
      })
    );

    setReplyInputs((prev) => ({ ...prev, [reviewId]: '' }));
    setActiveReplyId(null);
    toast.success('Reply posted successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full pt-32 pb-24 px-4 lg:px-8 max-w-6xl mx-auto">
        {/* HERO */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Reviews</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Customer Reviews
          </h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            Read transparent reviews from global importers, exporters, and logistics partners, or share your own shipping experience with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: LEAVE A REVIEW FORM */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Leave a Review
              </h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    placeholder="Jane Doe"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Title / Role</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    placeholder="Operations Manager"
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    placeholder="Acme Corporation"
                    value={newReview.company}
                    onChange={(e) => setNewReview({ ...newReview, company: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Star Rating</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Poor)</option>
                    <option value={1}>1 Star (Terrible)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Review</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-xs leading-relaxed"
                    placeholder="Describe how Atlas handled your shipments, telemetry tracking, or customs clearance..."
                    value={newReview.quote}
                    onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl py-4 font-black text-sm tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Post Review
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: REVIEWS FEED */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4 mb-2">
              Reviews Feed ({reviews.length})
            </h3>

            {reviews.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-md space-y-6 hover:border-slate-300 transition-all">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-slate-900 font-black text-sm tracking-tight truncate">{item.name}</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider truncate">
                        {item.role} <span className="text-blue-600 font-black">{item.company}</span>
                      </p>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Quote */}
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  {item.quote}
                </p>

                {/* Nested Replies */}
                {item.replies.length > 0 && (
                  <div className="space-y-4 pl-4 md:pl-6 border-l-2 border-slate-100 mt-4">
                    {item.replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 flex gap-3 items-start">
                        <CornerDownRight className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-black text-xs">{reply.author}</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-wider select-none">Staff</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed mt-1">
                            {reply.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Form Trigger */}
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {item.replies.length} replies
                  </span>
                  <button
                    onClick={() => setActiveReplyId(activeReplyId === item.id ? null : item.id)}
                    className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>

                {/* Active Reply Editor */}
                {activeReplyId === item.id && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 mt-4">
                    <div className="flex gap-4">
                      <div className="space-y-1 flex-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Your Name / Agent Role</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-xs"
                          placeholder="Atlas Compliance Staff"
                          value={replyAuthors[item.id] || ''}
                          onChange={(e) => setReplyAuthors({ ...replyAuthors, [item.id]: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Write Reply</label>
                      <textarea
                        rows={2}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-xs leading-relaxed"
                        placeholder="Write a response to this customer..."
                        value={replyInputs[item.id] || ''}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [item.id]: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePostReply(item.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
