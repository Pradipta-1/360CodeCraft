"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrainerShell from "@/components/TrainerShell";
import { apiFetch } from "@/lib/apiFetch";

export default function TrainerProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
            setName(data.data.name || "");
            setRole(data.data.role || "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      sessionStorage.removeItem("auth_token");
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    setUpdating(true);
    setMessage(null);
    try {
      const res = await apiFetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setMessage({ type: 'success', text: "Profile updated successfully!" });
        setIsEditing(false);
        setPassword(""); // Clear password field
        
        // If role changed, we might need to redirect
        if (data.data.role.toLowerCase() !== (user?.role?.toLowerCase())) {
          router.push(`/${data.data.role.toLowerCase()}/dashboard`);
        }
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "An error occurred while saving." });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <TrainerShell>
      <div id="profile-settings" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Profile &amp; Settings</h1>
          <p className="card-subtitle">
            Update your trainer profile and preferences here.
          </p>

          <div className="mt-8 space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {message.text}
              </div>
            )}

            {loading ? (
              <p className="text-slate-400">Loading profile data...</p>
            ) : user ? (
              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password (leave blank to keep current)</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:border-emerald-500 outline-none"
                      >
                        <option value="USER">User (Trainee)</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ORGANIZER">Organizer</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Username</h3>
                      <p className="mt-1 text-lg text-slate-50">{user.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Role</h3>
                      <p className="mt-1 text-lg text-emerald-400 capitalize">{user.role}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Email</h3>
                      <p className="mt-1 text-lg text-slate-400">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-400">Failed to load profile data.</p>
            )}

            <div className="flex gap-4 pt-6 border-t border-[var(--glass-border)]">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={updating}
                    className="action-btn"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || "");
                      setRole(user?.role || "");
                      setPassword("");
                    }}
                    className="action-btn bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="action-btn"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="action-btn bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </TrainerShell>
  );
}
