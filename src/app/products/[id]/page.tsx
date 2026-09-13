import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shadow-md"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-red-500 tracking-widest bg-red-950/60 px-2.5 py-1 rounded">
              {product.brand}
            </span>
            <h1 className="text-3xl font-extrabold mt-3">{product.name}</h1>
            <p className="text-3xl font-black text-white mt-4">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Stok Tersedia: <span className="text-emerald-400 font-semibold">{product.stock} pcs</span>
            </p>

            <div className="mt-6 border-t border-zinc-800 pt-5">
              <h3 className="text-sm font-semibold text-zinc-300">Deskripsi & Spesifikasi Material:</h3>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ProductCard product={product} />
          </div>
        </div>
      </div>
      <WhatsAppButton productName={product.name} />
    </div>
  );
}