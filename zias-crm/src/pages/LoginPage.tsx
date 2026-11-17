import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob a" />
      <div className="blob b" />
      <div className="login-card">
        <div className="brand">◆ ZIAS CRM</div>
        <h1>Welcome back</h1>
        <p className="sub">Sign in to manage your customers</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
          </label>
          <label>
            Password
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </label>
          {error && <div className="alert">{error}</div>}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="hint">Demo login: admin / admin123</p>
      </div>
    </div>
  );
}
