import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const [users, orders] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany(),
    ]);

    // Hitung omzet hanya dari pesanan yang valid atau lunas
    const revenue = orders
      .filter((o) => ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      stats: {
        revenue,
        totalOrders: orders.length,
        totalUsers: users.length,
      },
      users: users || [],
    });
  } catch (err: any) {
    console.error('Error in master-data API:', err);
    return NextResponse.json({ error: err.message, users: [], stats: { revenue: 0, totalOrders: 0, totalUsers: 0 } }, { status: 500 });
  }
}