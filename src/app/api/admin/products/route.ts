import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      brand: body.brand,
      price: parseInt(body.price, 10),
      stock: parseInt(body.stock, 10),
      description: body.description,
      imageUrl: body.imageUrl || '/images/vtx-caliper-monoblock.jpg',
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}