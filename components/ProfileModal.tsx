'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

    interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  highestStreak: number;
  clientCount?: number;
  clientHighestStreak?: number;
}

export default function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch(`/api/users/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500/20 to-brand-primary/20" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="pt-12 pb-8 px-6 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                  {user?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <>
              <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6">
                {user.role}
              </p>

              <div className="w-full space-y-3">
                {user.role !== 'TRAINER' && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Streak</p>
                        <p className="text-white font-mono font-bold text-lg">{user.highestStreak} Days</p>
                      </div>
                    </div>
                    {user.highestStreak >= 5 && <span className="text-xl">🔥</span>}
                  </div>
                )}

                {user.role === 'TRAINER' && typeof user.clientCount === 'number' && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🤝</span>
                        <div className="text-left">
                          <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-wider">Clients Guided</p>
                          <p className="text-white font-mono font-bold text-lg">{user.clientCount} People</p>
                        </div>
                      </div>
                      <span className="text-xl">⭐</span>
                    </div>

                    {typeof user.clientHighestStreak === 'number' && user.clientHighestStreak > 0 && (
                      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚡</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-brand-primary/60 uppercase tracking-wider">Best Client Streak</p>
                            <p className="text-white font-mono font-bold text-lg">{user.clientHighestStreak} Days</p>
                          </div>
                        </div>
                        <span className="text-xl">🔥</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm py-8">User profile not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
