"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

type Props = {
  children: ReactNode;
};

export default function OrganizerShell({ children }: Props) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiFetch("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user in side shell:", err);
      }
    }
    fetchUser();

    function createStarfield() {
      const container = document.getElementById('star-container');
      if (!container) return;

      container.querySelectorAll('.star, .shooting-star').forEach((el) => el.remove());

      const count = 120;

      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        star.style.setProperty('--duration', String(Math.random() * 3 + 2) + 's');
        star.style.animationDelay = String(Math.random() * 5) + 's';

        if (Math.random() > 0.85) star.style.background = '#00c896';

        container.appendChild(star);
      }
    }

    let shootingCleanup: (() => void) | null = null;

    function triggerShootingStar() {
      const container = document.getElementById('star-container');
      if (!container) return;

      const shooter = document.createElement('div');
      shooter.className = 'shooting-star';

      shooter.style.left = Math.random() * 80 + '%';
      shooter.style.top = Math.random() * 40 + '%';

      container.appendChild(shooter);

      const removeTimeout = window.setTimeout(() => shooter.remove(), 3000);
      const nextTimeout = window.setTimeout(triggerShootingStar, Math.random() * 4000 + 3000);

      shootingCleanup = () => {
        window.clearTimeout(removeTimeout);
        window.clearTimeout(nextTimeout);
      };
    }

    createStarfield();
    const firstTimeout = window.setTimeout(triggerShootingStar, 2000);

    return () => {
      window.clearTimeout(firstTimeout);
      if (shootingCleanup) shootingCleanup();
    };
  }, []);

  return (
    <>
      <div id="star-container" />

      <div className="app-container">
        <nav className="top-nav">
          <div className="nav-brand flex items-center gap-3">
            {user && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30 flex-shrink-0 bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-xs ring-2 ring-emerald-500/10">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            )}
            {user ? `HELLO, ORGANIZER ${user.name.toUpperCase()}` : "FitConnect - ORGANIZER"}
          </div>
          <div className="nav-list">
            <Link
              href="/organizer/dashboard"
              className={`nav-item${pathname === '/organizer/dashboard' ? ' active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              href="/organizer/events/create"
              className={`nav-item${pathname === '/organizer/events/create' ? ' active' : ''}`}
            >
              Create Event
            </Link>
            <Link
              href="/organizer/events/manage"
              className={`nav-item${pathname === '/organizer/events/manage' ? ' active' : ''}`}
            >
              Manage Events
            </Link>
            <Link
              href="/organizer/trainers"
              className={`nav-item${pathname === '/organizer/trainers' ? ' active' : ''}`}
            >
              Trainers
            </Link>
            <Link
              href="/organizer/participants"
              className={`nav-item${pathname === '/organizer/participants' ? ' active' : ''}`}
            >
              Participants
            </Link>
            <Link
              href="/organizer/community"
              className={`nav-item${pathname === '/organizer/community' ? ' active' : ''}`}
            >
              Community
            </Link>
            <Link
              href="/organizer/messages"
              className={`nav-item${pathname === '/organizer/messages' ? ' active' : ''}`}
            >
              Messages
            </Link>
            <Link
              href="/organizer/profile-settings"
              className={`nav-item${pathname === '/organizer/profile-settings' ? ' active' : ''}`}
            >
              Profile &amp; Settings
            </Link>
          </div>
        </nav>

        <main className="main-content">
          {children}
        </main>
        
        <footer className="app-footer">
          &copy; 2026 FitConnect. All rights reserved.
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --brand-primary: #00c896;
          --brand-primary-glow: rgba(0, 200, 150, 0.2);
          --bg-color: #050505;
          --nav-bg: rgba(10, 10, 12, 0.85);
          --text-main: #ffffff;
          --text-dim: #a1a1aa;
          --glass-bg: rgba(20, 20, 20, 0.65);
          --glass-border: rgba(255, 255, 255, 0.05);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
          height: 100vh;
          background: radial-gradient(circle at top left, #121212 0%, #000 100%);
          color: var(--text-main);
          overflow: hidden;
          display: flex;
        }

        #star-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
        }

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 1), transparent);
          box-shadow: 0 0 10px white;
          animation: shoot 3s linear infinite;
          opacity: 0;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
            box-shadow: 0 0 5px var(--brand-primary);
          }
        }

        @keyframes shoot {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg) scaleX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translateX(0) translateY(0) rotate(-45deg) scaleX(50);
          }
          20% {
            transform: translateX(500px) translateY(500px) rotate(-45deg) scaleX(50);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .app-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 10;
        }

        .top-nav {
          width: 100%;
          height: 70px;
          background: var(--nav-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          flex-shrink: 0;
        }

        .nav-brand {
          font-size: 16px;
          background: linear-gradient(45deg, #00c896, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
          font-weight: 700;
          font-family: 'Arial Black', sans-serif;
        }

        .nav-list {
          display: flex;
          height: 100%;
          gap: 0;
        }

        .nav-item {
          padding: 0 20px;
          display: flex;
          align-items: center;
          color: var(--text-dim);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          border-bottom: 3px solid transparent;
        }

        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: var(--brand-primary);
          background: linear-gradient(to top, var(--brand-primary-glow) 0%, transparent 100%);
          border-bottom: 3px solid var(--brand-primary);
          font-weight: 600;
        }

        .main-content {
          flex: 1;
          padding: 40px 60px;
          overflow-y: auto;
        }

        .main-content::-webkit-scrollbar {
          width: 8px;
        }
        .main-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .main-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .main-content::-webkit-scrollbar-thumb:hover {
          background: var(--brand-primary);
        }

        .tab-pane {
          display: block;
          animation: fadeIn 0.4s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .card:hover {
          border-color: rgba(0, 200, 150, 0.3);
        }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-size: 14px;
          color: var(--text-dim);
          line-height: 1.5;
        }

        .hero-card {
          padding: 0;
          overflow: hidden;
          position: relative;
          height: 350px;
          display: flex;
          align-items: flex-end;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          opacity: 0.7;
          transition: opacity 0.5s ease, transform 5s ease;
        }

        .hero-card:hover .hero-img {
          opacity: 0.9;
          transform: scale(1.03);
        }

        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          padding: 40px;
          width: 100%;
        }

        .hero-content h2 {
          color: var(--brand-primary);
          font-size: 32px;
          margin-bottom: 10px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .dashboard-small-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 20px;
          transition: 0.3s;
        }
        
        .dashboard-small-card:hover {
          border-color: rgba(0,200,150,0.4);
          transform: translateY(-3px);
        }

        .action-btn {
          background: transparent;
          border: 1px solid var(--brand-primary);
          color: var(--brand-primary);
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
        }
        
        .action-btn:hover {
          background: var(--brand-primary);
          color: black;
          box-shadow: 0 0 10px var(--brand-primary);
        }

        .app-footer {
          padding: 20px;
          text-align: center;
          color: var(--text-dim);
          border-top: 1px solid var(--glass-border);
          font-size: 13px;
        }
      `}</style>
    </>
  );
}
