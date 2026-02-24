import { useState } from 'react';
import { api } from '../api/client';

export default function AuthPanel({ onToken }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  async function submit(e) {
    e.preventDefault();
    if (mode === 'register') {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setMode('login');
      return;
    }
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
    onToken(data.token);
  }

  return (
    <form onSubmit={submit}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {mode === 'register' && <input placeholder="username" onChange={(e) => setForm({ ...form, username: e.target.value })} />}
      <input placeholder="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Submit</button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>Switch</button>
    </form>
  );
}
