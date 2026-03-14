"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

type Thread = {
  partner: { id: string; name: string | null; avatarUrl?: string | null; isEvent?: boolean; role?: string } | null;
  lastMessage: string;
  updatedAt: string;
  type?: "direct" | "event";
  eventId?: string;
};

type Message = {
  id: string;
  senderId: string;
  sender: { id: string; name: string };
  receiverId?: string | null;
  eventId?: string | null;
  content: string;
  imageUrl?: string | null;
  isSystem?: boolean;
  createdAt: string;
};

export default function MessagesView() {
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [partnerNameOverride, setPartnerNameOverride] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newContent, setNewContent] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true);
    setError(null);
    try {
      const res = await apiFetch("/api/messages/threads");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load threads");
      setThreads(data.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load threads");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/messages/with/${userId}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load messages");
      setMessages(data.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    // Fetch current user profile
    apiFetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCurrentUser(data.data);
      })
      .catch(() => {});
  }, [fetchThreads]);

  // Open conversation from URL ?with=userId
  useEffect(() => {
    if (withUserId) {
      setSelectedUserId(withUserId);
      setPartnerNameOverride(null);
    }
  }, [withUserId]);

  useEffect(() => {
    if (selectedUserId) fetchMessages(selectedUserId);
    else setMessages([]);
  }, [selectedUserId, fetchMessages]);

  // Resolve partner name when opening a new conversation (user not in threads yet)
  useEffect(() => {
    if (!selectedUserId) return;
    const inThreads = threads.some(t => t.partner?.id === selectedUserId);
    if (inThreads) return;
    let cancelled = false;
    apiFetch(`/api/users/${selectedUserId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success && data.data?.name)
          setPartnerNameOverride(data.data.name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedUserId, threads]);

  const selectedThread = threads.find(t => t.partner?.id === selectedUserId);
  const isEventGroup = selectedThread?.type === "event" || selectedThread?.partner?.isEvent;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId || (!newContent.trim() && !selectedFile)) return;
    setSending(true);
    setError(null);
    try {
      let uploadedImageUrl: string | null = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const upRes = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.success) throw new Error(upData.error || "Failed to upload image");
        uploadedImageUrl = upData.url;
      }

      const res = await apiFetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiverId: isEventGroup ? undefined : selectedUserId,
          eventId: isEventGroup ? selectedUserId : undefined, 
          content: newContent.trim(),
          imageUrl: uploadedImageUrl
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send");
      
      setNewContent("");
      removeFile();
      setMessages(prev => [...prev, data.data]);
      await fetchThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                e.preventDefault();
                break;
            }
        }
    }
  }

  function removeFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const partnerName =
    partnerNameOverride ??
    selectedThread?.partner?.name ??
    "Unknown";

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[400px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      {/* Thread list */}
      <aside className="flex w-80 flex-col border-r border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-bold text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingThreads ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Loading chats...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="px-8 py-12 text-center text-sm text-slate-500">
              No conversations yet. Go to Trainers or Events to start one.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/50">
              {threads.map((t, index) => {
                const id = t.partner?.id;
                const name = t.partner?.name ?? "Unknown";
                if (!id) return null;
                const isSelected = selectedUserId === id;
                const isGroup = t.type === "event" || t.partner?.isEvent;

                return (
                  <li key={`${id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(id)}
                      className={`w-full px-6 py-4 text-left transition-all relative ${
                        isSelected
                          ? "bg-emerald-500/10"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isGroup ? "bg-emerald-500 text-black" : "bg-slate-800 text-emerald-400"
                        }`}>
                          {isGroup ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className={`truncate font-bold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                              {name}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                              {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-500">{t.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex flex-1 flex-col bg-slate-950/20">
        {selectedUserId ? (
          <>
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isEventGroup ? "bg-emerald-500 text-black" : "bg-slate-800 text-emerald-400"
                }`}>
                  {isEventGroup ? "G" : partnerName.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-bold text-white">{partnerName}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium">Loading messages...</p>
                </div>
              ) : (
                messages.map(m => {
                  if (m.isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-4">
                        <div className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  const isOwn = currentUser ? m.senderId === currentUser.id : m.senderId !== selectedUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start animate-in slide-in-from-left-2 duration-300"}`}
                    >
                      {isEventGroup && !isOwn && (
                        <span className="text-[10px] font-bold text-emerald-400 ml-3 mb-1 uppercase tracking-wider">
                          {m.sender.name}
                        </span>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                          isOwn
                            ? "bg-emerald-500 text-black font-medium rounded-tr-none"
                            : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none ring-1 ring-white/5"
                        }`}
                      >
                        {m.imageUrl && (
                          <div className="mb-3 rounded-xl overflow-hidden shadow-inner">
                            <img 
                              src={m.imageUrl} 
                              alt="Attached image" 
                              className="max-h-80 w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                              onClick={() => setEnlargedImage(m.imageUrl!)}
                            />
                          </div>
                        )}
                        {m.content && <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>}
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <p className={`text-[10px] font-medium ${isOwn ? "text-black/60" : "text-slate-500"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isOwn && (
                            <svg className="w-3 h-3 text-black/40" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 bg-slate-900/40 border-t border-slate-800"
            >
              <div className="max-w-4xl mx-auto space-y-3">
                {previewUrl && (
                  <div className="relative inline-block group">
                    <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded-xl border-2 border-emerald-500/30 object-cover shadow-2xl" />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white hover:bg-red-500 transition-colors border border-slate-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400 transition-all border border-slate-700/50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Write a message..."
                    className="flex-1 h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || (!newContent.trim() && !selectedFile)}
                    className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.855-1.246L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium">Pick a conversation to start chatting</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 px-6 py-2 text-xs text-red-500 border-t border-red-500/20">
            {error}
          </div>
        )}
      </section>

      {/* Image Modal */}
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
