import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function StaffDashboard() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!['STAFF', 'ADMIN'].includes(role)) redirect('/');

  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  async function updateStatus(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const status = formData.get('status') as any;
    const trackingNumber = formData.get('trackingNumber') as string;
    const courier = formData.get('courier') as string;

    await prisma.order.update({
      where: { id: orderId },
      data: { status, trackingNumber, courier },
    });

    revalidatePath('/dashboard/staff');
    revalidatePath('/orders');
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-white">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Logistik & Manajemen Pesanan</h1>
          <p className="text-zinc-400 text-xs">Role Akses: {role}</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 font-mono">ID: {o.id}</p>
              <p className="font-semibold text-sm mt-1">{o.user.name} ({o.user.email})</p>
              <p className="text-xs text-zinc-400 mt-1">Alamat: {o.shippingAddress || '-'}</p>
              <div className="mt-2 text-xs text-zinc-400">
                {o.items.map((it) => (
                  <span key={it.id} className="mr-2 inline-block bg-zinc-800 px-2 py-0.5 rounded">
                    {it.product.name} (x{it.quantity})
                  </span>
                ))}
              </div>
            </div>

            <form action={updateStatus} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="orderId" value={o.id} />
              <input
                type="text"
                name="courier"
                defaultValue={o.courier || ''}
                placeholder="Kurir (e.g. JNE)"
                className="bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white"
              />
              <input
                type="text"
                name="trackingNumber"
                defaultValue={o.trackingNumber || ''}
                placeholder="Nomor Resi"
                className="bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white"
              />
              <select
                name="status"
                defaultValue={o.status}
                className="bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3.5 py-1.5 rounded font-bold transition">
                Simpan
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}