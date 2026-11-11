# Dapur Minggu

PWA ringan untuk mengelola koleksi menu keluarga dan mengacak jadwal mingguan. Frontend memakai HTML, CSS, dan JavaScript tanpa framework atau dependensi runtime. Menu dan jadwal langsung tersimpan di `localStorage`; Service Worker menyimpan shell aplikasi agar halaman dapat dibuka offline setelah kunjungan pertama.

## Jalankan lokal

Buka project melalui server lokal (contoh: `python3 -m http.server 8000`) lalu kunjungi `http://localhost:8000`. PWA perlu HTTPS atau localhost agar bisa dipasang. Jangan membuka `index.html` langsung dari file manager karena Service Worker tidak aktif.

## Deploy ke GitHub Pages

1. Push semua file project ini ke repository GitHub.
2. Buka **Settings → Pages**, pilih branch dan folder root, lalu simpan.
3. Tunggu URL Pages aktif, buka dari Safari iPhone, pilih **Share → Add to Home Screen**.
4. Pastikan seluruh aset memakai path relatif agar berfungsi jika Pages memakai subfolder repository.

## Google Sheets dan Drive

Folder `google-apps-script/Code.gs` menyediakan API kecil untuk sinkronisasi menu dan jadwal ke spreadsheet **RANNU App** yang diberikan. Fungsi `setup()` menambahkan tab `Menus` dan `Schedules` (tab `Sheet1` yang sudah ada dibiarkan apa adanya), dan meletakkan foto baru di folder Drive yang diberikan.

1. Buka [Google Apps Script](https://script.google.com/) dan buat project baru.
2. Ganti isi `Code.gs` dengan file dalam folder `google-apps-script`.
3. Jalankan fungsi `setup()` dari editor, lalu setujui akses Google Sheets dan Drive. Tab `Menus` dan `Schedules` disiapkan di spreadsheet RANNU App.
4. Pilih **Deploy → New deployment → Web app**. Pilih **Execute as: Me**. PWA static perlu endpoint Web App yang dapat dicapai lintas domain. Jika akses disetel ke siapa pun yang memiliki URL, siapa pun yang mendapatkan URL endpoint bisa membaca dan mengganti data. Jangan publikasikan URL `/exec`; gunakan hanya untuk aplikasi keluarga dan pertimbangkan dampaknya sebelum membuka akses tersebut.
5. Salin URL Web App `/exec` ke **Pengaturan → URL Apps Script Web App** di Dapur Minggu.
6. Pilih **Ambil data dari Sheets** jika tab `Menus` sudah memiliki data, atau **Kirim data lokal ke Sheets** untuk mengisi tab `Menus` dan `Schedules` dari perangkat ini. Setelah pilihan awal, perubahan dikirim otomatis.

Folder Drive yang dipakai adalah folder yang diberikan pemilik aplikasi. Apps Script berjalan sebagai pemilik deployment, jadi akun tersebut harus bisa mengakses folder. Gambar yang diunggah dari form diperkecil ke WebP sebelum disimpan. Data tetap tersedia di perangkat jika koneksi cloud sedang tidak aktif; gunakan **Unduh cadangan** secara berkala.

## Catatan pola menu

Random picker menyusun empat kelompok pangan inti setiap hari: karbohidrat, lauk/protein, sayur, dan buah. Susu atau alternatif nabati disertakan bila tersedia di koleksi, sebagai pilihan pelengkap yang dapat disesuaikan dengan kebutuhan keluarga. Ini alat perencanaan menu rumahan, bukan penilaian kebutuhan gizi individual.

Untuk mempertahankan app tetap ringan, antarmuka memakai font sistem tanpa mengunduh font eksternal. Foto disimpan lokal sebagai WebP dengan sisi terpanjang maksimal 900 px. Sinkronisasi Sheets mengirim data secara latar; browser tidak dapat membaca konfirmasi server dari endpoint Apps Script, jadi periksa spreadsheet setelah pengiriman awal.

Workflow GitHub Pages sudah disertakan di `.github/workflows/pages.yml`. Setelah file di-push ke branch `main`, buka **Settings → Pages** pada repo dan pilih **GitHub Actions** sebagai source. Workflow hanya menerbitkan aset frontend statis; kode Apps Script tidak ikut dipublikasikan di halaman web.
