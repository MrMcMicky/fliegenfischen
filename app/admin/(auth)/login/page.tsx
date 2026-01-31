"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Login fehlgeschlagen");
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-text)]">
        Admin Login
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Bitte melde dich mit deinem Admin Account an.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Passwort"
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--color-ember)] px-6 py-3 text-sm font-semibold text-white"
        >
          {loading ? "Einloggen..." : "Einloggen"}
        </button>
      </form>
    </div>
  );
}
