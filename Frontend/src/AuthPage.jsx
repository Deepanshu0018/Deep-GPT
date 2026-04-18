import "./AuthPage.css";
import { useState } from "react";
import { apiFetch } from "./api.js";

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
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? {
              identifier: formData.email,
              password: formData.password,
            }
          : formData;

      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Authentication failed");
      }

      onAuthSuccess(res.user);
    } catch (submitError) {
      setError(submitError.message || "Authentication failed");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="authShell">
      <div className="authPanel">
        <div className="authIntro">
          <p className="authEyebrow">DeepGPT</p>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="authSubtext">
            {mode === "login" ? "Sign in to continue your chats." : "Save your chats and continue from anywhere."}
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
                placeholder="Deepanshu Gupta"
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
              placeholder={mode === "login" ? "Deepanshu" : "you@example.com"}
              required
            />
          </label>

          <label className="authField">
            <span>Password</span>
            <input
              type="password"
              value={formData.password}
              onChange={updateField("password")}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          {error && <p className="authError">{error}</p>}

          <button className="authButton" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="authSwitch">
          <span>{mode === "login" ? "New here?" : "Already have an account?"}</span>
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
      </div>
    </div>
  );
}

export default AuthPage;
