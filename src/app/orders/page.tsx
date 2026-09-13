import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Script from 'next/script';
import Link from 'next/link';
import {
  Trash2,
  XCircle,
  Truck,
  MapPin,
  PackageCheck,
  Clock,
  CheckCircle2,
  Star,
} from 'lucide-react';
import PayOrderButton from '@/components/PayOrderButton';

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/orders');

  const userId = (session.user as any).id;
  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams.status || 'ALL';

  // Ambil semua data pesanan lengkap dengan produk & ulasan
  const allOrders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter kategori berdasarkan tab yang dipilih
  const filteredOrders = allOrders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNPAID') return order.status === 'PENDING' || order.status === 'UNPAID';
    if (activeFilter === 'PROCESSING') return order.status === 'PAID' || order.status === 'PROCESSING';
    if (activeFilter === 'SHIPPED') return order.status === 'SHIPPED';
    if (activeFilter === 'COMPLETED') return order.status === 'COMPLETED';
    return true;
  });

  // Hitung jumlah pada setiap tab
  const counts = {
    ALL: allOrders.length,
    UNPAID: allOrders.filter((o) => o.status === 'PENDING' || o.status === 'UNPAID').length,
    PROCESSING: allOrders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING').length,
    SHIPPED: allOrders.filter((o) => o.status === 'SHIPPED').length,
    COMPLETED: allOrders.filter((o) => o.status === 'COMPLETED').length,
  };

  // Server Action: Batalkan Pesanan
  async function cancelOrder(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    await prisma.order.updateMany({
      where: { id: orderId, userId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
    revalidatePath('/orders');
  }

  // Server Action: Hapus Riwayat Pesanan
  async function deleteOrder(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;

    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    await prisma.order.deleteMany({
      where: {
        id: orderId,
        userId,
        status: { in: ['CANCELLED', 'COMPLETED'] },
      },
    });
    revalidatePath('/orders');
  }

  // Server Action: Konfirmasi Paket Diterima
  async function confirmReceived(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    await prisma.order.updateMany({
      where: { id: orderId, userId, status: 'SHIPPED' },
      data: { status: 'COMPLETED' },
    });
    revalidatePath('/orders');
  }

  // Server Action: Simpan Review Bintang & Komentar
  async function submitReview(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const rating = Number(formData.get('rating') || 5);
    const comment = (formData.get('comment') as string) || '';

    const existingReview = await prisma.review.findFirst({
      where: { orderId, userId },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          orderId,
          userId,
          rating,
          comment: comment.trim() || null,
        },
      });
    }
    revalidatePath('/orders');
  }

  const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-5xl mx-auto px-6 py-10 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Riwayat & Lacak Pengiriman</h1>
            <p className="text-zinc-400 text-xs mt-1">
              Pantau status pesanan, rincian kurir pengantar, konfirmasi penerimaan, atau beri ulasan part.
            </p>
          </div>
        </div>

        {/* Tab Kategori Status */}
        <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-2 mb-8 text-xs font-bold scrollbar-none">
          {[
            { label: 'Semua Riwayat', value: 'ALL', count: counts.ALL },
            { label: 'Belum Bayar', value: 'UNPAID', count: counts.UNPAID },
            { label: 'Dikemas', value: 'PROCESSING', count: counts.PROCESSING },
            { label: 'Dikirim', value: 'SHIPPED', count: counts.SHIPPED },
            { label: 'Selesai', value: 'COMPLETED', count: counts.COMPLETED },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={tab.value === 'ALL' ? '/orders' : `/orders?status=${tab.value}`}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
                activeFilter === tab.value
                  ? 'bg-red-600 text-white font-extrabold shadow-lg shadow-red-600/20'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  activeFilter === tab.value ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-800 p-12 rounded-2xl text-center">
            <p className="text-zinc-400 text-sm">Tidak ada transaksi pada kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentStepIdx = steps.indexOf(order.status);
              const isCancelled = order.status === 'CANCELLED';
              const userReview = order.reviews?.[0] || null;

              return (
                <div
                  key={order.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative transition hover:border-zinc-700"
                >
                  {/* Header Order */}
                  <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-zinc-800 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">ID: #{order.id}</span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-red-500 mt-1">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </h3>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 sm:justify-end">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-red-950/60 text-red-400 border border-red-800'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : order.status === 'SHIPPED'
                            ? 'bg-purple-950/60 text-purple-400 border border-purple-800'
                            : order.status === 'PROCESSING'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            : order.status === 'PAID'
                            ? 'bg-blue-950/60 text-blue-400 border border-blue-800'
                            : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        {order.status}
                      </span>

                      {/* Tombol Lanjutkan Pembayaran */}
                      {order.status === 'PENDING' && (
                        <PayOrderButton snapToken={order.snapToken} />
                      )}

                      {/* Tombol Batalkan */}
                      {order.status === 'PENDING' && (
                        <form action={cancelOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1 bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-700 text-xs px-2.5 py-1 rounded-md transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Batalkan</span>
                          </button>
                        </form>
                      )}

                      {/* Tombol Hapus */}
                      {(isCancelled || order.status === 'COMPLETED') && (
                        <form action={deleteOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 text-xs px-2.5 py-1 rounded-md transition"
                            title="Hapus dari riwayat"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
                            <span>Hapus</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Banner Tracking Saat Pengiriman (SHIPPED) */}
                  {order.status === 'SHIPPED' && (
                    <div className="mt-4 bg-purple-950/40 border border-purple-800/80 text-purple-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-900/60 rounded-full animate-bounce shrink-0">
                          <Truck className="w-5 h-5 text-purple-300" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Pesanan Sedang Dalam Pengantaran ke Tempat Anda!
                          </p>
                          <p className="text-[11px] text-purple-300 mt-0.5">
                            Kurir / Ekspedisi:{' '}
                            <span className="font-semibold text-white">
                              {order.courier || 'Logistik Toko VTX'}
                            </span>
                            {order.trackingNumber && (
                              <span className="ml-2 font-mono text-purple-200">
                                • Resi: <strong>{order.trackingNumber}</strong>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Konfirmasi Diterima */}
                      <form action={confirmReceived} className="shrink-0">
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pesanan Diterima</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Banner Pesanan Selesai */}
                  {order.status === 'COMPLETED' && (
                    <div className="mt-4 bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 p-3 rounded-xl flex items-center gap-3">
                      <PackageCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <p className="text-xs font-semibold">
                        Pesanan telah berhasil diterima dan diselesaikan.
                      </p>
                    </div>
                  )}

                  {/* Tracking Step Progress */}
                  {isCancelled ? (
                    <div className="my-6 p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-400 text-center font-medium">
                      Pesanan ini telah dibatalkan.
                    </div>
                  ) : (
                    <div className="my-8 px-2">
                      <div className="flex justify-between items-center relative">
                        {steps.map((step, idx) => {
                          const isPassed = idx <= currentStepIdx;
                          return (
                            <div key={step} className="flex flex-col items-center z-10">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                  isPassed
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span
                                className={`text-[10px] mt-2 font-semibold ${
                                  isPassed ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}

                        <div className="absolute top-3.5 left-0 w-full h-0.5 bg-zinc-800 -z-0" />
                        <div
                          className="absolute top-3.5 left-0 h-0.5 bg-red-600 transition-all duration-500 -z-0"
                          style={{
                            width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Informasi Alamat Tujuan */}
                  {order.shippingAddress && (
                    <div className="mb-4 flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/60">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>
                        Tujuan:{' '}
                        <strong className="text-zinc-300 font-normal">
                          {order.shippingAddress}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Rincian Produk Pesanan */}
                  <div className="space-y-2 border-t border-zinc-800/80 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-xs text-zinc-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 font-medium">
                            {item.product.name}
                          </span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-zinc-200">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bagian Penilaian / Ulasan Bintang */}
                  {order.status === 'COMPLETED' && (
                    <div className="mt-5 pt-4 border-t border-zinc-800">
                      {userReview ? (
                        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < userReview.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-zinc-700'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-white ml-2">
                                {userReview.rating}/5
                              </span>
                            </div>
                            {userReview.comment && (
                              <p className="text-xs text-zinc-400 mt-1 italic">
                                "{userReview.comment}"
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                            Ulasan Anda tersimpan
                          </span>
                        </div>
                      ) : (
                        <form
                          action={submitReview}
                          className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-white">
                              Beri Penilaian & Ulasan Part CNC:
                            </span>
                          </div>

                          <input type="hidden" name="orderId" value={order.id} />

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400">Pilih Bintang:</span>
                            <select
                              name="rating"
                              defaultValue="5"
                              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
                              <option value="4">⭐⭐⭐⭐ (4 - Bagus)</option>
                              <option value="3">⭐⭐⭐ (3 - Cukup)</option>
                              <option value="2">⭐⭐ (2 - Kurang)</option>
                              <option value="1">⭐ (1 - Kecewa)</option>
                            </select>
                          </div>

                          <textarea
                            name="comment"
                            rows={2}
                            required
                            placeholder="Ceritakan kepuasan Anda mengenai presisi CNC, bahan, respon penjual..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                          />

                          <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-amber-500/20"
                          >
                            Kirim Penilaian
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}