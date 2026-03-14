"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "USER" | "TRAINER" | "ORGANIZER" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const starContainerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = starContainerRef.current;
    if (!container) return;

    const count = 150;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2 + 1;
      star.style.width = size + "px";
      star.style.height = size + "px";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty("--duration", Math.random() * 3 + 2 + "s");
      star.style.animationDelay = Math.random() * 5 + "s";
      if (Math.random() > 0.8) star.style.background = "#00c896";
      container.appendChild(star);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const container = starContainerRef.current;
    if (!container) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function triggerShootingStar() {
      if (cancelled) return;
      const c = starContainerRef.current;
      if (!c) return;
      const shooter = document.createElement("div");
      shooter.className = "shooting-star";
      shooter.style.left = Math.random() * 80 + "%";
      shooter.style.top = Math.random() * 40 + "%";
      c.appendChild(shooter);
      timeouts.push(setTimeout(() => shooter.remove(), 3000));
      timeouts.push(setTimeout(triggerShootingStar, Math.random() * 4000 + 3000));
    }

    timeouts.push(setTimeout(triggerShootingStar, 2000));

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password");
      }
      const role = (data.data?.role || "USER") as Role;
      const redirect =
        role === "TRAINER"
          ? "/trainer/dashboard"
          : role === "ORGANIZER"
            ? "/organizer/dashboard"
            : role === "ADMIN"
              ? "/admin/dashboard"
              : "/user/dashboard";
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        :root {
          --brand-primary: #00c896;
          --brand-dark: #0a0a0a;
          --text-main: #ffffff;
          --text-dim: #a1a1aa;
          --glass-bg: rgba(18, 18, 18, 0.8);
          --glass-border: rgba(255, 255, 255, 0.08);
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #151515 0%, #000 100%);
          color: var(--text-main);
          overflow: hidden;
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
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
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
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
          border-radius: 26px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(20px);
          padding: 50px 40px;
        }
        .login-title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          font-size: 15px;
          color: var(--text-dim);
          margin-bottom: 40px;
        }
        .login-field {
          margin-bottom: 24px;
        }
        .login-label {
          font-size: 12px;
          color: var(--brand-primary);
          margin-bottom: 8px;
          display: block;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .login-input {
          width: 100%;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid #2a2a2a;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
        }
        .login-input:focus {
          border-color: var(--brand-primary);
          background: rgba(0, 200, 150, 0.03);
          box-shadow: 0 0 0 4px rgba(0, 200, 150, 0.1);
        }
        .login-btn {
          margin-top: 10px;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          background: var(--brand-primary);
          color: #000;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0, 200, 150, 0.3);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: 25px;
          font-size: 14px;
          color: var(--text-dim);
          text-align: center;
        }
        .login-footer a {
          color: var(--brand-primary);
          text-decoration: none;
          font-weight: 600;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
        .login-error {
          font-size: 13px;
          color: #f87171;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="login-page">
        <div id="star-container" ref={starContainerRef} />

        <div className="login-container">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Log in to access your workouts, trainers, and fitness community.
          </p>

          <form onSubmit={handleSubmit}>
            {error && <p className="login-error">{error}</p>}

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="athlete@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <div className="login-footer">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register">Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
}
