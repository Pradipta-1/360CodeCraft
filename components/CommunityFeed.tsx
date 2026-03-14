"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/apiFetch";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
};

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
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
};

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

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

  const handleLike = async (postId: string) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isLikedByMe: data.liked,
              likesCount: data.liked ? p.likesCount + 1 : p.likesCount - 1
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsByPost[postId]) {
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId: string) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) {
        setCommentsByPost(prev => ({ ...prev, [postId]: data.data }));
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    setIsCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.data]
        }));
        setNewComment(prev => ({ ...prev, [postId]: "" }));
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        ));
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
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
        const newPostWithCounts = {
          ...data.data,
          likesCount: 0,
          commentsCount: 0,
          isLikedByMe: false
        };
        setPosts([newPostWithCounts, ...posts]);
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
                <div 
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold overflow-hidden ring-2 ring-emerald-500/20 cursor-pointer flex-shrink-0"
                  onClick={() => post.user.avatarUrl && setEnlargedImage(post.user.avatarUrl)}
                >
                  {post.user.avatarUrl ? (
                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
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
                    className="absolute inset-0 w-full h-full object-contain md:object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setEnlargedImage(post.imageUrl)}
                  />
                </div>
              )}

              {/* Post Footer */}
              <div className="px-4 py-3 flex items-center gap-6 border-t border-slate-800/50">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors group ${post.isLikedByMe ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
                >
                  <svg className={`w-6 h-6 ${post.isLikedByMe ? "fill-red-400" : "group-hover:fill-red-400/20"}`} fill={post.isLikedByMe ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">{post.likesCount > 0 ? post.likesCount : "Like"}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-2 transition-colors group ${expandedComments[post.id] ? "text-emerald-400" : "text-slate-400 hover:text-emerald-400"}`}
                >
                  <svg className={`w-6 h-6 ${expandedComments[post.id] ? "fill-emerald-400/20" : "group-hover:fill-emerald-400/20"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.855-1.246L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">{post.commentsCount > 0 ? post.commentsCount : "Comment"}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post.id] && (
                <div className="bg-slate-950/30 border-t border-slate-800/50 p-4 space-y-4">
                  {/* Comment List */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {loadingComments[post.id] ? (
                      <div className="py-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent" />
                      </div>
                    ) : commentsByPost[post.id]?.length === 0 ? (
                      <p className="text-slate-500 text-sm italic py-2">No comments yet.</p>
                    ) : (
                      commentsByPost[post.id]?.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <div 
                            className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20 cursor-pointer overflow-hidden"
                            onClick={() => comment.user.avatarUrl && setEnlargedImage(comment.user.avatarUrl)}
                          >
                            {comment.user.avatarUrl ? (
                              <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-full h-full object-cover rounded-full hover:opacity-80 transition-opacity" />
                            ) : (
                              comment.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-slate-800/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{comment.user.name}</span>
                              <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-300">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment */}
                  <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ""}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isCommenting[post.id] || !newComment[post.id]?.trim()}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      {isCommenting[post.id] ? "..." : "Post"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setEnlargedImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors focus:outline-none ring-1 ring-slate-700/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <img 
              src={enlargedImage} 
              alt="Post image" 
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
