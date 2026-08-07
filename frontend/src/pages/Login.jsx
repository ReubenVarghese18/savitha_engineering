import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('ALL FIELDS ARE REQUIRED.');
      return;
    }

    const success = login(email, password);
    if (success) {
      navigate('/admin/live-feed');
    } else {
      setError('INVALID AUTHENTICATION ATTEMPT.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-6 stark-grid">
      <div className="w-full max-w-md brutalist-border bg-black p-10 brutalist-shadow">
        {/* Branding header */}
        <div className="flex items-center gap-4 mb-10 border-b-4 border-white pb-6">
          <div className="w-12 h-12 bg-white flex items-center justify-center brutalist-border">
            <svg className="w-8 h-8 text-black fill-current" viewBox="0 0 24 24">
              <path d="M12,2C10.5,5.5,12.5,8.5,13.5,10c1.2,1.8,1.2,3.5,0.5,5c-0.8,1.8-3,2.5-4.5,1.5c-1-0.7-1.5-2-1-3.5c0.5-1.5,1.5-2.5,1.5-2.5s-4,2.5-4,6.5c0,4,3,7,7,7s7-3,7-7C20,7,12,2,12,2z"></path>
            </svg>
          </div>
          <div>
            <h1 className="font-brutal-head text-2xl tracking-tighter leading-none text-white">SAVITHA</h1>
            <p className="font-mono text-[10px] text-[#FF4D00] uppercase tracking-[0.2em] font-bold mt-1">ADMIN CONTROL</p>
          </div>
        </div>

        <h2 className="font-brutal-head text-3xl mb-8 leading-none text-white">SECURE GATEWAY</h2>

        {error && (
          <div className="bg-[#FF4D00]/20 text-[#FF4D00] border-2 border-[#FF4D00] p-4 font-mono text-xs mb-6 uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A1C] border-2 border-gray-700 p-3 text-white uppercase text-base focus:outline-none focus:border-[#FF4D00] font-mono placeholder:text-gray-600 transition-colors"
              placeholder="ENTER EMAIL"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1C] border-2 border-gray-700 p-3 text-white uppercase text-base focus:outline-none focus:border-[#FF4D00] font-mono placeholder:text-gray-600 transition-colors"
              placeholder="ENTER PASSWORD"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF4D00] text-white hover:bg-white hover:text-[#FF4D00] px-6 py-4 font-brutal-head text-xl tracking-widest transition-colors duration-300 brutalist-shadow-sm brutalist-border border-[#FF4D00] cursor-pointer"
          >
            AUTHORIZE SESSION →
          </button>
        </form>
      </div>
    </div>
  );
}
