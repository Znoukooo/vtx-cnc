import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 1. GET: Ambil Data Profil User yang Sedang Login
export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PUT: Update Data Profil & Ganti Password
export async function PUT(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const updateData: any = {
      name: name || user.name,
      phone: phone || null,
      address: address || null,
    };

    // Jika user ingin mengganti password
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Masukkan password saat ini untuk verifikasi keamanan' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password baru minimal 6 karakter' },
          { status: 400 }
        );
      }

      // Cek password saat ini
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordMatch) {
        return NextResponse.json(
          { error: 'Password saat ini yang Anda masukkan salah' },
          { status: 400 }
        );
      }

      // Hash password baru
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}