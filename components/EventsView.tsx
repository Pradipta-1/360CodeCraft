"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import CreateEventModal from "./CreateEventModal";
import EditEventModal from "./EditEventModal";
import ProfileModal from "./ProfileModal";

type Event = {
  id: string;
  title: string;
  sportType: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  timeRange: string | null;
  participantLimit: number;
  description: string;
  isParticipating: boolean;
  isOrganizer: boolean;
  organizer: { id: string; name: string };
  participants: { id: string; name: string; avatarUrl?: string | null }[];
  trainerParticipants: { id: string; name: string; avatarUrl?: string | null }[];
};

type Props = {
  role: "USER" | "TRAINER" | "ORGANIZER";
};

export default function EventsView({ role }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [viewingParticipants, setViewingParticipants] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await apiFetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId: string) => {
    setJoiningId(eventId);
    try {
      const res = await apiFetch(`/api/events/${eventId}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents(); // Refresh to update participation status
      } else {
        alert(data.error || "Failed to join event");
      }
    } catch (err) {
      console.error("Join error:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button for Trainers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Fitness Events</h1>
          <p className="text-slate-400 mt-1">Discover, join, and participate in community sports events.</p>
        </div>
        {role === "TRAINER" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Event
          </button>
        )}
      </div>

      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-300"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={enlargedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-slate-400">Finding upcoming events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-3xl">
          <p className="text-slate-400 text-lg">No events found yet. Be the first to start one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {events.map((event) => {
            const totalParticipants = (event.participants?.length || 0) + (event.trainerParticipants?.length || 0);
            const isFull = totalParticipants >= event.participantLimit;

            return (
              <div
                key={event.id}
                className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 hover:translate-y-[-4px] flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    {event.sportType}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {totalParticipants}/{event.participantLimit} Participants
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
                  {event.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.startDate ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}` : "Date TBD"}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.timeRange || "Time TBD"}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Placeholder for participant avatars */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        P{i}
                      </div>
                    ))}
                    {totalParticipants > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                        +{totalParticipants - 3}
                      </div>
                    )}
                  </div>

                  {event.isOrganizer ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingParticipants(event)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 transition-all text-sm"
                      >
                        Participants
                      </button>
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  ) : event.isParticipating ? (
                    <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Joined
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(event.id)}
                      disabled={isFull || joiningId === event.id}
                      className="px-6 py-2 bg-slate-800 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:bg-slate-900"
                    >
                      {joiningId === event.id ? "Joining..." : isFull ? "Full" : "Join Event"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Participant List View for Organizers */}
      {viewingParticipants && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{viewingParticipants.title}</h2>
                <p className="text-sm text-slate-400">Participant List</p>
              </div>
              <button onClick={() => setViewingParticipants(null)} className="text-slate-400 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
              {viewingParticipants.participants.length === 0 && viewingParticipants.trainerParticipants.length === 0 ? (
                <p className="text-center text-slate-500 py-8 italic">No participants have joined yet.</p>
              ) : (
                <>
                  {viewingParticipants.trainerParticipants.map(tp => (
                    <div key={tp.id} className="flex items-center justify-between p-3 bg-slate-950/50 border border-emerald-500/20 rounded-xl">
                      <button 
                        onClick={() => setProfileUserId(tp.id)}
                        className="flex items-center gap-3 text-white font-medium hover:text-emerald-400 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ring-1 ring-emerald-500/20">
                          {tp.avatarUrl ? <img src={tp.avatarUrl} alt={tp.name} className="w-full h-full object-cover" /> : tp.name.charAt(0)}
                        </div>
                        {tp.name}
                      </button>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Trainer</span>
                    </div>
                  ))}
                  {viewingParticipants.participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center group/p">
                      <button 
                        onClick={() => setProfileUserId(p.id)}
                        className="flex items-center gap-3 text-white font-medium hover:text-emerald-400 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold overflow-hidden ring-1 ring-slate-700/50">
                          {p.avatarUrl ? <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                        </div>
                        {p.name}
                      </button>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-2">Member</span>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setViewingParticipants(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Event */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
      />

      <EditEventModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={fetchEvents}
      />

      {profileUserId && (
        <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  );
}
