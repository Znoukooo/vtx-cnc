'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // State untuk form Ubah Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ambil data profil user saat pertama kali load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch (e) {
        console.error('Gagal memuat profil', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validasi jika user mengisi salah satu field password
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Harap masukkan password saat ini' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan');
      }

      setMessage({ type: 'success', text: 'Informasi akun berhasil disimpan!' });
      // Bersihkan input password setelah berhasil
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-zinc-500 text-sm">Memuat profil...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-white">
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Profil Saya</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Kelola informasi akun, alamat pengiriman default, dan kata sandi keamanan Anda.
        </p>
      </div>

      {/* Alert Feedback */}
      {message && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KARTU 1: INFORMASI UMUM */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Nama Anda"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
              Email Akun (Tetap)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
              <input
                disabled
                type="email"
                value={profile.email}
                className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Contoh: 08123456789"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
              Alamat Default Pengiriman
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Alamat lengkap tujuan pengiriman..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Alamat ini akan otomatis terisi setiap kali Anda melakukan pembelian di keranjang.
            </span>
          </div>
        </div>

        {/* KARTU 2: UBAH KATA SANDI (SECURITY) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-zinc-800/80 pb-3 mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-white">Ubah Password</h2>
          </div>
          <p className="text-zinc-400 text-xs">
            Kosongkan kolom di bawah jika Anda tidak berniat mengubah kata sandi akun Anda.
          </p>

          <div>
            <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama Anda"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/20 text-xs uppercase tracking-wider"
        >
          {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Akun'}
        </button>
      </form>
    </div>
  );
}