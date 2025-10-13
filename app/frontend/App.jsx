import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Get CSRF token from Rails meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  useEffect(() => {
    // On mount, check current user
    axios.get("/api/current_user", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/users/sign_in", 
        { user: { email, password } }, 
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json"
          }
        }
      );

      // Fetch current user info
      const res = await axios.get("/api/current_user", { withCredentials: true });
      setUser(res.data.user);
      setError("");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const logout = async () => {
    try {
      await axios.delete("/users/sign_out", 
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.name || user.email}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={login}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label>Email: </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
