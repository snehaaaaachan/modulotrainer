import React, { useState } from "react";

// Hardcoded credentials — swap for real auth when needed
const USERS = {
  admin: { password: "admin123", role: "admin" },
  student: { password: "student123", role: "student" }
};

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [show, setShow]         = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const user = USERS[username.trim().toLowerCase()];
    if (!user || user.password !== password) {
      setError("Invalid username or password.");
      return;
    }
    onLogin({ username: username.trim().toLowerCase(), role: user.role });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-baseline gap-2.5 mb-2 justify-center">
          <span
            className="w-[28px] h-[28px] rounded-full inline-block translate-y-[3px]"
            style={{ background: "conic-gradient(from -40deg, #2F6F4E, #C7902E, #2F6F4E)" }}
          />
          <h1 className="text-2xl font-semibold font-display">ModuloTrainer</h1>
        </div>
        <p className="text-center text-sm text-muted mb-8">Sign in to continue</p>

        {/* Hint cards */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-paperRaised border border-line rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-forestDeep">Admin</p>
            <p className="text-[11px] text-muted mt-0.5">admin / admin123</p>
          </div>
          <div className="flex-1 bg-paperRaised border border-line rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-amber">Student</p>
            <p className="text-[11px] text-muted mt-0.5">student / student123</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-paperRaised border border-line rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or student"
              autoComplete="username"
              className="w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            className="mt-1 w-full bg-forestDeep text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-forest transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
