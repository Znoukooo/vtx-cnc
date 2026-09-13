'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  Truck,
} from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

// Daftar kurir beserta tarif ongkos kirim flat
const COURIER_RATES: { [key: string]: number } = {
  'J&T Express': 24000,
  'Shopee Express (SPX)': 20000,
  'JNE Reguler': 28000,
  'SiCepat Cargo': 22000,
};

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const [shippingAddress, setShippingAddress] = useState('');
  const [courier, setCourier] = useState('J&T Express');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(true);

  // Ambil alamat default akun user secara otomatis saat halaman dibuka
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.address) {
            setShippingAddress(data.address);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil alamat profil:', err);
      } finally {
        setFetchingAddress(false);
      }
    };

    fetchUserProfile();
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentShippingCost = items.length > 0 ? (COURIER_RATES[courier] || 0) : 0;
  const totalAmount = subtotal + currentShippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Harap masukkan alamat pengiriman barang.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          courier,
          paymentMethod,
          shippingCost: currentShippingCost,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan.');
      }

      clearCart();

      // COD
      if (data.isCOD) {
        alert('Pesanan COD Berhasil Dibuat! Tim gudang kami akan segera menyiapkan part CNC Anda.');
        router.push('/orders');
        return;
      }

      // Non-Tunai via Midtrans Snap
      if (data.snapToken && window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            alert('Pembayaran Berhasil!');
            router.push('/orders');
          },
          onPending: () => {
            alert('Menunggu penyelesaian pembayaran.');
            router.push('/orders');
          },
          onError: () => {
            alert('Pembayaran gagal atau dibatalkan.');
            router.push('/orders');
          },
          onClose: () => {
            router.push('/orders');
          },
        });
      } else {
        router.push('/orders');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-white">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">Keranjang Belanja Part</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
            <p className="text-zinc-400 font-bold text-sm">Keranjang Anda masih kosong.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Jelajahi Katalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* List Item Keranjang */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-red-500 uppercase">{item.brand}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h3>
                      {item.color && (
                        <p className="text-[11px] text-zinc-400">
                          Warna: <strong className="text-zinc-300 font-normal">{item.color}</strong>
                        </p>
                      )}
                      <p className="text-xs font-bold text-red-400 mt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                      title="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Checkout */}
            <form onSubmit={handleCheckout} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 h-fit">
              <h2 className="text-base font-black border-b border-zinc-800/80 pb-3">Ringkasan & Pengiriman</h2>

              {/* Input Alamat (Otomatis terisi dari profil user) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Alamat Tujuan:
                  </label>
                  {fetchingAddress && (
                    <span className="text-[10px] text-zinc-500 italic">Mengambil alamat akun...</span>
                  )}
                </div>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Alamat lengkap penerima..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  *Otomatis terisi dari profil Anda. Bisa diubah jika dikirim ke lokasi berbeda.
                </span>
              </div>

              {/* Pilihan Kurir & Biaya Ongkir Berbeda */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" /> Jasa Ekspedisi:
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                >
                  <option value="Shopee Express (SPX)">Shopee Express (SPX) - Rp 20.000</option>
                  <option value="SiCepat Cargo">SiCepat Cargo - Rp 22.000</option>
                  <option value="J&T Express">J&T Express - Rp 24.000</option>
                  <option value="JNE Reguler">JNE Reguler - Rp 28.000</option>
                </select>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Metode Pembayaran:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      paymentMethod === 'ONLINE'
                        ? 'border-red-600 bg-red-950/20 ring-1 ring-red-600'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <CreditCard className={`w-4 h-4 ${paymentMethod === 'ONLINE' ? 'text-red-500' : 'text-zinc-500'}`} />
                      <span className="text-[10px] bg-red-600/20 text-red-400 px-1.5 py-0.2 rounded font-bold">Transfer/QRIS</span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Non-Tunai</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Midtrans Instant</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      paymentMethod === 'COD'
                        ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Banknote className={`w-4 h-4 ${paymentMethod === 'COD' ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">Bayar Kurir</span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">COD</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Bayar di Tempat</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rincian Subtotal, Ongkir & Total */}
              <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal Part:</span>
                  <span className="font-mono text-zinc-200">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Ongkir ({courier}):</span>
                  <span className="font-mono text-amber-400">+Rp {currentShippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-zinc-800/60">
                  <span>Total Bayar:</span>
                  <span className="text-red-500 font-black text-base">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wider"
              >
                <span>{loading ? 'Memproses...' : paymentMethod === 'COD' ? 'Pesan Sekarang (COD)' : 'Bayar Sekarang (Midtrans)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaksi aman & terverifikasi sistem VTX.</span>
              </p>
            </form>
          </div>
        )}
      </div>
    </>
  );
}