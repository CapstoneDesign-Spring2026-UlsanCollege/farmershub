import { useEffect, useRef, useState } from "react";

type LoginProps = {
  /** Whether the login view is currently shown. */
  active: boolean;
  /** Return to the hero. */
  onBack: () => void;
};

/**
 * Frosted-glass login card shown over the still-playing hero video.
 * UI only: no auth, no validation, no requests — submit is preventDefault().
 */
export function Login({ active, onBack }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Move focus into the form when it opens (keyboard users).
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => emailRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [active]);

  // Esc returns to the hero while the login view is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onBack]);

  return (
    <section className="login" aria-hidden={!active} inert={!active}>
      <button className="login__back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back
      </button>

      <form
        className="login__card"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="login__badge">
          <img src="/logo.png" alt="FarmersHub logo" />
        </div>
        <h2 className="login__heading">Welcome back</h2>
        <p className="login__subtitle">Log in to your FarmersHub account</p>

        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <div className="field__control">
            <svg className="icon field__icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <input
              ref={emailRef}
              className="field__input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <div className="field__control">
            <svg className="icon field__icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <input
              className="field__input"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <button
              className={`field__eye${showPassword ? " is-on" : ""}`}
              type="button"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
            >
              <svg className="icon icon-eye" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                className="icon icon-eye-off"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <div className="login__row">
          <label className="login__remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a className="login__link" href="#">
            Forgot password?
          </a>
        </div>

        <button className="login__submit" type="submit">
          Log in
        </button>

        <div className="login__divider">
          <span>or</span>
        </div>

        <button className="login__google" type="button">
          <svg className="login__google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.04 12.26c0-.82-.07-1.6-.2-2.36H12v4.47h6.19a5.29 5.29 0 0 1-2.3 3.47v2.88h3.72c2.18-2 3.43-4.96 3.43-8.46z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.88c-1.03.7-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.75v2.97A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.72a7.2 7.2 0 0 1 0-4.6V7.15H1.75a12 12 0 0 0 0 10.54l3.85-2.97z"
            />
            <path
              fill="#EA4335"
              d="M12 4.76c1.68 0 3.2.58 4.39 1.72l3.29-3.29C17.7 1.19 15.1 0 12 0A12 12 0 0 0 1.75 6.46l3.85 2.97C6.5 6.74 9.02 4.76 12 4.76z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="login__footer">
          Don't have an account?{" "}
          <a className="login__link" href="#">
            Sign up
          </a>
        </p>
      </form>
    </section>
  );
}
