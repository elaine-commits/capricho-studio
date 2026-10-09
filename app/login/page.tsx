"use client";
import { useState, useEffect } from "react";
export default function Login() {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <main>
      <div className="logo">
        STUDIO<span>.</span>
      </div>
      <h1>Acesso Capricho Imports</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          try {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.get("email"),
                password: form.get("password"),
              }),
            });
            const body = await response.json();
            if (!response.ok) {
              setError(body.error);
              return;
            }
            location.href = "/";
          } catch {
            setError("Não foi possível conectar ao servidor.");
          }
        }}
      >
        <label>
          E-mail
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>
          Senha
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </label>
        <button className="primary" disabled={!ready}>
          Entrar
        </button>
        <p role="alert">{error}</p>
      </form>
    </main>
  );
}
