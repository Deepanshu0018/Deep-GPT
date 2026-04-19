import "./AuthPage.css";
import { useState } from "react";
import { apiFetch, clearSessionToken, persistSessionToken } from "./api.js";

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // ✅ FIXED endpoints
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const payload =
        mode === "login"
          ? {
              identifier: formData.email,
              password: formData.password,
            }
          : formData;

      // ✅ NO JSON.stringify, NO .json()
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: payload,
      });

      // ✅ Token handling
      if (res.sessionToken) {
        persistSessionToken(res.sessionToken);
      } else {
        clearSessionToken();
      }

      // ✅ Get user session
      const sessionData = await apiFetch("/api/auth/me");

      onAuthSuccess(sessionData.user);

    } catch (submitError) {
      clearSessionToken();
      setError(submitError.message || "Authentication failed");
    }

    setIsSubmitting(false);
  };

  // ✅ Guest mode - bypass authentication
  const handleGuestLogin = () => {
    const guestUser = {
      id: "guest",
      name: "Guest User",
      email: "guest@deepgpt.local",
      role: "guest",
    };
    onAuthSuccess(guestUser);
  };

  return (
    <div className="authShell">
      <div className="authPanel">
        <div className="authIntro">
          <p className="authEyebrow">DeepGPT</p>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="authSubtext">
            {mode === "login"
              ? "Sign in to continue your chats."
              : "Save your chats and continue from anywhere."}
          </p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="authField">
              <span>Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={updateField("name")}
                required
              />
            </label>
          )}

          <label className="authField">
            <span>{mode === "login" ? "Username or email" : "Email"}</span>
            <input
              type={mode === "login" ? "text" : "email"}
              value={formData.email}
              onChange={updateField("email")}
              required
            />
          </label>

          <label className="authField">
            <span>Password</span>
            <input
              type="password"
              value={formData.password}
              onChange={updateField("password")}
              minLength={6}
              required
            />
          </label>

          {error && <p className="authError">{error}</p>}

          <button className="authButton" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <div className="authSwitch">
          <span>
            {mode === "login"
              ? "New here?"
              : "Already have an account?"}
          </span>
          <button
            type="button"
            className="authSwitchButton"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "signup" : "login"));
              setError("");
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#999", marginBottom: "10px" }}>
            or continue as
          </p>
          <button
            type="button"
            className="authButton"
            onClick={handleGuestLogin}
            style={{ backgroundColor: "#666" }}
          >
            Guest User
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;