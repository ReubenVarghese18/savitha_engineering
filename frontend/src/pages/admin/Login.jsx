import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const params = new URLSearchParams({ username, password });
      
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        rawResponse: true
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('TOO MANY ATTEMPTS. PLEASE WAIT 60 SECONDS.');
        } else if (response.status === 401) {
          setError('ACCESS DENIED');
        } else {
          setError('SYSTEM ERROR');
        }
        return;
      }

      const data = await response.json();
      login(data.access_token);
      navigate('/admin/live-feed', { replace: true });
      
    } catch {
      setError('NETWORK ERROR');
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center font-mono selection:bg-[#FF4D00] selection:text-black">
      <Helmet>
        <title>Admin Sign In | Savitha Engineering</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md p-8 border border-zinc-800 bg-black shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF4D00]"></div>
        
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-8 text-center text-zinc-100">
          SYS.ADMIN <span className="text-[#FF4D00]">//</span> AUTH
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 border-l-4 border-red-600 bg-red-900/20 text-red-500 font-bold uppercase tracking-wider text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-zinc-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-colors rounded-none font-mono"
              placeholder="ENTER USERNAME"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-colors rounded-none font-mono"
              placeholder="ENTER PASSWORD"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF4D00] text-black font-bold uppercase tracking-widest p-4 hover:bg-orange-600 transition-colors mt-8"
          >
            LOGIN / ENTER
          </button>
        </form>
      </div>
    </main>
  );
}
