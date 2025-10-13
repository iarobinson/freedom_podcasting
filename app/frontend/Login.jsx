import React, { useState } from "react";
import Bear from "./Bear";
import "./Bear.css";

export default function LoginForm() {
  const [looking, setLooking] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Bear looking={looking} />

      <form
        onFocus={() => setLooking(true)}
        onBlur={() => setLooking(false)}
        style={{ display: "inline-block", textAlign: "left" }}
      >
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
