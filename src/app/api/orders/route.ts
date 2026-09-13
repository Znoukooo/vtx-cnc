import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 1. GET: Ambil seluruh pesanan milik user login (lengkap dengan items dan review)
export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PATCH: Konfirmasi Pesanan Diterima (Status -> COMPLETED)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. POST: Kirim Penilaian / Review Bintang & Ulasan Teks
// Di bagian POST (submit review):
export async function POST(req: Request) {
    try {
      const session = await auth();
      const userId = (session?.user as any)?.id;
  
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { orderId, rating, comment } = await req.json();
  
      if (!orderId || !rating) {
        return NextResponse.json({ error: 'Order ID dan Rating wajib diisi' }, { status: 400 });
      }
  
      const existingReview = await prisma.review.findFirst({
        where: { orderId, userId },
      });
  
      if (existingReview) {
        return NextResponse.json({ error: 'Anda sudah memberikan penilaian untuk pesanan ini' }, { status: 400 });
      }
  
      // Ambil order beserta itemnya untuk mengambil productId produk utama
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
  
      const primaryProductId = order?.items[0]?.productId || null;
  
      const newReview = await prisma.review.create({
        data: {
          orderId,
          userId,
          productId: primaryProductId,
          rating: Number(rating),
          comment: comment || null,
        },
      });
  
      return NextResponse.json(newReview, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }