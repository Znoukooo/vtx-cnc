import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import midtransclient from 'midtrans-client';

const snap = new midtransclient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    // 1. Validasi session dan session.user eksplisit untuk mencegah error "Possibly null"
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Harap login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan. Harap login ulang.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, shippingAddress, courier, paymentMethod, shippingCost = 0 } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja kosong' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const totalAmount = subtotal + Number(shippingCost);

    const isCOD = paymentMethod === 'COD';

    // 2. Transaksi COD
    if (isCOD) {
      const codOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          paymentMethod: 'COD',
          status: 'PROCESSING',
          courier: courier || 'J&T Express (COD)',
          shippingAddress: shippingAddress || null,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId,
              quantity: it.quantity,
              price: it.price,
            })),
          },
        },
      });

      return NextResponse.json({
        success: true,
        orderId: codOrder.id,
        isCOD: true,
      });
    }

    // 3. Transaksi Non-Tunai (Midtrans)
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        paymentMethod: 'ONLINE',
        status: 'PENDING',
        courier: courier || 'J&T Express',
        shippingAddress: shippingAddress || null,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: session.user.name || 'Customer',
        email: session.user.email || 'customer@vtx.com',
      },
    };

    const transaction = await snap.createTransaction(parameter);

    await prisma.order.update({
      where: { id: order.id },
      data: { snapToken: transaction.token },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      snapToken: transaction.token,
      isCOD: false,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}