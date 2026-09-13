import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand,
        price: parseInt(body.price, 10),
        stock: parseInt(body.stock, 10),
        description: body.description || '',
        imageUrl: body.imageUrl || '/images/kaliper.jpg',
        colors: Array.isArray(body.colors) ? body.colors.slice(0, 6) : [],
        customVariantTitle: body.customVariantTitle || null,
        customVariants: Array.isArray(body.customVariants) ? body.customVariants.slice(0, 6) : [],
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const updatedProduct = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        brand: body.brand,
        price: parseInt(body.price, 10),
        stock: parseInt(body.stock, 10),
        description: body.description,
        imageUrl: body.imageUrl,
        colors: Array.isArray(body.colors) ? body.colors.slice(0, 6) : [],
        customVariantTitle: body.customVariantTitle || null,
        customVariants: Array.isArray(body.customVariants) ? body.customVariants.slice(0, 6) : [],
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}