import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 1. POST: Buat Akun Baru (STAFF / ADMIN / USER)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, phone, address } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar di sistem' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STAFF',
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PUT: Update Data Akun Lengkap + Ganti Password
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, email, role, phone, address, newPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID akun diperlukan' }, { status: 400 });
    }

    const updatePayload: any = {
      name,
      email,
      role,
      phone: phone || null,
      address: address || null,
    };

    // Jika admin mengisi password baru, lakukan hash ulang
    if (newPassword && newPassword.trim() !== '') {
      updatePayload.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. DELETE: Hapus Pengguna
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    if (id === (session?.user as any)?.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}