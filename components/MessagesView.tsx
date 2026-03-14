"use client";

import { useCallback, useEffect, useState } from "react";
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
    if (!selectedUserId || !newContent.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: selectedUserId, content: newContent.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send");
      setNewContent("");
      setMessages(prev => [...prev, data.data]);
      await fetchThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
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
                            ? "bg-emerald-600 text-slate-50"
                            : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
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
              className="flex gap-2 border-t border-slate-800 p-3"
            >
              <input
                type="text"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newContent.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-emerald-500 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
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
    </div>
  );
}
