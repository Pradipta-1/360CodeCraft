import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-hero">
      <div className="landing-hero-content">
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

