'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Search,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  Package,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  KeyRound,
  Edit3
} from 'lucide-react';

const BRAND_OPTIONS = ['VTX', 'Brembo', 'WR3', 'KTC', 'Nissin', 'RCB', 'Accossato'];

const PRESET_IMAGES = [
  { label: 'VTX Monoblock Caliper', url: '/images/kaliper.jpg' },
  { label: 'KTC Clutch Lever Perch', url: '/images/ktc-clutch-perch.jpg' },
  { label: 'Billet Footstep Underbone', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' },
  { label: 'CNC Triple Clamp Fork', url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600' },
  { label: 'Master Brembo Racing', url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600' },
  { label: 'WR3 Reservoir Anodized', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
];

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PRODUCTS'>(
    tabParam === 'products' ? 'PRODUCTS' : 'ANALYTICS'
  );

  useEffect(() => {
    if (tabParam === 'products') {
      setActiveTab('PRODUCTS');
    } else {
      setActiveTab('ANALYTICS');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'ANALYTICS' | 'PRODUCTS') => {
    setActiveTab(tab);
    router.push(tab === 'PRODUCTS' ? '/admin?tab=products' : '/admin');
  };

  // State Statistik & Pengguna
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    adminCount: 0,
    staffCount: 0,
    userCount: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // State Modal Tambah Akun
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    phone: '',
    address: '',
  });

  // State Modal Edit Data User & Password
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'USER',
    phone: '',
    address: '',
    newPassword: '',
  });

  // State Master Produk
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');

  // State Modal CRUD Produk
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    brand: 'VTX',
    price: '',
    stock: '',
    description: '',
    imageUrl: '/images/kaliper.jpg',
    colors: [] as string[],
    customVariantTitle: '',
    customVariants: [] as string[],
  });

  const [colorInput, setColorInput] = useState('');
  const [customOptionInput, setCustomOptionInput] = useState('');

  const loadData = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/admin/master-data');
      const data = await res.json();

      const userList = data.users || [];
      const adminCount = userList.filter((u: any) => u.role === 'ADMIN').length;
      const staffCount = userList.filter((u: any) => u.role === 'STAFF').length;
      const regularUserCount = userList.filter((u: any) => u.role === 'USER').length;

      setStats({
        revenue: data.stats?.revenue || 0,
        totalOrders: data.stats?.totalOrders || 0,
        totalUsers: userList.length,
        adminCount,
        staffCount,
        userCount: regularUserCount,
      });

      setUsers(userList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
    loadProducts();
  }, []);

  // Handler Tambah Akun Baru
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan akun');

      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'STAFF', phone: '', address: '' });
      loadData();
      alert('Akun baru berhasil dibuat!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Buka Modal Edit User
  const handleOpenEditUser = (u: any) => {
    setEditUserForm({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'USER',
      phone: u.phone || '',
      address: u.address || '',
      newPassword: '',
    });
    setIsEditUserModalOpen(true);
  };

  // Submit Edit Data User & Ganti Password
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui akun');

      setIsEditUserModalOpen(false);
      loadData();
      alert('Data akun berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Hapus User
  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Hapus akun "${name}" secara permanen?`)) {
      try {
        const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus user');
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Handler CRUD Part Produk
  const handleOpenAddProduct = () => {
    setIsEditMode(false);
    setProductForm({
      id: '',
      name: '',
      brand: 'VTX',
      price: '',
      stock: '',
      description: '',
      imageUrl: '/images/kaliper.jpg',
      colors: [],
      customVariantTitle: '',
      customVariants: [],
    });
    setColorInput('');
    setCustomOptionInput('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: any) => {
    setIsEditMode(true);
    setProductForm({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price.toString(),
      stock: p.stock.toString(),
      description: p.description || '',
      imageUrl: p.imageUrl,
      colors: Array.isArray(p.colors) ? p.colors : [],
      customVariantTitle: p.customVariantTitle || '',
      customVariants: Array.isArray(p.customVariants) ? p.customVariants : [],
    });
    setColorInput('');
    setCustomOptionInput('');
    setIsProductModalOpen(true);
  };

  const handleAddColor = () => {
    const val = colorInput.trim();
    if (!val) return;
    if (productForm.colors.length >= 6) {
      alert('Maksimal 6 pilihan warna.');
      return;
    }
    if (!productForm.colors.includes(val)) {
      setProductForm({ ...productForm, colors: [...productForm.colors, val] });
    }
    setColorInput('');
  };

  const handleAddCustomOption = () => {
    const val = customOptionInput.trim();
    if (!val) return;
    if (productForm.customVariants.length >= 6) {
      alert('Maksimal 6 pilihan varian kustom.');
      return;
    }
    if (!productForm.customVariants.includes(val)) {
      setProductForm({ ...productForm, customVariants: [...productForm.customVariants, val] });
    }
    setCustomOptionInput('');
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        loadProducts();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal menyimpan part');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Hapus produk "${name}" dari katalog?`)) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) loadProducts();
      } catch (err) {
        alert('Terjadi kesalahan saat menghapus');
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone || '').includes(userSearch);
    const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesBrand = brandFilter === 'ALL' ? true : p.brand.toLowerCase() === brandFilter.toLowerCase();
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      {/* Header Halaman & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Console</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ringkasan analitik bisnis, manajemen akun staf/admin, dan master katalog CNC.
          </p>
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => handleTabChange('ANALYTICS')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeTab === 'ANALYTICS' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Overview & Users</span>
          </button>
          <button
            onClick={() => handleTabChange('PRODUCTS')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeTab === 'PRODUCTS' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Master Products ({products.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & USERS ================= */}
      {activeTab === 'ANALYTICS' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Pendapatan Bersih</span>
                <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-3">
                Rp {stats.revenue.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-zinc-500 mt-2 block">
                Dihitung dari pesanan yang berstatus sukses / lunas
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Pesanan Masuk</span>
                <div className="p-2 bg-blue-950/60 border border-blue-800/80 rounded-lg text-blue-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-3">{stats.totalOrders} Pesanan</p>
              <span className="text-[11px] text-zinc-500 mt-2 block">
                Semua transaksi tercatat di database VTX
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Pengguna Terdaftar</span>
                <div className="p-2 bg-purple-950/60 border border-purple-800/80 rounded-lg text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-3">{stats.totalUsers} Akun</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-400">
                <span className="text-red-400 font-semibold">{stats.adminCount} Admin</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{stats.staffCount} Staff</span>
                <span>•</span>
                <span className="text-zinc-300 font-semibold">{stats.userCount} User</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
              <div>
                <h2 className="text-lg font-bold">Data Pengguna & Hak Akses</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kelola akun, ubah profil, setel ulang password, atau buat akun Staff & Admin baru.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari user, email, no hp..."
                    className="w-full sm:w-56 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div className="flex gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg text-xs font-semibold">
                  {['ALL', 'USER', 'STAFF', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-md transition ${
                        roleFilter === r
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Tombol Tambah Akun Baru */}
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-red-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Akun Baru</span>
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-16 text-center text-zinc-500 text-sm">Memuat data pengguna...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-sm">
                Tidak ditemukan pengguna yang sesuai.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Pengguna</th>
                      <th className="p-3.5">Kontak</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5 text-center">Total Order</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{u.name || 'Tanpa Nama'}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {u.id.slice(0, 8)}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-zinc-300 font-medium">{u.email}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">{u.phone || 'No Telp (-)'}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded border uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-red-950/70 border-red-800 text-red-400'
                                : u.role === 'STAFF'
                                ? 'bg-amber-950/70 border-amber-800 text-amber-400'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-zinc-300">
                          {u.orders?.length || 0}
                        </td>
                        <td className="p-3.5 text-right">
  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1.5">
    {/* Atas di HP / Kiri di Desktop */}
    <button
      onClick={() => setSelectedUser(u)}
      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
      title="Lihat Detail Pesanan & Profil"
    >
      <Eye className="w-3.5 h-3.5 text-blue-400" />
    </button>

    {/* Tengah di HP / Tengah di Desktop */}
    <button
      onClick={() => handleOpenEditUser(u)}
      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
      title="Edit Data & Password"
    >
      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
    </button>

    {/* Bawah di HP / Kanan di Desktop */}
    <button
      onClick={() => handleDeleteUser(u.id, u.name || u.email)}
      className="p-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition"
      title="Hapus Akun"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= TAB 2: MASTER PRODUCTS (CRUD) ================= */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                <span>Master Data Part & Katalog CNC</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelola nama part, harga, varian warna, varian tipe, dan alokasi stok.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari part atau brand..."
                  className="w-full sm:w-56 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-600 font-semibold"
              >
                <option value="ALL">Semua Brand</option>
                {BRAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <button
                onClick={handleOpenAddProduct}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-red-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Part Baru</span>
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="py-16 text-center text-zinc-500 text-sm">Memuat katalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Tidak ada produk yang sesuai kriteria filter.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Preview</th>
                    <th className="p-3.5">Nama Part & Brand</th>
                    <th className="p-3.5">Harga</th>
                    <th className="p-3.5">Stok</th>
                    <th className="p-3.5">Varian Aktif</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">
                          {p.brand}
                        </span>
                        <div className="font-bold text-white text-sm mt-0.5">{p.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {p.id.slice(0, 8)}</div>
                      </td>
                      <td className="p-3.5 font-bold text-zinc-200">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md font-bold text-[11px] border ${
                            p.stock <= 5
                              ? 'bg-red-950/70 border-red-800 text-red-400'
                              : 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                          }`}
                        >
                          {p.stock} pcs {p.stock <= 5 && '(Kritis)'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1 text-[10px]">
                          {p.colors && p.colors.length > 0 && (
                            <div className="text-zinc-400">
                              <span className="text-red-400 font-semibold">{p.colors.length} Warna:</span>{' '}
                              {p.colors.join(', ')}
                            </div>
                          )}
                          {p.customVariants && p.customVariants.length > 0 && (
                            <div className="text-zinc-400">
                              <span className="text-blue-400 font-semibold">{p.customVariantTitle || 'Kustom'}:</span>{' '}
                              {p.customVariants.join(', ')}
                            </div>
                          )}
                          {(!p.colors || p.colors.length === 0) && (!p.customVariants || p.customVariants.length === 0) && (
                            <span className="text-zinc-600 italic">Tanpa varian</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
  <div className="flex flex-col sm:flex-row items-center justify-end gap-1.5">
    {/* Tombol Edit */}
    <button
      onClick={() => handleEdit(product)}
      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg border border-zinc-700/60 transition"
      title="Edit Part CNC"
    >
      <Edit3 className="w-4 h-4 text-blue-400" />
    </button>

    {/* Tombol Hapus */}
    <button
      onClick={() => handleDelete(product.id)}
      className="p-2 bg-zinc-800/80 hover:bg-red-950/60 text-zinc-300 hover:text-red-400 rounded-lg border border-zinc-700/60 hover:border-red-800 transition"
      title="Hapus Part CNC"
    >
      <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL TAMBAH AKUN BARU ================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-500" />
              <span>Tambah Akun Baru</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nama Lengkap</label>
                <input
                  required
                  placeholder="Nama Staff / Admin"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Alamat Email</label>
                <input
                  required
                  type="email"
                  placeholder="staff2@vtx.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Password Awal</label>
                  <input
                    required
                    type="password"
                    placeholder="Minimal 6 digit"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Peran / Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-bold"
                  >
                    <option value="STAFF">STAFF LOGISTIK</option>
                    <option value="ADMIN">SUPER ADMIN</option>
                    <option value="USER">CUSTOMER BIASA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">No. WhatsApp / Telepon</label>
                <input
                  placeholder="08123456789"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Alamat Domisili</label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap..."
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-red-600/20 uppercase tracking-wider"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT DATA USER & PASSWORD ================= */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsEditUserModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <span>Edit Data & Kredensial Akun</span>
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nama Lengkap</label>
                <input
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Alamat Email</label>
                <input
                  required
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Hak Akses / Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-bold"
                  >
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">No. WhatsApp</label>
                  <input
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Alamat Pengiriman</label>
                <textarea
                  rows={2}
                  value={editUserForm.address}
                  onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Input Ubah Password */}
              <div className="bg-zinc-950 border border-amber-900/40 p-3 rounded-xl">
                <label className="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ubah Password Akun</span>
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika password tidak ingin diubah"
                  value={editUserForm.newPassword}
                  onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 text-[11px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-amber-600/20 uppercase tracking-wider"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CRUD FORM PRODUK ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl p-6 text-white shadow-2xl overflow-y-auto max-h-[92vh]">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-500" />
              <span>{isEditMode ? 'Edit Informasi Part CNC' : 'Tambah Part CNC Baru'}</span>
            </h3>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nama Produk Part</label>
                <input
                  required
                  placeholder="Contoh: VTX Billet 4-Piston Monoblock"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Brand Part</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-semibold"
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    placeholder="Contoh: 1850000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Jumlah Stok (Pcs)</label>
                  <input
                    required
                    type="number"
                    placeholder="10"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Preset Gambar Cepat</label>
                  <select
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 text-[11px]"
                  >
                    <option value="">-- Pilih Template Gambar --</option>
                    {PRESET_IMAGES.map((img) => (
                      <option key={img.label} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">URL / Path Gambar</label>
                <input
                  required
                  placeholder="/images/kaliper.jpg atau link https://"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono text-[11px]"
                />
              </div>

              {/* Varian Warna */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-zinc-200 font-bold flex items-center gap-1.5">
                    <span>Pilihan Varian Warna</span>
                    <span className="text-[10px] text-zinc-500 font-normal">(Maks. 6 Pilihan)</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {productForm.colors.length} / 6
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik warna (e.g. Red Anodized, Chrome, Black)..."
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    disabled={productForm.colors.length >= 6}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-red-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    disabled={productForm.colors.length >= 6 || !colorInput.trim()}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-bold transition"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {productForm.colors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 bg-zinc-900 border border-red-900/60 text-red-300 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            colors: productForm.colors.filter((x) => x !== c),
                          })
                        }
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {productForm.colors.length === 0 && (
                    <span className="text-zinc-600 text-[11px] italic">Belum ada warna ditambahkan.</span>
                  )}
                </div>
              </div>

              {/* Varian Kustom */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-zinc-200 font-bold flex items-center gap-1.5">
                    <span>Varian Kustom Tambahan</span>
                    <span className="text-[10px] text-zinc-500 font-normal">(Maks. 6 Pilihan)</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {productForm.customVariants.length} / 6
                  </span>
                </div>

                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">Nama Label Varian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tipe Motor / Ukuran Bracket"
                    value={productForm.customVariantTitle}
                    onChange={(e) => setProductForm({ ...productForm, customVariantTitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ketik opsi (e.g. Vario 125/150, Aerox 155, 260mm)..."
                    value={customOptionInput}
                    onChange={(e) => setCustomOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomOption();
                      }
                    }}
                    disabled={productForm.customVariants.length >= 6}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-red-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomOption}
                    disabled={productForm.customVariants.length >= 6 || !customOptionInput.trim()}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-bold transition"
                  >
                    + Tambah Opsi
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {productForm.customVariants.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1.5 bg-zinc-900 border border-blue-900/60 text-blue-300 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            customVariants: productForm.customVariants.filter((x) => x !== opt),
                          })
                        }
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {productForm.customVariants.length === 0 && (
                    <span className="text-zinc-600 text-[11px] italic">Belum ada opsi ditambahkan.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Deskripsi Part</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-red-600/20 uppercase tracking-wider"
                >
                  {isEditMode ? 'Simpan Perubahan Data' : 'Simpan Part Baru ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETAIL USER ================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center text-red-500 font-black text-lg">
                {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedUser.name || 'Tanpa Nama'}</h3>
                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase mt-0.5 bg-zinc-800 border-zinc-700 text-zinc-300">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-white font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-white font-medium">
                    {selectedUser.phone || 'Belum mencantumkan nomor HP'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-white font-medium leading-relaxed">
                    {selectedUser.address || 'Belum ada alamat default tersimpan'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-zinc-400" />
                  <span>Riwayat Aktivitas Pesanan ({selectedUser.orders?.length || 0})</span>
                </h4>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedUser.orders.map((o: any) => (
                      <div
                        key={o.id}
                        className="bg-zinc-950 border border-zinc-800/60 p-2.5 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-zinc-500">#{o.id.slice(0, 8)}</span>
                          <span className="ml-2 text-xs font-semibold text-zinc-200">
                            Rp {o.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs italic bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                    Pengguna ini belum pernah melakukan pemesanan.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20 text-sm">Memuat Admin Console...</div>}>
      <AdminContent />
    </Suspense>
  );
}