'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingCart, Zap, Check, Star } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface ProductProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    stock: number;
    description?: string | null;
    imageUrl: string;
    colors?: string[];
    customVariantTitle?: string | null;
    customVariants?: string[];
    averageRating?: number;
    reviewCount?: number;
  };
}

// Preset Warna Bawaan Khusus Produk Master
const KTC_DEFAULT_COLORS = [
  { name: 'Red', hex: 'bg-red-600' },
  { name: 'Blue', hex: 'bg-blue-600' },
  { name: 'Gold', hex: 'bg-amber-500' },
  { name: 'Black', hex: 'bg-zinc-950 border-zinc-700' },
  { name: 'Silver', hex: 'bg-zinc-200 border-zinc-400' },
  { name: 'Green', hex: 'bg-emerald-600' },
  { name: 'Grey / Titanium', hex: 'bg-zinc-600' },
];

const CALIPER_DEFAULT_COLORS = [
  { name: 'Red Anodized', hex: 'bg-red-600' },
  { name: 'Deep Blue', hex: 'bg-blue-600' },
  { name: 'Metallic Purple', hex: 'bg-purple-600' },
  { name: 'Gloss Yellow', hex: 'bg-yellow-500' },
  { name: 'Chrome Polish', hex: 'bg-zinc-200 border-zinc-400' },
  { name: 'Stealth Black', hex: 'bg-zinc-950 border-zinc-700' },
];

// Helper penentu warna lingkaran dinamis
const getColorCircleClass = (colorName: string) => {
  const c = colorName.toLowerCase();
  if (c.includes('red') || c.includes('merah')) return 'bg-red-600';
  if (c.includes('blue') || c.includes('biru')) return 'bg-blue-600';
  if (c.includes('gold') || c.includes('kuning') || c.includes('yellow')) return 'bg-amber-500';
  if (c.includes('black') || c.includes('hitam')) return 'bg-zinc-950 border-zinc-700';
  if (c.includes('silver') || c.includes('chrome') || c.includes('putih') || c.includes('white')) return 'bg-zinc-200 border-zinc-400';
  if (c.includes('green') || c.includes('hijau')) return 'bg-emerald-600';
  if (c.includes('purple') || c.includes('ungu')) return 'bg-purple-600';
  if (c.includes('grey') || c.includes('titanium') || c.includes('abu')) return 'bg-zinc-600';
  return 'bg-red-500';
};

export default function ProductCard({ product }: ProductProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const isClutchProduct = product.name.toLowerCase().includes('clutch');
  const isCaliperProduct = product.name.toLowerCase().includes('caliper') || product.name.toLowerCase().includes('kaliper');

  // 1. Tentukan pilihan warna
  let displayColors: { name: string; hex: string }[] = [];
  if (product.colors && product.colors.length > 0) {
    displayColors = product.colors.map((c) => ({
      name: c,
      hex: getColorCircleClass(c),
    }));
  } else if (isClutchProduct) {
    displayColors = KTC_DEFAULT_COLORS;
  } else if (isCaliperProduct) {
    displayColors = CALIPER_DEFAULT_COLORS;
  }

  // 2. Tentukan pilihan varian kustom
  let customTitle = product.customVariantTitle;
  let customOptions = product.customVariants && product.customVariants.length > 0 ? product.customVariants : [];

  if (customOptions.length === 0) {
    if (isClutchProduct) {
      customTitle = 'Pilihan Motor Kopling:';
      customOptions = [
        'Yamaha R15 / MT-15 / XSR 155',
        'Yamaha WR155R',
        'Kawasaki Ninja 150 R/RR',
        'Kawasaki Ninja 250 FI / ZX25R',
        'Honda CBR 150R / CB150R',
        'Universal Kopling Kabel',
      ];
    } else if (isCaliperProduct) {
      customTitle = 'Kompatibilitas Motor (Bracket):';
      customOptions = [
        'Honda Vario 125/150/160',
        'Honda Beat / Scoopy',
        'Yamaha Aerox 155 / NMAX',
        'Universal',
      ];
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const [selectedColor, setSelectedColor] = useState(displayColors[0]?.name || '');
  const [selectedCustom, setSelectedCustom] = useState(customOptions[0] || '');
  const [selectedDiscSize, setSelectedDiscSize] = useState('220mm');

  const handleOpenModal = () => {
    setQuantity(1);
    setSelectedColor(displayColors[0]?.name || '');
    setSelectedCustom(customOptions[0] || '');
    setSelectedDiscSize('220mm');
    setIsModalOpen(true);
  };

  const getPayload = () => {
    const colorPart = selectedColor ? `-${selectedColor}` : '';
    const customPart = selectedCustom ? `-${selectedCustom}` : '';
    const discPart = isCaliperProduct && (!product.customVariants || product.customVariants.length === 0) ? `-${selectedDiscSize}` : '';
    const uniqueCartId = `${product.id}${colorPart}${customPart}${discPart}`.replace(/\s+/g, '-');

    return {
      id: uniqueCartId,
      productId: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      imageUrl: product.imageUrl,
      quantity,
      color: selectedColor || undefined,
      customVariantTitle: customTitle || undefined,
      customVariant: selectedCustom || undefined,
      discSize: discPart ? selectedDiscSize : undefined,
    };
  };

  const handleAddToCart = () => {
    addItem(getPayload());
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsModalOpen(false);
    }, 1200);
  };

  const handleBuyNow = () => {
    addItem(getPayload());
    setIsModalOpen(false);
    router.push('/cart');
  };

  return (
    <>
      {/* CARD PRODUK UTAMA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition duration-200">
        <div>
          <div
            onClick={handleOpenModal}
            className="relative overflow-hidden rounded-lg mb-4 bg-zinc-950 aspect-square cursor-pointer group"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
            />
            <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-red-500 border border-red-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
              {product.brand}
            </span>
          </div>

          <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
            {product.brand}
          </span>
          <h3
            onClick={handleOpenModal}
            className="text-white font-semibold text-sm mt-1 hover:text-red-400 line-clamp-2 cursor-pointer transition"
          >
            {product.name}
          </h3>

          {/* RATING RATA-RATA DARI DATABASE */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold ml-1 text-white text-[11px]">
                {product.averageRating || 5.0}
              </span>
            </div>
            <span className="text-zinc-500 text-[10px]">
              ({product.reviewCount || 0} ulasan)
            </span>
          </div>

          <p className="text-zinc-200 font-extrabold text-base mt-2">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" /> Beli
        </button>
      </div>

      {/* MODAL DETAIL PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl text-white overflow-hidden max-h-[92vh] flex flex-col md:flex-row gap-6">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gambar Produk */}
            <div className="md:w-1/2 flex flex-col justify-start">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-zinc-400">Total Stok:</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  {product.stock} unit tersedia
                </span>
              </div>
            </div>

            {/* Form Varian & Detail */}
            <div className="md:w-1/2 flex flex-col justify-between overflow-y-auto max-h-[80vh] pr-1">
              <div>
                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-950/60 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <h2 className="text-lg font-bold mt-1.5 leading-snug">{product.name}</h2>
                <p className="text-2xl font-black text-red-500 mt-2">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>

                {product.description && (
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                )}

                {/* 1. Pilihan Warna */}
                {displayColors.length > 0 && (
                  <div className="mt-4 border-t border-zinc-800/80 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-zinc-300 uppercase">PILIHAN WARNA:</label>
                      <span className="text-xs text-red-500 font-semibold">{selectedColor}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {displayColors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                            selectedColor === c.name
                              ? 'border-red-600 bg-zinc-950 text-white font-bold ring-1 ring-red-600'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full border border-black/30 shrink-0 ${c.hex}`} />
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Pilihan Varian Kustom / Tipe Motor */}
                {customOptions.length > 0 && (
                  <div className="mt-4 border-t border-zinc-800/80 pt-3">
                    <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase">
                      {customTitle || 'PILIHAN VARIAN:'}
                    </label>
                    <select
                      value={selectedCustom}
                      onChange={(e) => setSelectedCustom(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-600 transition"
                    >
                      {customOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Khusus Piringan Disc Kaliper Bawaan */}
                {isCaliperProduct && (!product.customVariants || product.customVariants.length === 0) && (
                  <div className="mt-4 border-t border-zinc-800/80 pt-3">
                    <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase">
                      UKURAN PIRINGAN / DISC BRAKE:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['190mm', '220mm', '260mm', '300mm'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedDiscSize(size)}
                          className={`py-2 text-center text-xs font-bold rounded-lg border transition ${
                            selectedDiscSize === size
                              ? 'bg-red-600 border-red-600 text-white shadow'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Kuantitas & Tombol Beli */}
              <div className="mt-6 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-zinc-300">Jumlah:</span>
                  <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="p-1 text-zinc-400 hover:text-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-2">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                      className="p-1 text-zinc-400 hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-zinc-400 mb-4">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white text-sm">
                    Rp {(product.price * quantity).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Masuk Keranjang
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> + Keranjang
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
                  >
                    <Zap className="w-4 h-4" /> Beli Sekarang
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}