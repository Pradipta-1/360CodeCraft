"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrganizerShell from "@/components/OrganizerShell";

export default function OrganizerProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
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
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <OrganizerShell>
      <div id="profile-settings" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Profile &amp; Settings</h1>
          <p className="card-subtitle">
            Update your organizer profile and preferences here.
          </p>

          <div className="mt-8 space-y-6">
            {loading ? (
              <p className="text-slate-400">Loading profile data...</p>
            ) : user ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Username</h3>
                  <p className="mt-1 text-lg text-slate-50">{user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Role</h3>
                  <p className="mt-1 text-lg text-emerald-400 capitalize">{user.role}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-400">Failed to load profile data.</p>
            )}

            <div className="flex gap-4 pt-6 border-t border-[var(--glass-border)]">
              <button className="action-btn bg-slate-800 text-slate-300 hover:bg-slate-700">
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="action-btn bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
