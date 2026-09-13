'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  snapToken: string | null;
}

export default function PayOrderButton({ snapToken }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!snapToken) {
      alert('Token pembayaran tidak ditemukan. Silakan hubungi CS atau buat pesanan ulang.');
      return;
    }

    if (typeof window !== 'undefined' && window.snap) {
      setLoading(true);
      window.snap.pay(snapToken, {
        onSuccess: function () {
          alert('Pembayaran Berhasil!');
          router.refresh();
        },
        onPending: function () {
          alert('Menunggu instruksi pembayaran diselesaikan.');
          router.refresh();
        },
        onError: function () {
          alert('Pembayaran Gagal atau Dibatalkan.');
        },
        onClose: function () {
          setLoading(false);
        },
      });
    } else {
      alert('Midtrans Snap SDK sedang dimuat. Coba beberapa detik lagi.');
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading || !snapToken}
      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-md transition shadow-md shadow-emerald-600/20"
    >
      <CreditCard className="w-3.5 h-3.5" />
      <span>{loading ? 'Membuka...' : 'Bayar Sekarang'}</span>
    </button>
  );
}