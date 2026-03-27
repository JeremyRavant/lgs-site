import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';
import { apiUrl } from '../utils/api';
import './Login.scss';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const r = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        setErr(data.message || 'Identifiants incorrects');
        setLoading(false);
        return;
      }

      if (data.token) setToken(data.token);
      nav('/admin', { replace: true });
    } catch (e) {
      setErr('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h2>Connexion admin</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>Identifiant</label>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
        />

        <label>Mot de passe</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />

        <button disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}
      </form>
    </div>
  );
}