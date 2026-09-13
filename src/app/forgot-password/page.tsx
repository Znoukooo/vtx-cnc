'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Phone, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Input Nomor HP, Step 2: Input OTP & Password Baru
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [waLink, setWaLink] = useState('');
  const [devOtp, setDevOtp] = useState('');

  // Kirim Permintaan OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim OTP');

      setStep(2);
      setSuccessMessage('Kode OTP telah dibuat untuk nomor ' + phone);
      if (data.waLink) setWaLink(data.waLink);
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi OTP dan Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password');

      alert('Password berhasil diperbarui! Silakan login dengan password baru.');
      router.push('/login');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        {/* Header Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-600/40 text-red-500 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Lupa Password Akun</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {step === 1
              ? 'Masukkan nomor WhatsApp/HP yang terdaftar untuk menerima OTP'
              : 'Masukkan 6 digit OTP dan buat kata sandi baru'}
          </p>
        </div>

        {/* Alert Error / Sukses */}
        {errorMessage && (
          <div className="mb-4 bg-red-950/60 border border-red-800 text-red-400 p-3 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Box Simulasi Dev OTP & Link WA */}
        {step === 2 && (
          <div className="mb-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Buka Pesan OTP di WhatsApp:</span>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                >
                  Kirim ke WA <Send className="w-3 h-3" />
                </a>
              )}
            </div>
            {devOtp && (
              <div className="p-2 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-300 font-mono text-center">
                Kode Uji Coba: <strong className="text-base tracking-widest">{devOtp}</strong>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Form Minta OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-300 font-bold block mb-1">Nomor HP / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/20 uppercase tracking-wider"
            >
              {loading ? 'Mengirim OTP...' : 'Minta Kode OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Form Input OTP & Password Baru */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-300 font-bold block mb-1">6 Digit Kode OTP</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  required
                  maxLength={6}
                  placeholder="Masukkan 6 angka OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-red-600 font-mono text-center tracking-widest text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 font-bold block mb-1">Password Baru</label>
              <input
                required
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-bold block mb-1">Konfirmasi Password Baru</label>
              <input
                required
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition"
              >
                Ganti No
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/20 uppercase tracking-wider"
              >
                {loading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        )}

        {/* Tautan Kembali ke Login */}
        <div className="mt-6 text-center border-t border-zinc-800 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}