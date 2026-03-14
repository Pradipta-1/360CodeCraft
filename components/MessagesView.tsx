"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Thread = {
  partner: { id: string; name: string | null } | null;
  lastMessage: string;
  updatedAt: string;
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
};

export default function MessagesView() {
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
      const res = await fetch("/api/messages/threads", { credentials: "include" });
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
      const res = await fetch(`/api/messages/with/${userId}`, { credentials: "include" });
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
    fetch(`/api/users/${selectedUserId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success && data.data?.name)
          setPartnerNameOverride(data.data.name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedUserId, threads]);

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
        const upRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.success) throw new Error(upData.error || "Failed to upload image");
        uploadedImageUrl = upData.url;
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          receiverId: selectedUserId, 
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

  const selectedThread = threads.find(t => t.partner?.id === selectedUserId);
  const partnerName =
    partnerNameOverride ??
    selectedThread?.partner?.name ??
    "Unknown";

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[400px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      {/* Thread list */}
      <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900/80">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-50">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-400">
              Loading…
            </div>
          ) : threads.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No conversations yet. Go to Trainers and click &quot;Message&quot; to start one.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {threads.map((t, index) => {
                const id = t.partner?.id;
                const name = t.partner?.name ?? "Unknown";
                if (!id) return null;
                const isSelected = selectedUserId === id;
                return (
                  <li key={`${id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "bg-emerald-500/20 text-slate-50"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
                      }`}
                    >
                      <p className="truncate font-medium">{name}</p>
                      <p className="truncate text-xs text-slate-400">{t.lastMessage}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex flex-1 flex-col">
        {selectedUserId ? (
          <>
            <div className="border-b border-slate-800 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-50">{partnerName}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                  Loading messages…
                </div>
              ) : (
                messages.map(m => {
                  const isOwn = m.senderId !== selectedUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          isOwn
                            ? "bg-[#00c896] text-black"
                            : "border border-[var(--glass-border)] bg-[var(--glass-bg)] text-white"
                        }`}
                      >
                        {m.imageUrl && (
                          <div className="mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={m.imageUrl} 
                              alt="Attached image" 
                              className="max-h-64 rounded-md object-contain cursor-pointer transition-opacity hover:opacity-90" 
                              onClick={() => setEnlargedImage(m.imageUrl!)}
                            />
                          </div>
                        )}
                        {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                        <p
                          className={`mt-1 text-xs ${
                            isOwn ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={handleSend}
              className="flex flex-col gap-2 border-t border-slate-800 p-3"
            >
              {previewUrl && (
                <div className="relative inline-block w-max rounded-md bg-slate-800 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center">
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  title="Attach Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
                <input
                  type="text"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Type a message or paste an image (Ctrl+V)…"
                  className="flex-1 rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#00c896] focus:outline-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || (!newContent.trim() && !selectedFile)}
                  className="action-btn disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            Select a conversation, or go to Trainers and click &quot;Message&quot; to start one.
          </div>
        )}
        {error && (
          <div className="border-t border-slate-800 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setEnlargedImage(null)}
        >
          <div 
            className="relative flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors focus:outline-none ring-1 ring-slate-700/50"
              title="Close image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={enlargedImage} 
              alt="Enlarged attached image" 
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
