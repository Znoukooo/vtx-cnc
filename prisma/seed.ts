import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Akun Admin (Gunakan string langsung 'ADMIN')
  await prisma.user.upsert({
    where: { email: 'admin@vtx.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
    },
    create: {
      name: 'Super Admin VTX',
      email: 'admin@vtx.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '081299990001',
      address: 'VTX Headquarter & CNC Workshop, Tangerang Selatan',
    },
  });

  // 2. Akun Staff (Gunakan string langsung 'STAFF')
  await prisma.user.upsert({
    where: { email: 'staff@vtx.com' },
    update: {
      role: 'STAFF',
      password: hashedPassword,
    },
    create: {
      name: 'Staff Logistik',
      email: 'staff@vtx.com',
      password: hashedPassword,
      role: 'STAFF',
      phone: '081299990002',
      address: 'VTX Distribution Hub Gudang 01, Jakarta',
    },
  });

  // 3. Akun Customer Demo (Gunakan string langsung 'USER')
  await prisma.user.upsert({
    where: { email: 'user@vtx.com' },
    update: {
      role: 'USER',
      password: hashedPassword,
    },
    create: {
      name: 'Customer Demo',
      email: 'user@vtx.com',
      password: hashedPassword,
      role: 'USER',
      phone: '081234567890',
      address: 'Jl. Otomotif Raya No. 45, RT 02 / RW 05, Jakarta Barat',
    },
  });

  // 4. Katalog Produk CNC VTX & Brand Lain (Lengkap dengan data varian)
  const products = [
    {
      name: 'VTX Billet 4-Piston Monoblock Front Caliper',
      brand: 'VTX',
      price: 1850000,
      stock: 15,
      description:
        'Kaliper rem depan 4-piston CNC Billet T6061 Hard Anodized finish. Pengereman sangat pakem dan stabil.',
      imageUrl: '/images/kaliper.jpg',
      colors: ['Red Anodized', 'Deep Blue', 'Metallic Purple', 'Gloss Yellow', 'Chrome Polish', 'Stealth Black'],
      customVariantTitle: 'Kompatibilitas Motor (Bracket)',
      customVariants: ['Honda Vario 125/150/160', 'Honda Beat / Scoopy', 'Yamaha Aerox 155 / NMAX', 'Universal'],
    },
    {
      name: 'VTX Racing Underbone Step Adjustable CNC',
      brand: 'VTX',
      price: 1450000,
      stock: 20,
      description:
        'Footstep underbone bahan duralium alloy T6061 finishing CNC mesin 5-axis. Multi-posisi ergonomis untuk harian atau race.',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600',
      colors: ['Silver Dural', 'Black Hard Anodized', 'Gold Dural'],
      customVariantTitle: 'Tipe Motor Sport',
      customVariants: ['Yamaha R15 V3/V4', 'Yamaha WR155', 'Kawasaki Ninja 150 RR', 'Honda CBR 150R Facelift'],
    },
    {
      name: 'VTX CNC Triple Clamp Fork 33mm Set',
      brand: 'VTX',
      price: 2100000,
      stock: 8,
      description:
        'Segitiga suspensi depan full CNC duralium ringan dan super kaku untuk kestabilan cornering kecepatan tinggi.',
      imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600',
      colors: ['Silver Chrome', 'Stealth Black'],
      customVariantTitle: 'Ukuran As Fork',
      customVariants: ['Diameter 26mm', 'Diameter 31mm', 'Diameter 33mm'],
    },
    {
      name: 'Brembo CNC GP4-RX Billet Caliper Nickel Finish',
      brand: 'Brembo',
      price: 12500000,
      stock: 4,
      description:
        'Kaliper kelas kejuaraan dunia berbahan CNC billet aluminium dengan pelapisan nickel dan piston berpendingin udara.',
      imageUrl: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600',
      colors: ['Nickel Silver Bright'],
      customVariantTitle: 'Pitch Baut Caliper',
      customVariants: ['Pitch 100mm (Radial)', 'Pitch 108mm (Radial)'],
    },
    {
      name: 'WR3 CNC Brake Master Cylinder Reservoir Cap',
      brand: 'WR3',
      price: 320000,
      stock: 25,
      description:
        'Tutup tabung minyak rem presisi tinggi anodized coating warna awet dan tahan korosi bahan bakar.',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
      colors: ['Red Anodized', 'Blue Anodized', 'Gold', 'Black', 'Green'],
      customVariantTitle: 'Ukuran Tabung Minyak',
      customVariants: ['Ukuran Kecil (S30)', 'Ukuran Besar (S50)'],
    },
    {
      name: 'KTC Kytaco CNC Adjustable Clutch Lever Perch',
      brand: 'KTC',
      price: 750000,
      stock: 12,
      description:
        'Dudukan tuas kopling CNC lipat anti-patah saat terjatuh, tarikan kopling jauh lebih enteng.',
      imageUrl: '/images/ktc-clutch-perch.jpg',
      colors: ['Red', 'Blue', 'Gold', 'Black', 'Silver', 'Green', 'Grey / Titanium'],
      customVariantTitle: 'Pilihan Motor Kopling',
      customVariants: [
        'Yamaha R15 / MT-15 / XSR 155',
        'Yamaha WR155R',
        'Kawasaki Ninja 150 R/RR',
        'Kawasaki Ninja 250 FI / ZX25R',
        'Honda CBR 150R / CB150R',
        'Universal Kopling Kabel',
      ],
    },
  ];

  for (const item of products) {
    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.product.create({
        data: item,
      });
    }
  }

  console.log('✔ Seeder akun dan katalog produk CNC VTX berhasil diisi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });