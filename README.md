# Uprootwear (web thrift marketplace, statis)

Web statis tanpa server dan tanpa database. Semua data produk ada di `js/data.js`, sedangkan akun, keranjang, pesanan, dan stok tersimpan di browser (`localStorage`).

## Akun demo
- Email: `demo@uprootwear.id`
- Password: `demo123`
- Atau tekan tombol **Pakai akun demo** di form masuk.

## Cara menjalankan
- **Lokal:** buka `index.html` dengan klik dua kali. Bisa juga lewat `python -m http.server` lalu buka `http://localhost:8000`.
- **Online lewat GitHub Pages:**
  1. Buat repository baru di GitHub (public).
  2. Upload **seluruh isi folder ini** (file `index.html` harus berada di paling luar repo).
  3. Buka **Settings > Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
  4. Tunggu 1-2 menit. Link-nya: `https://USERNAME.github.io/NAMA-REPO/`

## Mengganti foto produk
1. Lihat `DAFTAR-FOTO.md`: setiap produk punya nama file (`p001.jpg` sampai `p090.jpg`).
2. Simpan foto di folder `images/products/` dengan nama persis itu (format `.jpg`).
3. Selama foto belum ada, web menampilkan placeholder berwarna sesuai kategori.
4. Foto toko (opsional): `images/stores/s01.jpg` sampai `s10.jpg`. Kalau kosong, dipakai inisial toko.

Saran: foto persegi (1:1), lebar sekitar 800 px, ukuran tiap file di bawah 150 KB supaya cepat dibuka di HP.

## Mengubah isi toko dan produk
Edit `js/data.js`. Tiap produk punya: `name`, `price`, `size`, `brand`, `cat`, `cond`, `stock`, `desc`, `added` (jam yang lalu), dan `img`.
Kategori yang tersedia: Atasan, Bawahan, Dress, Outerwear, Sepatu, Tas, Aksesori, Anak.

## Alur untuk demo video
1. Buka beranda sebagai guest, cari produk, coba filter.
2. Buka detail produk, tekan **Keranjang**. Form masuk/daftar muncul, setelah login barang otomatis masuk keranjang.
3. Keranjang, Checkout, Buat pesanan.
4. Di detail pesanan, tombol demo memajukan status: Menunggu Pembayaran, Dikemas, Dikirim, Selesai.
5. Untuk rekaman ulang dari awal: **Profil > Reset data demo** (mengembalikan stok, keranjang, dan pesanan).

## Catatan
- Ini prototipe. Password disimpan polos di browser, jadi jangan dipakai untuk data sungguhan.
- Data tidak dibagi antar perangkat. Akun yang dibuat di satu HP tidak muncul di HP lain.
- Font memakai Google Fonts (Cormorant Garamond dan Figtree). Kalau offline, otomatis pakai font bawaan sistem.
