import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 1. GET: Ambil daftar seluruh pesanan untuk antrean staf
export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'STAFF' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Pada function GET di src/app/api/staff/orders/route.ts:
const orders = await prisma.order.findMany({
  include: {
    user: {
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    },
    items: {
      include: {
        product: true,
      },
    },
    reviews: {
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
});

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PATCH: Update Status Pesanan (Konfirmasi Pembayaran / Masukkan Resi)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'STAFF' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status, courier, trackingNumber } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(courier && { courier }),
        ...(trackingNumber && { trackingNumber }),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}