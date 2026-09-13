'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Email atau password salah. Silakan coba lagi.');
        setLoading(false);
      } else {
        // Redirect aman ke target URL atau beranda
        const target = callbackUrl && callbackUrl !== '/login' ? callbackUrl : '/';
        window.location.href = target;
      }
    } catch (err) {
      setError('Terjadi kesalahan saat masuk.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftar');
      }

      setSuccess('Akun berhasil dibuat! Sedang masuk...');

      // Login otomatis setelah akun terbuat
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!loginRes?.error) {
        const target = callbackUrl && callbackUrl !== '/login' ? callbackUrl : '/';
        window.location.href = target;
      } else {
        setIsLogin(true);
        setError('Akun terdaftar, silakan masukkan password untuk login.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-8 shadow-2xl text-white">
        {/* Header Tab */}
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-black tracking-wider text-red-600">
            VTX <span className="text-xs text-zinc-400 font-normal">PERFORMANCE</span>
          </Link>
          <p className="text-zinc-400 text-xs mt-1">
            {isLogin ? 'Masuk untuk melanjutkan proses checkout pesanan' : 'Daftar akun baru untuk mulai belanja'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLogin ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLogin ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* FORM LOGIN */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Password</label>
              <Link
    href="/forgot-password"
    className="text-[11px] text-red-500 hover:underline font-semibold"
  >
    Lupa Password?
  </Link>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-600 transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-lg shadow-red-600/20 mt-2"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
        ) : (
          /* FORM REGISTER */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Budi Pratama"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Alamat Domisili Pengiriman</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Kota, Kecamatan, Alamat Lengkap..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-lg shadow-red-600/20 mt-3"
            >
              {loading ? 'Mendaftarkan Akun...' : 'Buat Akun & Lanjutkan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}