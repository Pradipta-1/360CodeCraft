"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/apiFetch";

type Post = {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
};

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiFetch("/api/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setSubmitting(true);
    setError(null);

    let uploadedImageUrl = null;

    try {
      // 1. Upload image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const upRes = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (upRes.ok && upData.url) {
          uploadedImageUrl = upData.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // 2. Create post
      const res = await apiFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setContent("");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(data.error || "Failed to create post");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Create Post Card */}
      <div className="card p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-xl rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Share with the Community</h2>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none h-24"
            placeholder="What's on your mind? Share your progress, tips, or just say hi!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-800">
              <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Add Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <button
              type="submit"
              disabled={submitting || (!content.trim() && !selectedFile)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
            <p className="mt-4 text-slate-400">Loading community posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl">
            <p className="text-slate-400">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3 border-b border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold overflow-hidden ring-2 ring-emerald-500/20">
                  {post.user.avatarUrl ? (
                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
                  ) : (
                    post.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer">{post.user.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold tracking-wider">
                      {post.user.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="p-4 text-slate-200 leading-relaxed">
                  {post.content}
                </div>
              )}

              {/* Post Image */}
              {post.imageUrl && (
                <div className="relative w-full aspect-square md:aspect-video bg-slate-950">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="absolute inset-0 w-full h-full object-contain md:object-cover"
                  />
                </div>
              )}

              {/* Post Footer (Simplified interactions) */}
              <div className="p-4 flex items-center gap-6 border-t border-slate-800/50">
                <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group">
                  <svg className="w-6 h-6 group-hover:fill-red-400/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group">
                  <svg className="w-6 h-6 group-hover:fill-emerald-400/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.855-1.246L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
