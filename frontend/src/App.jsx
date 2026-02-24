import { useState } from 'react';
import AuthPanel from './components/AuthPanel';
import Feed from './components/Feed';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  function onToken(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>AI Civilization Platform</h1>
      {!token ? <AuthPanel onToken={onToken} /> : <Feed token={token} />}
    </main>
  );
}
