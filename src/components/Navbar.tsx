'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingCart,
  Package,
  User,
  LogOut,
  LogIn,
  ShieldAlert,
  Truck,
  Boxes,
  LayoutDashboard,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

function NavbarContent() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN';
  const isStaff = userRole === 'STAFF';

  return (
    <nav
      suppressHydrationWarning
      className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 transition-all"
    >
      <div
        suppressHydrationWarning
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
      >
        {/* SISI KIRI: BRAND LOGO */}
        <div className="flex items-center gap-6">
          <Link
            href={isAdmin ? '/admin' : isStaff ? '/staff' : '/'}
            className="flex items-center gap-2 group"
          >
            <span className="text-red-600 font-black text-2xl tracking-wider group-hover:scale-105 transition-transform">
              VTX
            </span>
            <div className="flex flex-col">
              <span className="text-zinc-200 font-extrabold text-xs uppercase tracking-widest leading-none">
                Performance
              </span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
                {isAdmin ? 'Admin Console' : isStaff ? 'Staff Hub' : 'Store Official'}
              </span>
            </div>
          </Link>

          {/* INDIKATOR SERVER STATUS (KHUSUS ADMIN & STAFF) */}
          {(isAdmin || isStaff) && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>DB LIVE: POSTGRES</span>
            </div>
          )}
        </div>

        {/* SISI KANAN: MENU NAVIGASI BERDASARKAN ROLE */}
        <div
          suppressHydrationWarning
          className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-300"
        >
          {!mounted ? (
            <div className="w-24 h-8" />
          ) : isAdmin ? (
            /* ================= MENU KHUSUS ADMIN ================= */
            <>
              {/* Menu Dashboard / Ringkasan Analitik */}
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                  pathname === '/admin' && currentTab !== 'products'
                    ? 'bg-zinc-800 border-zinc-700 text-white font-bold'
                    : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Overview & Users</span>
              </Link>

              {/* Menu Master Products */}
              <Link
                href="/admin?tab=products"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                  pathname === '/admin' && currentTab === 'products'
                    ? 'bg-zinc-800 border-zinc-700 text-white font-bold'
                    : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-blue-400" />
                <span>Products CRUD</span>
              </Link>

              {/* Tautan Monitoring Antrean Staff */}
              <Link
                href="/staff"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-400 hover:bg-amber-900/50 hover:text-amber-300 transition"
                title="Buka Antrean Staf Logistik"
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Staff Desk</span>
              </Link>

              {/* Profil Badge Super Admin */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="flex items-center gap-1.5 bg-red-950/70 border border-red-800 text-red-300 px-2.5 py-1 rounded-lg text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {session?.user?.name || 'Super Admin'}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-1 p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 hover:text-red-400 text-zinc-400 border border-zinc-800 transition"
                  title="Keluar dari Admin Console"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : isStaff ? (
            /* ================= MENU KHUSUS STAFF ================= */
            <>
              <Link
                href="/staff"
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 hover:bg-amber-900/80 transition flex items-center gap-1.5 font-bold shrink-0"
                title="Staff Fulfillment Desk"
              >
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Staff Fulfillment Desk</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <span className="text-zinc-400 text-xs hidden sm:inline">
                  {session?.user?.name || 'Staff'}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-1 p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 hover:text-red-400 text-zinc-400 border border-zinc-800 transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* ================= MENU CUSTOMER / USER BIASA ================= */
            <>
              <Link href="/" className="hover:text-white transition px-2 py-1">
                Katalog
              </Link>

              {session?.user ? (
                <>
                  <Link
                    href="/orders"
                    className="flex items-center gap-1.5 hover:text-white transition px-2 py-1"
                  >
                    <Package className="w-4 h-4 text-zinc-400" />
                    <span className="hidden md:inline">Pesanan Saya</span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-white transition"
                  >
                    <User className="w-3.5 h-3.5 text-red-500" />
                    <span className="font-bold truncate max-w-[120px]">
                      {session.user.name || 'Profil'}
                    </span>
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-1 text-zinc-400 hover:text-red-500 transition px-2 py-1"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg transition font-bold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
              )}

              <Link
                href="/cart"
                className="relative p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition ml-1"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="h-16 border-b border-zinc-800/80 bg-zinc-950" />}>
      <NavbarContent />
    </Suspense>
  );
}