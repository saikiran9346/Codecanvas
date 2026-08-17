import logo from "../assets/logo.CC.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LoginScreen() {
  const [isHidden, setIsHidden] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = document.getElementById("login-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    form.reset();
    setIsHidden(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("jwtoken", result.token);
        navigate("/");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Network error, please try again later.");
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        <div>
          <img src={logo} alt="CodeCanvas Logo" className="logo" />
        </div>
        <form id="login-form" onSubmit={handleLogin} autoComplete="off">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              id="username"
              name="username"
              placeholder=" "
              required
              autoComplete="username"
            />
            <label htmlFor="username" className="floating-label">
              USERNAME
            </label>
          </div>
          <div className="form-group password-wrapper">
            <input
              type={isHidden ? "password" : "text"}
              id="password"
              className="form-input"
              name="password"
              placeholder=" "
              required
              autoComplete="current-password"
            />
            <label htmlFor="password" className="floating-label">
              PASSWORD
            </label>
            <button
              type="button"
              className="show-password"
              onClick={() => setIsHidden((h) => !h)}
              tabIndex={-1}
              aria-label={isHidden ? "Show password" : "Hide password"}
            >
              {isHidden ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {error && <div id="login-error-msg">{error}</div>}
          <button type="Submit" className="login-button">
            Login
          </button>
        </form>
      </div>
      <div className="login-footer">
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;