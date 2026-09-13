import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi!' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        role: 'USER',
      },
    });

    return NextResponse.json({
      message: 'Registrasi berhasil!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat membuat akun.' },
      { status: 500 }
    );
  }
}