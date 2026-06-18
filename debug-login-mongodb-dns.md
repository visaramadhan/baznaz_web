# Debug Session: login-mongodb-dns

Status: OPEN

## Gejala
- Browser menampilkan `net::ERR_ABORTED http://localhost:3000/login?_rsc=...`
- Runtime error menampilkan `querySrv ENOTFOUND _mongodb._tcp.cluster0.eifm61e.mongodb.net`

## Hipotesis Awal
1. URI MongoDB di `.env` memakai hostname Atlas yang tidak bisa di-resolve dari mesin lokal saat ini.
2. Aplikasi melakukan koneksi database terlalu awal saat render `/login`, sehingga kegagalan DNS langsung membatalkan request RSC.
3. Komponen shell atau auth memaksa redirect ke `/login`, tetapi halaman login sendiri membutuhkan akses DB dan akhirnya gagal.
4. Ada konfigurasi jaringan lokal, DNS, VPN, proxy, atau firewall yang memblokir lookup SRV `_mongodb._tcp`.
5. Nilai `MONGODB_URI` atau variabel env terkait salah format, salah cluster, atau sudah tidak valid.

## Rencana
- Verifikasi sumber koneksi MongoDB dan jalur kode menuju halaman login.
- Kumpulkan bukti apakah error murni dari environment atau ada coupling kode yang membuat `/login` tidak tahan saat DB down.
- Jika perlu, tambahkan instrumentasi minimal setelah hipotesis dipersempit.

## Bukti
- `src/lib/mongodb.ts` memakai `MONGODB_URI` dari env, dengan fallback hardcoded ke host yang sama: `cluster0.eifm61e.mongodb.net`.
- `src/app/login/page.tsx` memanggil `getProfile()` saat render.
- `src/app/setting/profil/actions.ts#getProfile()` selalu menjalankan `dbConnect()` sebelum mengembalikan profil.
- Uji terminal `nslookup -type=SRV _mongodb._tcp.cluster0.eifm61e.mongodb.net` menghasilkan `Non-existent domain`.

## Evaluasi Hipotesis
1. Terkonfirmasi: hostname Atlas pada URI saat ini tidak dapat di-resolve dari mesin ini.
2. Terkonfirmasi: `/login` memang mengakses DB saat render melalui `getProfile()`.
3. Terkonfirmasi sebagian: redirect ke `/login` terjadi dari shell, tetapi kegagalan utama ada karena halaman login sendiri tergantung DB.
4. Belum pasti: bisa jadi isu DNS lokal, tetapi hasil `dns.google` juga `Non-existent domain`, jadi lebih kuat mengarah ke hostname/cluster yang tidak valid.
5. Terkonfirmasi kuat: URI env sangat mungkin salah cluster, cluster sudah tidak ada, atau nama host Atlas sudah tidak valid.

## Fix Sementara
- `getProfile()` sekarang memakai fallback profil default jika `dbConnect()` gagal, sehingga halaman `/login` tetap bisa dirender.
- `dbConnect()` tidak lagi gagal di tahap import modul; kegagalan koneksi dipindahkan ke saat fungsi dipanggil agar bisa ditangani oleh caller.

## Perbandingan Bukti
- Sebelum fix: request `/login` menghasilkan `500` dan browser menampilkan `net::ERR_ABORTED`.
- Sesudah fix: request `/login` dari terminal kembali `200`.
- Log `post-fix` menunjukkan fallback aktif dengan error terkendali:
  - `getProfile fallback profile used`
  - error lama: `querySrv ENOTFOUND _mongodb._tcp.cluster0.eifm61e.mongodb.net`
  - error terbaru setelah pembersihan fallback URI hardcoded: `MONGODB_URI tidak tersedia pada runtime server`

## Status Saat Ini
- Halaman login: bisa tampil.
- Login kredensial nyata ke database: belum pulih karena `MONGODB_URI` valid belum tersedia pada runtime.
- Logo dari database: tidak tampil karena `getProfile()` masuk ke fallback default saat DB gagal diakses.

## Update Setelah URI Baru
- `MONGODB_URI` baru sudah dipasang ke `.env.local`.
- Uji koneksi langsung dengan Mongoose: berhasil (`MONGODB_CONNECT_OK`).
- Dev server sudah direstart dan `/login` merespons `200`.
- Endpoint `/api/auth/session` merespons `200`.
- Query koleksi `profiles` berhasil dan mengembalikan data profil beserta logo:
  - nama: `BAZNAS Microfinance Kota Bandung`
  - logo: `/uploads/logo-1770870631384.jpeg`

## Status Terbaru
- Koneksi database: pulih.
- Halaman login: pulih.
- Data profil/logo dari DB: tersedia.
- Menunggu verifikasi pengguna di browser untuk memastikan tampilan dan proses login sudah normal.
