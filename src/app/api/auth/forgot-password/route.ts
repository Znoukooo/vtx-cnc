import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 1. POST: Minta Kode OTP berdasarkan Nomor HP
export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Nomor HP wajib diisi' }, { status: 400 });
    }

    // Cari user berdasarkan nomor HP (bersihkan karakter spasi atau strip)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: phone },
          { phone: cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : '62' + cleanPhone.slice(1) },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Nomor HP tidak terdaftar pada akun mana pun di VTX' },
        { status: 404 }
      );
    }

    // Generate 6 Digit Angka OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Kedaluwarsa dalam 5 menit
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    // Format nomor WhatsApp internasional (08xxx -> 628xxx)
    let waPhone = cleanPhone;
    if (waPhone.startsWith('0')) {
      waPhone = '62' + waPhone.slice(1);
    }

    // Pesan teks OTP
    const message = `[VTX STORE] Kode verifikasi (OTP) reset password akun Anda adalah: *${otp}*.\nJangan berikan kode ini kepada siapa pun. Berlaku selama 5 menit.`;
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      message: 'Kode OTP berhasil dibuat',
      phone: user.phone,
      waLink, // Link langsung untuk simulasi / redirect WhatsApp
      // Menampilkan OTP di response dev testing agar mudah diuji tanpa gateway berbayar
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PUT: Verifikasi OTP dan Simpan Password Baru
export async function PUT(req: Request) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Nomor HP, OTP, dan Password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: phone },
          { phone: cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : '62' + cleanPhone.slice(1) },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Cek kecocokan OTP
    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return NextResponse.json({ error: 'Kode OTP salah' }, { status: 400 });
    }

    // Cek waktu kedaluwarsa
    if (!user.resetOtpExpiry || new Date() > new Date(user.resetOtpExpiry)) {
      return NextResponse.json({ error: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.' }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan bersihkan OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah! Silakan login kembali.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}