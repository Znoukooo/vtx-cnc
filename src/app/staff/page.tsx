'use client';

import { useEffect, useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  MessageCircle,
  Package,
  User,
  Phone,
  MapPin,
  History,
  CheckCheck,
  Calendar,
  Eye,
  X,
  Star,
  Banknote,
  CreditCard,
} from 'lucide-react';

export default function StaffPage() {
  const generateTrackingNumber = (courier: string) => {
    const getRandomDigits = (len: number) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');

    const getRandomAlphaNum = (len: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    switch (courier) {
      case 'J&T Express':
        return `JNT${getRandomDigits(10)}`;
      case 'Shopee Express (SPX)':
        return `SPXID${getRandomDigits(10)}`;
      case 'JNE Reguler':
        return `JNE${getRandomDigits(12)}`;
      case 'SiCepat Cargo':
      case 'SiCepat':
        return `00${getRandomDigits(10)}`;
      case 'GoSend Instant':
        return `GS-${getRandomDigits(8)}`;
      case 'GrabExpress Instant':
        return `GK-${getRandomDigits(8)}`;
      case 'Ambil di Toko':
      case 'Ambil di Toko (Pickup)':
        return `PICKUP-${getRandomAlphaNum(6)}`;
      default:
        return `VTX-${getRandomDigits(10)}`;
    }
  };

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingForm, setShippingForm] = useState({
    courier: 'J&T Express',
    trackingNumber: '',
  });

  const [detailOrder, setDetailOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/orders');
      if (!res.ok) throw new Error('Gagal mengambil data pesanan');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/staff/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        loadOrders();
      } else {
        alert('Gagal memperbarui status pesanan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleSendPaymentReminder = (order: any) => {
    let customerPhone = order.user?.phone || '';
    if (!customerPhone) {
      customerPhone = prompt('Nomor telepon belum ada di profil. Masukkan nomor WhatsApp tujuan:', '') || '';
    }

    if (!customerPhone.trim()) return;

    let formattedPhone = customerPhone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const itemsSummary = order.items
      .map((item: any) => `- ${item.product?.name} (${item.quantity}x)`)
      .join('\n');

    const message = `Halo Kak *${order.user?.name || 'Pelanggan VTX'}*,\n\n` +
      `Kami dari *Tim Logistik Velocity Tech Xperience (VTX)* menginfokan bahwa pesanan Anda:\n` +
      `No. Pesanan: *#${order.id.slice(0, 8).toUpperCase()}*\n` +
      `Total: *Rp ${order.totalAmount.toLocaleString('id-ID')}*\n\n` +
      `Rincian Part:\n${itemsSummary}\n\n` +
      `Status saat ini masih *MENUNGGU PEMBAYARAN*.\n` +
      `Silakan selesaikan pembayaran Anda agar part CNC dapat langsung kami proses dan kirimkan. Terima kasih! 🙏🔧`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmitShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch('/api/staff/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: 'SHIPPED',
          courier: shippingForm.courier,
          trackingNumber: shippingForm.trackingNumber,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        setShippingForm({ courier: 'J&T Express', trackingNumber: '' });
        loadOrders();
      } else {
        alert('Gagal input resi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan resi.');
    }
  };

  const printReceipt = (order: any) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Transaksi VTX - #${order.id.slice(0, 8)}</title>
          <style>
            @page { size: 80mm auto; margin: 4mm; }
            body { font-family: 'Courier New', Courier, monospace; color: #000; margin: 0; padding: 6px; font-size: 11px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .item-title { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin: 0; font-size: 14px; font-weight: 900;">VTX PERFORMANCE STORE</h2>
            <p style="margin: 2px 0 0; font-size: 9px;">High Precision CNC Billet Components</p>
          </div>
          <div class="divider"></div>
          <div class="row"><span>Order ID:</span><span class="bold">#${order.id.slice(0, 8).toUpperCase()}</span></div>
          <div class="row"><span>Waktu:</span><span>${new Date(order.createdAt).toLocaleString('id-ID')}</span></div>
          <div class="row"><span>Customer:</span><span class="bold">${order.user?.name || 'Customer'}</span></div>
          <div class="row"><span>Kurir:</span><span class="bold">${order.courier || '-'}</span></div>
          <div class="row"><span>No. Resi:</span><span class="bold">${order.trackingNumber || '-'}</span></div>
          <div class="row"><span>Status:</span><span class="bold">${order.status}</span></div>
          <div class="divider"></div>
          ${order.items.map((item: any) => `
            <div style="margin-bottom: 5px;">
              <div class="item-title">${item.product?.name}</div>
              <div class="row">
                <span>${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                <span class="bold">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="row" style="font-size: 12px;"><span class="bold">TOTAL DIBAYAR</span><span class="bold">Rp ${order.totalAmount.toLocaleString('id-ID')}</span></div>
          <div class="divider"></div>
          <div class="center" style="font-size: 9px; margin-top: 6px;">
            <p style="margin: 0;">Barang lolos Quality Control Billet CNC.</p>
            <p style="margin: 3px 0 0; font-weight: bold;">Terima kasih atas order Anda!</p>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };

  const activeOrders = orders.filter((o) => ['PENDING', 'UNPAID', 'PAID', 'PROCESSING'].includes(o.status));
  const historyOrders = orders.filter((o) => ['SHIPPED', 'COMPLETED', 'CANCELLED'].includes(o.status));

  const filteredActiveOrders = activeOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.phone || '').includes(searchTerm);

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'UNPAID') return matchesSearch && (o.status === 'PENDING' || o.status === 'UNPAID');
    if (statusFilter === 'PAID') return matchesSearch && (o.status === 'PAID' || o.status === 'PROCESSING');
    return matchesSearch;
  });

  const filteredHistoryOrders = historyOrders.filter((o) => {
    return (
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.courier || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-white">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 sm:w-7 h-7 text-amber-500 shrink-0" />
            <span>Staff Fulfillment Desk</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Pantau antrean pesanan masuk, verifikasi status bayar, kirim follow-up WhatsApp, serta arsip histori pengiriman.
          </p>
        </div>

        {/* Tab Switcher: Full Width Mobile */}
        <div className="grid grid-cols-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 text-xs font-bold w-full sm:w-auto self-start">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`py-2 px-2.5 sm:px-4 rounded-lg flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeTab === 'ACTIVE' ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Antrean ({activeOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2 px-2.5 sm:px-4 rounded-lg flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeTab === 'HISTORY' ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Histori ({historyOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Filter dan Pencarian Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'ACTIVE'
                ? 'Cari ID pesanan, nama pembeli, no WhatsApp...'
                : 'Cari resi, kurir, nama penerima...'
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="flex gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
            {[
              { label: 'Semua', value: 'ALL' },
              { label: 'Belum Bayar', value: 'UNPAID' },
              { label: 'Siap Diproses', value: 'PAID' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs ${
                  statusFilter === tab.value
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= TAB 1: ANTREAN AKTIF BERJALAN ================= */}
      {activeTab === 'ACTIVE' && (
        <>
          {loading ? (
            <div className="py-20 text-center text-zinc-500 text-sm">Memuat antrean...</div>
          ) : filteredActiveOrders.length === 0 ? (
            <div className="py-16 sm:py-20 text-center bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl p-4">
              <Package className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm font-bold">Tidak ada antrean yang membutuhkan tindakan.</p>
              <p className="text-zinc-600 text-xs mt-1">Semua pesanan sudah dikirim atau berpindah ke histori.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActiveOrders.map((order) => {
                const isPaid = order.status !== 'PENDING' && order.status !== 'UNPAID';

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
  <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
    #{order.id.slice(0, 8).toUpperCase()}
  </span>

  {/* LABEL METODE PEMBAYARAN: COD vs NON-TUNAI */}
  {order.paymentMethod === 'COD' ? (
    <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase shadow-sm">
      <Banknote className="w-3 h-3" />
      <span>COD (TAGIH TUNAI)</span>
    </span>
  ) : (
    <span className="bg-blue-950/80 border border-blue-800 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
      <CreditCard className="w-3 h-3" />
      <span>NON-TUNAI (MIDTRANS)</span>
    </span>
  )}

  {isPaid ? (
    <span className="bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
      <CheckCircle2 className="w-3 h-3" />
      <span>DIPROSES</span>
    </span>
  ) : (
    <span className="bg-amber-950/70 border border-amber-800 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
      <Clock className="w-3 h-3" />
      <span>BELUM DIBAYAR</span>
    </span>
  )}
</div>

                      {/* Detail Customer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-300 pt-1">
                        <div className="flex items-center gap-1.5 font-bold text-white truncate">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{order.user?.name || 'Customer'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono">{order.user?.phone || 'Tanpa WhatsApp'}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-zinc-400 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed text-[11px]">
                            {order.shippingAddress || order.user?.address || 'Alamat tidak diinput'}
                          </span>
                        </div>
                      </div>

                      {/* Detail Part */}
                      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-xs space-y-1.5 mt-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-start text-zinc-300 gap-2">
                            <div className="flex items-start gap-1.5 min-w-0">
                              <span className="font-medium text-white truncate">{item.product?.name}</span>
                              <span className="text-zinc-500 shrink-0">x{item.quantity}</span>
                            </div>
                            <span className="font-mono text-zinc-400 shrink-0 text-right">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-xs font-bold">
                          <span className="text-zinc-400">Total Tagihan:</span>
                          <span className="text-red-500 font-extrabold text-sm">
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Tindakan Staff - Responsif Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 shrink-0 lg:w-56 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => handleSendPaymentReminder(order)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                          >
                            <MessageCircle className="w-4 h-4 shrink-0" />
                            <span>Kirim WA Pengingat</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border border-zinc-700 active:scale-[0.98]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Konfirmasi Bayar</span>
                          </button>
                        </>
                      )}

                      {isPaid && (
                        <>
                         <button
  onClick={() => {
    // Ambil kurir yang sudah dipilih user saat checkout (default ke J&T jika kosong)
    const selectedCourier = order.courier || 'J&T Express';
    setSelectedOrder(order);
    setShippingForm({
      courier: selectedCourier,
      trackingNumber: generateTrackingNumber(selectedCourier),
    });
  }}
  className="bg-amber-500 hover:bg-amber-600 text-black py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-[0.98]"
>
  <Truck className="w-4 h-4 shrink-0" />
  <span>Input Resi & Kirim</span>
</button>

                          <button
                            onClick={() => printReceipt(order)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border border-zinc-700 active:scale-[0.98]"
                          >
                            <Printer className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span>Cetak Struk</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: TABEL HISTORI LENGKAP ================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="pb-4 border-b border-zinc-800/80 mb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Arsip Pengiriman & Pesanan Selesai</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Daftar seluruh paket part CNC yang telah dikirimkan ke jasa ekspedisi ataupun yang telah diterima oleh customer.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-zinc-500 text-sm">Memuat riwayat pengiriman...</div>
          ) : filteredHistoryOrders.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Belum ada riwayat pesanan yang selesai atau dikirim.
            </div>
          ) : (
            <>
              {/* TAMPILAN 1: KARTU MOBILE (Hanya Tampil di Layar HP < 768px) */}
              <div className="space-y-3.5 block md:hidden">
                {filteredHistoryOrders.map((hOrder) => {
                  const review = hOrder.reviews && hOrder.reviews.length > 0 ? hOrder.reviews[0] : null;

                  return (
                    <div
                      key={hOrder.id}
                      className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                        <div>
                          <span className="font-mono text-xs font-bold text-white block">
                            #{hOrder.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(hOrder.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        {hOrder.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                            <CheckCheck className="w-3 h-3" />
                            <span>DITERIMA</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-950/80 border border-blue-800 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                            <Truck className="w-3 h-3" />
                            <span>DIKIRIM</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Customer:</span>
                          <span className="font-bold text-white">{hOrder.user?.name || 'Customer'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Belanja:</span>
                          <span className="font-bold text-red-400">
                            Rp {hOrder.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="pt-1 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-amber-400 font-bold uppercase">{hOrder.courier || 'Ekspedisi'}</span>
                            <span className="font-mono text-white font-bold select-all">{hOrder.trackingNumber || '-'}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 line-clamp-1 block">
                            {hOrder.shippingAddress || hOrder.user?.address || 'Ambil di Toko'}
                          </span>
                        </div>
                      </div>

                      {/* Review Mobile Card */}
                      {review ? (
                        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-white ml-1">{review.rating}.0</span>
                          </div>
                          {review.comment && (
                            <p className="text-[11px] text-zinc-300 mt-1 italic line-clamp-2">
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-600 italic block">Belum ada ulasan</span>
                      )}

                      {/* Aksi Mobile */}
                      <div className="flex gap-2 pt-1 border-t border-zinc-800/70">
                        {hOrder.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateStatus(hOrder.id, 'COMPLETED')}
                            className="flex-1 py-2 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                        <button
                          onClick={() => setDetailOrder(hOrder)}
                          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => printReceipt(hOrder)}
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold flex items-center justify-center transition"
                          title="Cetak Struk"
                        >
                          <Printer className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TAMPILAN 2: TABEL DESKTOP (Hanya Tampil di Tablet/PC >= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">ID Order & Tanggal</th>
                      <th className="p-3.5">Penerima & Alamat</th>
                      <th className="p-3.5">Kurir & No. Resi</th>
                      <th className="p-3.5">Total Belanja</th>
                      <th className="p-3.5">Ulasan & Rating</th>
                      <th className="p-3.5 text-center">Status Paket</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredHistoryOrders.map((hOrder) => {
                      const review = hOrder.reviews && hOrder.reviews.length > 0 ? hOrder.reviews[0] : null;

                      return (
                        <tr key={hOrder.id} className="hover:bg-zinc-800/30 transition">
                          <td className="p-3.5">
                            <span className="font-mono text-xs font-bold text-white">
                              #{hOrder.id.slice(0, 8).toUpperCase()}
                            </span>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(hOrder.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-white">{hOrder.user?.name || 'Customer'}</div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-xs mt-0.5">
                              {hOrder.shippingAddress || hOrder.user?.address || 'Ambil di Toko'}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              WA: {hOrder.user?.phone || '-'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="bg-amber-950/60 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              {hOrder.courier || 'Ekspedisi'}
                            </span>
                            <div className="font-mono text-xs font-black text-white mt-1 select-all">
                              {hOrder.trackingNumber || 'Tidak ada resi'}
                            </div>
                          </td>

                          <td className="p-3.5 font-bold text-zinc-200">
                            Rp {hOrder.totalAmount.toLocaleString('id-ID')}
                            <span className="block text-[10px] text-zinc-500 font-normal">
                              {hOrder.items?.length || 0} Part CNC
                            </span>
                          </td>

                          <td className="p-3.5">
                            {review ? (
                              <div className="bg-zinc-950/80 border border-zinc-800 p-2 rounded-lg max-w-[200px]">
                                <div className="flex items-center gap-1 text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-[11px] font-bold text-white ml-1">{review.rating}.0</span>
                                </div>
                                {review.comment ? (
                                  <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2 italic">
                                    "{review.comment}"
                                  </p>
                                ) : (
                                  <span className="text-[10px] text-zinc-500 italic mt-0.5 block">Tanpa ulasan teks</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-600 italic">Belum diulas user</span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            {hOrder.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                                <CheckCheck className="w-3 h-3" />
                                <span>DITERIMA</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-blue-950/80 border border-blue-800 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                                <Truck className="w-3 h-3" />
                                <span>DIKIRIM</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            {hOrder.status === 'SHIPPED' && (
                              <button
                                onClick={() => handleUpdateStatus(hOrder.id, 'COMPLETED')}
                                className="p-1.5 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 rounded-lg transition"
                                title="Tandai Diterima"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setDetailOrder(hOrder)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
                              title="Lihat Detail Pesanan"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            </button>

                            <button
                              onClick={() => printReceipt(hOrder)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
                              title="Cetak Struk"
                            >
                              <Printer className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= MODAL INPUT RESI ================= */}
     {/* ================= MODAL INPUT RESI OTOMATIS ================= */}
{selectedOrder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl text-white">
      <h3 className="text-base font-black mb-1 flex items-center gap-2">
        <Truck className="w-5 h-5 text-amber-500" />
        <span>Kirim Pesanan #{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
      </h3>

      <p className="text-xs text-zinc-400 mb-4">
        Nomor resi otomatis disesuaikan dengan kurir yang dipilih oleh pelanggan.
      </p>

      <form onSubmit={handleSubmitShipping} className="space-y-4 text-xs">
        {/* Tampilan Kurir Terpilih (Statis / Tidak Perlu Dipilih Ulang) */}
        <div>
          <label className="text-zinc-400 font-bold block mb-1">
            Ekspedisi Pilihan Pelanggan:
          </label>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-extrabold text-white text-sm">
                {shippingForm.courier}
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
              Pilihan User
            </span>
          </div>
        </div>

        {/* Input Resi Otomatis */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-300 font-bold">
              Nomor Resi / Pelacakan Otomatis:
            </label>
            <button
              type="button"
              onClick={() =>
                setShippingForm({
                  ...shippingForm,
                  trackingNumber: generateTrackingNumber(shippingForm.courier),
                })
              }
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Acak Ulang
            </button>
          </div>
          <input
            required
            placeholder="Nomor resi pengiriman..."
            value={shippingForm.trackingNumber}
            onChange={(e) =>
              setShippingForm({ ...shippingForm, trackingNumber: e.target.value })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider font-bold text-sm"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-2/3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 uppercase tracking-wider"
          >
            Konfirmasi & Kirim
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ================= MODAL DETAIL HISTORI PESANAN ================= */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl text-white max-h-[88vh] flex flex-col">
            <button
              onClick={() => setDetailOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Package className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black truncate">Detail #{detailOrder.id.slice(0, 8).toUpperCase()}</h3>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1">
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nama Penerima:</span>
                  <span className="font-bold text-white truncate max-w-[60%] text-right">{detailOrder.user?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp:</span>
                  <span className="font-mono text-white">{detailOrder.user?.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ekspedisi:</span>
                  <span className="font-bold text-amber-400">{detailOrder.courier || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">No. Resi:</span>
                  <span className="font-mono font-bold text-white select-all">{detailOrder.trackingNumber || '-'}</span>
                </div>
                <div className="pt-1 text-zinc-400">
                  <span className="text-zinc-500 block">Alamat Tujuan:</span>
                  <span className="text-zinc-300 mt-0.5 block leading-relaxed">
                    {detailOrder.shippingAddress || detailOrder.user?.address || 'Ambil di Toko'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-zinc-300 block mb-2">Item Barang Dibeli:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {detailOrder.items.map((it: any) => (
                    <div
                      key={it.id}
                      className="bg-zinc-950 border border-zinc-800/60 p-2.5 rounded-lg flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{it.product?.name}</span>
                        <span className="text-zinc-500 text-[11px]">
                          {it.quantity} unit x Rp {it.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-zinc-300 shrink-0 text-right">
                        Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-400">Total Transaksi:</span>
                <span className="text-red-500 text-base font-black">
                  Rp {detailOrder.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 shrink-0">
              <button
                onClick={() => printReceipt(detailOrder)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setDetailOrder(null)}
                className="w-24 bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl transition text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}