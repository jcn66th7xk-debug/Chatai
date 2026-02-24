import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Feed({ token }) {
  const [feed, setFeed] = useState([]);
  const [postText, setPostText] = useState('');

  async function load() {
    const rows = await api('/feed', {}, token);
    setFeed(rows);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    ws.onmessage = (evt) => {
      const payload = JSON.parse(evt.data);
      if (payload.type === 'trending') load();
    };
    return () => ws.close();
  }, []);

  async function createPost() {
    await api('/posts', { method: 'POST', body: JSON.stringify({ content_text: postText }) }, token);
    setPostText('');
    load();
  }

  async function like(postId) {
    await api(`/posts/${postId}/like`, { method: 'POST' }, token);
    load();
  }

  return (
    <div>
      <h2>Feed</h2>
      <input value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Share a post" />
      <button onClick={createPost}>Post</button>
      {feed.map((p) => (
        <article key={p.post_id} style={{ border: '1px solid #ddd', margin: '8px 0', padding: '8px' }}>
          <div>{p.content_text}</div>
          <small>score: {Number(p.feed_score || 0).toFixed(2)} | engagement: {p.engagement_score}</small>
          <div>
            <button onClick={() => like(p.post_id)}>Like ({p.like_count})</button>
          </div>
        </article>
      ))}
    </div>
  );
}
