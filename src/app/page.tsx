import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ brand?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  // 1. Cek sesi pengguna yang sedang aktif
  const session = await auth();
  const role = (session?.user as any)?.role;

  // 2. Redirect otomatis jika role Admin atau Staff
  if (role === 'ADMIN') {
    redirect('/admin');
  } else if (role === 'STAFF') {
    redirect('/staff');
  }

  // 3. Logika Filter Brand & Pencarian Dinamis
  const resolvedParams = await searchParams;
  const brandFilter = resolvedParams.brand;
  const searchQuery = resolvedParams.q;

  const andConditions: any[] = [];

  if (brandFilter && brandFilter !== 'All') {
    andConditions.push({
      brand: { equals: brandFilter, mode: 'insensitive' },
    });
  }

  if (searchQuery && searchQuery.trim() !== '') {
    andConditions.push({
      name: { contains: searchQuery.trim(), mode: 'insensitive' },
    });
  }

  const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

  let rawProducts: any[] = [];
  try {
    // Ambil produk beserta relasi review jika tersedia
    rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error saat fetch dengan relasi reviews, mencoba fallback tanpa include:', error);
    try {
      // Fallback aman jika migrasi relasi reviews di schema Product belum dijalankan
      rawProducts = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
    } catch (fallbackError) {
      console.error('Gagal mengambil data produk dari database:', fallbackError);
    }
  }

  // 4. Kalkulasi Rata-rata Rating dan Total Ulasan per Produk
  const products = rawProducts.map((p) => {
    const reviewsList = p.reviews || [];
    const totalReviews = reviewsList.length;
    const avgRating =
      totalReviews > 0
        ? Number((reviewsList.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    return {
      ...p,
      averageRating: avgRating,
      reviewCount: totalReviews,
    };
  });

  const brands = ['All', 'VTX', 'Brembo', 'WR3', 'KTC'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8 sm:mb-10 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          VTX <span className="text-red-600">CNC PERFORMANCE</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-xs sm:text-sm md:text-base leading-relaxed">
          Katalog komponen billet CNC presisi tinggi untuk performa dan modifikasi motor harian maupun race.
        </p>

        {/* Filter Brand & Search Bar Responsif */}
        <form method="GET" className="mt-6 sm:mt-8 flex flex-col md:flex-row gap-3 sm:gap-4">
          {brandFilter && brandFilter !== 'All' && (
            <input type="hidden" name="brand" value={brandFilter} />
          )}

          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Cari part CNC (e.g. Kaliper, Underbone)..."
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl flex-1 focus:outline-none focus:border-red-600 text-xs sm:text-sm"
          />

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {brands.map((b) => {
              const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
              const targetHref =
                b === 'All'
                  ? `/?${searchQuery ? `q=${encodeURIComponent(searchQuery)}` : ''}`
                  : `/?brand=${b}${queryParam}`;

              const isActive = brandFilter === b || (!brandFilter && b === 'All');

              return (
                <a
                  key={b}
                  href={targetHref}
                  className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold uppercase transition border whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {b}
                </a>
              );
            })}
          </div>
        </form>
      </div>

      {/* Grid Katalog Produk */}
      {products.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 px-4">
          <p className="text-zinc-400 font-bold text-sm">Belum ada produk CNC yang tersedia.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Jika database baru di-reset, jalankan <code className="text-red-400">npx prisma db seed</code> di terminal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}