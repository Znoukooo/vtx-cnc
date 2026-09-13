'use client';

import { useEffect, useState } from 'react';
import { Truck, CheckCircle, Printer, Clock, PackageCheck, AlertCircle } from 'lucide-react';

export default function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/staff/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    courier?: string,
    trackingNumber?: string
  ) => {
    try {
      const res = await fetch('/api/staff/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, courier, trackingNumber }),
      });
      if (res.ok) fetchOrders();
    } catch (e) {
      alert('Gagal update status pesanan');
    }
  };

  const printReceipt = (order: any) => {
    const printWindow = window.open('', '', 'width=600,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk VTX Store - #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: monospace; padding: 24px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 12px; }
            .content { margin: 16px 0; border-bottom: 1px dashed #000; padding-bottom: 12px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
            .total { font-weight: bold; display: flex; justify-content: space-between; margin-top: 10px; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">VTX PERFORMANCE STORE</h2>
            <p style="margin: 4px 0 0;">ID: ${order.id}</p>
            <p style="margin: 2px 0 0;">Waktu: ${new Date(order.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <div class="content">
            <p><strong>Customer:</strong> ${order.user?.name || '-'} (${order.user?.phone || '-'})</p>
            <p><strong>Alamat:</strong> ${order.shippingAddress || order.user?.address || '-'}</p>
            <p><strong>Kurir / Resi:</strong> ${order.courier || '-'} / ${order.trackingNumber || '-'}</p>
            <hr style="border: 0.5px dashed #aaa; margin: 10px 0;"/>
            ${order.items
              .map(
                (item: any) => `
                <div class="item">
                  <span>${item.quantity}x ${item.product?.name}</span>
                  <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>`
              )
              .join('')}
            <div class="total">
              <span>TOTAL PEMBAYARAN</span>
              <span>Rp ${order.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div class="footer">
            <p>High Precision CNC Racing Components<br/>Terima kasih telah berbelanja di VTX!</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter((o) =>
    activeTab === 'ALL' ? true : o.status === activeTab
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black">Staff Order Desk</h1>
            <span className="bg-red-950 border border-red-800 text-red-400 text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Antrean FIFO
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pesanan terurut otomatis dari waktu masuk pertama untuk menjaga prioritas pengiriman.
          </p>
        </div>

        {/* Tab Filter Status */}
        <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-center py-16 text-sm">Memuat antrean pesanan...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 text-sm">
          Tidak ada pesanan pada antrean ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col lg:flex-row justify-between gap-6"
            >
              {/* Info Pesanan */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="bg-zinc-800 text-zinc-300 font-mono text-xs px-2 py-0.5 rounded font-bold">
                    FIFO #{idx + 1}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">ID: {order.id}</span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-white text-base">
                    {order.user?.name || 'Customer'}{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      ({order.user?.email} | {order.user?.phone || 'No Telp -'})
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Alamat Tujuan: {order.shippingAddress || order.user?.address || 'Tidak ada data alamat'}
                  </p>
                </div>

                {/* List Barang */}
                <div className="mt-3 bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 space-y-2">
                  {order.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-xs">
                      <span className="text-zinc-300">
                        {it.quantity}x {it.product?.name}
                      </span>
                      <span className="text-zinc-400 font-semibold">
                        Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 flex justify-between text-xs font-bold">
                    <span>Total Transaksi</span>
                    <span className="text-red-500 text-sm">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Kontrol Aksi */}
              <div className="lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Status Saat Ini
                  </span>
                  <span
                    className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded border ${
                      order.status === 'PAID'
                        ? 'bg-blue-950/60 border-blue-800 text-blue-400'
                        : order.status === 'PROCESSING'
                        ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                        : order.status === 'SHIPPED'
                        ? 'bg-purple-950/60 border-purple-800 text-purple-400'
                        : order.status === 'COMPLETED'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {order.status}
                  </span>

                  {(order.courier || order.trackingNumber) && (
                    <div className="text-xs text-purple-400 mt-2 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        {order.courier || 'Kurir Internal'} {order.trackingNumber && `(${order.trackingNumber})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PAID')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi Pembayaran
                    </button>
                  )}

                  {order.status === 'PAID' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <PackageCheck className="w-3.5 h-3.5" /> Siapkan & Packing Barang
                    </button>
                  )}

                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => {
                        const courier = prompt('Nama Ekspedisi/Kurir (misal: J&T / Kurir Toko):', 'J&T Express');
                        if (!courier) return;
                        const trackingNumber = prompt('Masukkan Nomor Resi / Plat Kurir:', 'VTX-EXP-' + Date.now().toString().slice(-5));
                        updateOrderStatus(order.id, 'SHIPPED', courier, trackingNumber || undefined);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Truck className="w-3.5 h-3.5" /> Kirim / Antar ke Tujuan
                    </button>
                  )}

                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Selesaikan Pengantaran
                    </button>
                  )}

                  <button
                    onClick={() => printReceipt(order)}
                    className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}