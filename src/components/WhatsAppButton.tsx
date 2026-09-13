'use client';
import { MessageCircle } from 'lucide-react';

interface Props {
  productName?: string;
}

export default function WhatsAppButton({ productName }: Props) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';
  const message = productName
    ? encodeURIComponent(`Halo VTX Admin, saya tertarik memesan produk CNC ${productName}. Apakah stok tersedia?`)
    : encodeURIComponent('Halo VTX Admin, saya ingin konsultasi part CNC modifikasi motor.');

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 z-50 transition transform hover:scale-105"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="text-sm font-bold hidden sm:inline">Tanya CS via WhatsApp</span>
    </a>
  );
}