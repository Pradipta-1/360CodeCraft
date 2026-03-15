import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-hero">
      <div className="landing-hero-content">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" fill="url(#gradient)" stroke="#00c896" strokeWidth="2"/>
              <text x="30" y="38" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial Black">FC</text>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#00c896'}}/>
                  <stop offset="100%" style={{stopColor:'#ff6b6b'}}/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="landing-logo-text">FitConnect</h1>
        </div>
        <h1 className="landing-hero-title">
          Connect. Train. Achieve.
        </h1>
        <p className="landing-hero-text">
          Join a powerful community of fitness enthusiasts. Find workout partners, connect with
          trainers, and discover local sports events near you.
        </p>
        <div className="landing-buttons">
          <Link href="/auth/register" className="landing-signup">
            Sign Up
          </Link>
          <Link href="/auth/login" className="landing-login">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}

