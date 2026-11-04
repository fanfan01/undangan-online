UNDANGAN DIGITAL MODERN — PETUNJUK

1. Upload isi folder ini ke repository GitHub bernama undangan-online.
2. Pastikan GitHub Pages aktif dari branch main dan folder root.
3. Buka data/undangan.json untuk mengubah nama, foto, tanggal, lokasi, rekening, cerita, galeri, dan nomor WhatsApp.
4. Buka data/tamu.json untuk daftar kode dan nama tamu.
5. Letakkan foto milik sendiri di assets/images/ dengan nama:
   couple.jpg, brian.jpg, nisa.jpg, 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg, 6.jpg.
6. Ubah alamat foto di undangan.json bila nama file berbeda.
7. Ganti BASE_PATH di js/script.js dan semua path CSS/JS HTML jika nama repository bukan "undangan-online".

LINK TAMU:
https://USERNAME.github.io/undangan-online/to/IRFAN01

CATATAN ROUTING:
GitHub Pages tidak menyediakan routing dinamis. Untuk URL /to/KODE, file 404.html disediakan sebagai fallback.
Jika ingin URL rapi yang lebih andal, gunakan ?to=IRFAN01:
https://USERNAME.github.io/undangan-online/?to=IRFAN01

PENTING:
- Ganti nomor WhatsApp contoh 6281234567890 dengan nomor WA aktif format internasional tanpa tanda +.
- Ganti rekening contoh sebelum undangan dipublikasikan.
- Tanggal ISO memakai zona waktu WIB, contoh 2026-12-20T08:00:00+07:00.
- JPG/PNG/WEBP/SVG didukung langsung oleh browser. Tidak perlu mengubahnya menjadi .jpg.svg.
- Foto contoh pada halaman cover memakai gambar dari Unsplash; ganti dengan foto pasangan sendiri untuk hasil final.
