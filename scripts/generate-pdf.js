// scripts/generate-pdf.js
// Run with: node scripts/generate-pdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'docs', 'bab6_2_bukti_pengembangan.pdf');
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const doc = new PDFDocument({ margin: 55, size: 'A4', bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

// ── Palette ──────────────────────────────────────────────────────────────
const C = {
  navy:       '#1A3448',
  accent:     '#A8C8D8',
  accentDark: '#5B8FA8',
  light:      '#EDF4F8',
  muted:      '#6B7280',
  border:     '#E5E7EB',
  white:      '#FFFFFF',
  red:        '#EF5350',
  green:      '#4CAF50',
  amber:      '#F59E0B',
  placeholder:'#F3F4F6',
  phBorder:   '#D1D5DB',
  phText:     '#9CA3AF',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function pageW() { return doc.page.width - doc.page.margins.left - doc.page.margins.right; }
function x0()    { return doc.page.margins.left; }
function safeY(need = 40) {
  if (doc.y + need > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function hRule(color = C.border) {
  doc.moveTo(x0(), doc.y).lineTo(x0() + pageW(), doc.y).strokeColor(color).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function heading1(text) {
  safeY(80);
  doc.rect(x0(), doc.y, pageW(), 36).fill(C.navy);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(15)
     .text(text, x0() + 14, doc.y - 28, { width: pageW() - 28 });
  doc.fillColor(C.navy);
  doc.moveDown(1.2);
}

function heading2(text) {
  safeY(60);
  doc.rect(x0(), doc.y, pageW(), 26).fill(C.light);
  doc.fillColor(C.navy).font('Helvetica-Bold').fontSize(12)
     .text(text, x0() + 10, doc.y - 19, { width: pageW() - 20 });
  doc.fillColor(C.navy);
  doc.moveDown(0.9);
}

function heading3(text) {
  safeY(40);
  doc.fillColor(C.accentDark).font('Helvetica-Bold').fontSize(10.5).text(text, x0());
  doc.fillColor(C.navy).moveDown(0.4);
}

function bodyText(text, indent = 0) {
  doc.fillColor('#374151').font('Helvetica').fontSize(9.5)
     .text(text, x0() + indent, doc.y, { width: pageW() - indent, lineGap: 2 });
  doc.moveDown(0.35);
}

function bullet(label, value, indent = 10) {
  const bulletY = doc.y;
  doc.fillColor(C.accentDark).font('Helvetica-Bold').fontSize(9).text('•', x0() + indent, bulletY);
  doc.fillColor(C.navy).font('Helvetica-Bold').fontSize(9)
     .text(`${label}: `, x0() + indent + 12, bulletY, { continued: true, width: pageW() - indent - 12 });
  doc.fillColor('#374151').font('Helvetica').fontSize(9).text(value, { width: pageW() - indent - 12, lineGap: 1.5 });
  doc.moveDown(0.25);
}

function screenshotBox(label) {
  safeY(72);
  const bx = x0(), by = doc.y, bw = pageW(), bh = 64;
  doc.rect(bx, by, bw, bh)
     .fillAndStroke(C.placeholder, C.phBorder);
  // camera icon area
  const cx = bx + bw / 2, cy = by + bh / 2 - 8;
  doc.fillColor(C.phText).circle(cx, cy, 10).fill();
  doc.fillColor(C.placeholder).circle(cx, cy, 7).fill();
  doc.fillColor(C.phText).font('Helvetica').fontSize(8)
     .text(label, bx + 6, by + bh - 18, { width: bw - 12, align: 'center' });
  doc.y = by + bh + 8;
  doc.moveDown(0.3);
}

function step(num, text) {
  safeY(28);
  const sy = doc.y;
  doc.rect(x0(), sy, 22, 18).fill(C.accentDark);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8.5).text(`${num}`, x0() + 7, sy + 5);
  doc.fillColor('#374151').font('Helvetica').fontSize(9)
     .text(text, x0() + 28, sy + 4, { width: pageW() - 28, lineGap: 1.5 });
  doc.y = Math.max(doc.y, sy + 24);
  doc.moveDown(0.2);
}

// ── Table renderer ────────────────────────────────────────────────────────
function table(headers, rows, colWidths) {
  const total = pageW();
  const norm  = colWidths.map(w => (w / colWidths.reduce((a,b)=>a+b,0)) * total);
  const rowH  = 18, headH = 22;
  const fontSize = 8;
  const lineGap  = 1;

  // estimate height for each row
  function rowHeight(cells) {
    let max = rowH;
    cells.forEach((cell, ci) => {
      const lines = doc.font('Helvetica').fontSize(fontSize)
                       .heightOfString(String(cell), { width: norm[ci] - 10, lineGap }) / 13;
      max = Math.max(max, Math.ceil(lines) * 13 + 6);
    });
    return max;
  }

  // header
  safeY(headH + 20);
  let hx = x0(), hy = doc.y;
  headers.forEach((h, i) => {
    doc.rect(hx, hy, norm[i], headH).fill(C.navy);
    doc.fillColor(C.white).font('Helvetica-Bold').fontSize(fontSize)
       .text(h, hx + 5, hy + 6, { width: norm[i] - 10, lineGap });
    hx += norm[i];
  });
  doc.y = hy + headH;

  rows.forEach((row, ri) => {
    const rh = rowHeight(row);
    safeY(rh + 4);
    let rx = x0(), ry = doc.y;
    const bg = ri % 2 === 0 ? C.white : C.light;
    row.forEach((cell, ci) => {
      doc.rect(rx, ry, norm[ci], rh).fillAndStroke(bg, C.border);
      const s = String(cell);
      const color = s.startsWith('✅') ? '#15803D'
                  : s.startsWith('⚠️') ? '#92400E'
                  : s === 'Wajib'      ? C.navy
                  : s === 'Direkomendasikan' ? C.muted
                  : '#374151';
      doc.fillColor(color).font('Helvetica').fontSize(fontSize)
         .text(s, rx + 5, ry + 5, { width: norm[ci] - 10, lineGap });
      rx += norm[ci];
    });
    doc.y = ry + rh;
  });
  doc.moveDown(0.8);
}

function badge(text, color) {
  const tw = doc.font('Helvetica-Bold').fontSize(8).widthOfString(text) + 10;
  doc.rect(x0(), doc.y, tw, 16).fill(color);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8).text(text, x0() + 5, doc.y - 12);
  doc.moveDown(0.6);
}

function journeyArrow(items) {
  safeY(40);
  const w = pageW() / items.length;
  items.forEach((item, i) => {
    const bx = x0() + i * w, by = doc.y;
    doc.rect(bx + 2, by, w - 4, 30).fill(i === items.length - 1 ? C.navy : C.light);
    doc.fillColor(i === items.length - 1 ? C.white : C.navy)
       .font('Helvetica-Bold').fontSize(7.5)
       .text(item, bx + 6, by + 9, { width: w - 12, align: 'center' });
    if (i < items.length - 1) {
      const ax = bx + w - 4, ay = by + 15;
      doc.fillColor(C.accentDark)
         .moveTo(ax, ay - 5).lineTo(ax + 6, ay).lineTo(ax, ay + 5).fill();
    }
  });
  doc.y += 38;
}

// ═══════════════════════════════════════════════════════════════════════════
//  COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.navy);
doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(C.accent);

// decorative rings
for (let r of [200, 160, 120, 80]) {
  doc.circle(doc.page.width / 2, 180, r)
     .strokeColor('#FFFFFF').lineWidth(0.4).opacity(0.07).stroke();
}
doc.opacity(1);

doc.fillColor(C.white).font('Helvetica-Bold').fontSize(32)
   .text('MinDora', 0, 140, { align: 'center', width: doc.page.width });

doc.fillColor(C.accent).font('Helvetica').fontSize(12)
   .text('Platform Pendamping Kesehatan Mental Berbasis AI', 0, 182, { align: 'center', width: doc.page.width });

// divider
doc.rect(doc.page.width / 2 - 60, 210, 120, 2).fill(C.accent);

doc.fillColor(C.white).font('Helvetica-Bold').fontSize(18)
   .text('BAB 6.2', 0, 228, { align: 'center', width: doc.page.width });
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(14)
   .text('Bukti Pengembangan dan Pengujian', 0, 252, { align: 'center', width: doc.page.width });

// info box
doc.rect(80, 310, doc.page.width - 160, 130).fill('rgba(255,255,255,0.08)');
const infoLines = [
  ['Tech Stack',   'Next.js 16.2.6 · React 19 · TypeScript · Tailwind CSS v4'],
  ['Backend',      'Supabase (Auth + PostgreSQL) · Next.js API Routes'],
  ['AI Engine',    'Google Gemini AI (gemini-2.5-flash) + model fallback'],
  ['Payment',      'MidTrans Snap — Sandbox mode'],
  ['Deployment',   'Vercel · mindora-app-nine.vercel.app'],
];
let iy = 322;
infoLines.forEach(([k, v]) => {
  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(9).text(`${k}:`, 100, iy);
  doc.fillColor(C.white).font('Helvetica').fontSize(9).text(v, 210, iy, { width: doc.page.width - 270 });
  iy += 21;
});

doc.fillColor(C.muted).font('Helvetica').fontSize(8.5)
   .text(`Disusun berdasarkan implementasi aktual aplikasi · ${new Date().toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}`,
         0, doc.page.height - 40, { align: 'center', width: doc.page.width });

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 1 — HALAMAN / SCREEN
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('1. DAFTAR HALAMAN / SCREEN APLIKASI');
bodyText('Aplikasi MinDora terdiri dari 25 halaman (route) yang dapat dikelompokkan menjadi: Autentikasi, Onboarding, Dashboard, Fitur Utama, Manajemen Profesional, Profil & Pengaturan, dan halaman Premium.');
doc.moveDown(0.5);

// ── 1.1 Splash ──
heading2('1.1  Splash Screen  (/)');
bullet('Tujuan', 'Entry point aplikasi; menentukan routing awal berdasarkan status sesi pengguna.');
bullet('Fungsi Utama', 'Memeriksa session Supabase — jika sudah login → /dashboard; jika belum onboarding → /onboarding; jika sudah onboarding → /auth/login. Timeout otomatis 2,5 detik.');
bullet('Input Pengguna', 'Tidak ada — proses sepenuhnya otomatis.');
bullet('Output', 'Logo MinDora, tagline, animasi loading dots (3 titik berpulsa), redirect otomatis.');
screenshotBox('Screenshot 1 — Splash Screen: Logo MinDora di tengah, background navy, 3 loading dots di bawah');

// ── 1.2 Onboarding ──
heading2('1.2  Onboarding  (/onboarding)');
bullet('Tujuan', 'Memperkenalkan konsep dan nilai MinDora kepada pengguna baru — hanya tampil sekali.');
bullet('Fungsi Utama', 'Menampilkan 3 slide edukatif secara berurutan. Setelah slide terakhir, menyimpan flag mindora_onboarded = \'1\' ke localStorage lalu redirect ke /auth/register.');
bullet('Input Pengguna', 'Tap tombol "Lanjut" (slide 1–2), "Mulai" (slide 3), atau "Sudah punya akun?" (loncat ke login).');
bullet('Output', 'Slide 1 (🧘 Pendampingan mental) · Slide 2 (💭 Curhat tanpa penghakiman) · Slide 3 (🌱 Tracking & profesional); progress dots (3 titik aktif).');
screenshotBox('Screenshot 2 — Onboarding Slide 1: Emoji 🧘, headline "Pikiran penuh? MinDora siap dengerin", progress dot posisi 1');
screenshotBox('Screenshot 3 — Onboarding Slide 3: Emoji 🌱, headline "Tumbuh bersama, satu hari satu langkah", tombol "Mulai"');

// ── 1.3 Register ──
heading2('1.3  Register  (/auth/register)');
bullet('Tujuan', 'Pembuatan akun baru untuk pengguna yang belum terdaftar.');
bullet('Fungsi Utama', 'Registrasi via email+password (Supabase signUp) atau Google OAuth (PKCE flow). Live validation: 4 password requirements dicek real-time (min 8 karakter, huruf besar, huruf kecil, angka).');
bullet('Input Pengguna', 'Nama lengkap · Email · Password (dengan live checklist) · Tombol "Daftar" · Tombol "Lanjut dengan Google".');
bullet('Output', 'Checklist requirement ✅/⬜ muncul saat fokus/mengetik password; redirect ke /dashboard jika berhasil; konfirmasi email jika email verification aktif.');
screenshotBox('Screenshot 4 — Register Page: Form nama/email/password, live password checklist (beberapa ✅ beberapa ⬜)');

// ── 1.4 Login ──
heading2('1.4  Login  (/auth/login)');
bullet('Tujuan', 'Autentikasi pengguna eksisting ke dalam aplikasi.');
bullet('Fungsi Utama', 'Login via email+password (supabase.auth.signInWithPassword) atau Google OAuth. Error handling inline jika kredensial salah.');
bullet('Input Pengguna', 'Email · Password · Tombol "Masuk" · Tombol "Lanjut dengan Google".');
bullet('Output', 'Pesan error merah inline jika gagal; redirect ke /dashboard jika berhasil.');
screenshotBox('Screenshot 5 — Login Page: Form email & password, tombol Google OAuth, link "Belum punya akun?"');
screenshotBox('Screenshot 6 — Login Error State: Pesan merah "Email atau password salah. Coba lagi ya."');

// ── 1.5 Dashboard ──
heading2('1.5  Dashboard / Beranda  (/dashboard)');
bullet('Tujuan', 'Home screen utama — ringkasan status pengguna dan akses cepat ke fitur inti.');
bullet('Fungsi Utama', 'Fetch profiles (full_name, streak, is_premium) dari Supabase. Tampilkan greeting personal, 5 quick mood buttons, shortcut Sesi Cerita, streak card, tip harian (rotasi 4 tip berbeda per hari minggu), dan kartu Mood Forecast (premium/terkunci).');
bullet('Input Pengguna', 'Tap quick mood → redirect ke /checkin · Tap "Mulai Sesi Cerita" → /chat · Tap Mood Forecast → /forecast (premium) atau /premium (free).');
bullet('Output', 'Nama pengguna dari DB · Tanggal hari ini (format Indonesia) · Streak hari · Tip harian · Badge premium/free.');
screenshotBox('Screenshot 7 — Dashboard (Free): Greeting "Hei, [Nama] 👋", 5 quick mood, card "Mulai Sesi Cerita", Mood Forecast terkunci 🔒');
screenshotBox('Screenshot 8 — Dashboard (Premium): Card Mood Forecast aktif tanpa gembok, badge premium');

// ── 1.6 Chat ──
heading2('1.6  Sesi Cerita — AI Chat  (/dashboard/chat)');
bullet('Tujuan', 'Fitur inti — percakapan emosional dengan MinDora (AI) secara real-time.');
bullet('Fungsi Utama', 'Chat dikirim ke Gemini AI via /api/chat. Konteks pengguna (nama, streak, mood terakhir, ai_notes dari sesi sebelumnya) diinjeksikan secara diam-diam di pesan pertama. MinDora memutuskan sendiri kapan menampilkan intensity picker melalui marker [INTENSITY_CHECK]. Zona terdeteksi (hijau/kuning/merah) setelah user pilih skor. Sesi disimpan ke localStorage dan Supabase saat berakhir.');
bullet('Input Pengguna', 'Teks bebas · Skor intensitas 1–5 (widget dimunculkan AI) · Tombol "Akhiri" di header · Toggle "Simpan sesi ini".');
bullet('Output', 'Bubble chat MinDora & user · Typing indicator (3 titik) · Intensity picker widget · Zone result overlay (hijau/kuning) · Smart routing ke psikolog jika zona kuning.');
screenshotBox('Screenshot 9 — Chat Greeting: Pesan pembuka MinDora "Lagi ada yang berat dipikirin?", input kosong, tombol "Akhiri" di header');
screenshotBox('Screenshot 10 — Chat Percakapan: 3–4 bubble user (kanan) dan MinDora (kiri), respons empatik MinDora terlihat');
screenshotBox('Screenshot 11 — Chat Typing Indicator: 3 titik animasi di bubble MinDora saat sedang mengetik');
screenshotBox('Screenshot 12 — Chat Intensity Picker: Widget angka 1–5 muncul dalam alur chat, belum ada yang dipilih');
screenshotBox('Screenshot 13 — Chat Pasca Intensitas: Balasan MinDora empatik sesuai skor, obrolan berlanjut');
screenshotBox('Screenshot 14 — Zone Result Hijau: Overlay "Makasih udah cerita hari ini", toggle simpan sesi, tombol "Selesai"');
screenshotBox('Screenshot 15 — Zone Result Kuning: Overlay "Kamu lagi bawa banyak hal nih", CTA "Ya, hubungkan aku"');

// ── 1.7 Check-in ──
heading2('1.7  Morning Check-in  (/dashboard/checkin)');
bullet('Tujuan', 'Pencatatan kondisi harian pengguna dalam 3 langkah terstruktur.');
bullet('Fungsi Utama', 'Mengumpulkan data kualitas tidur, mood emosional, dan kekhawatiran. Data disimpan ke tabel mood_entries via Supabase. Streak diperbarui melalui RPC increment_streak(user_id).');
bullet('Input Pengguna', 'Step 1: Pilih sleep quality (1–5, dengan emoji) · Step 2: Pilih mood dari 6 opsi (Senang, Biasa aja, Cemas, Sedih, Frustrasi, Overwhelmed) · Step 3: Ya/Tidak ada kekhawatiran + teks bebas opsional.');
bullet('Output', 'Progress bar 3 langkah · Summary card setelah selesai (tidur, mood, kekhawatiran) · CTA ke Sesi Cerita.');
screenshotBox('Screenshot 16 — Check-in Step 1: Progress bar 1/3, 5 pilihan kualitas tidur dengan emoji (😫😣😐😊😌)');
screenshotBox('Screenshot 17 — Check-in Step 2: Grid 6 emosi 3×2, salah satu dipilih dengan highlight border biru');
screenshotBox('Screenshot 18 — Check-in Step 3: Dua tombol Ya😬/Tidak😌, textarea terbuka karena "Ya" dipilih');
screenshotBox('Screenshot 19 — Check-in Selesai: Summary card (tidur 4/5, mood Cemas, kekhawatiran: Ada), CTA "Mulai Sesi Cerita"');

// ── 1.8 Jurnal ──
heading2('1.8  Jurnal  (/dashboard/journal)');
bullet('Tujuan', 'Visualisasi riwayat check-in dan sesi cerita dalam tampilan kalender bulanan.');
bullet('Fungsi Utama', 'Kalender grid 7 kolom × baris bulan. Setiap tanggal yang memiliki data check-in menampilkan emoji mood. Tap tanggal menampilkan detail card di bawah. Navigasi bulan (prev/next). Stats strip menampilkan jumlah check-in, sesi, dan streak.');
bullet('Input Pengguna', 'Tap tanggal di kalender · Tap panah ← → navigasi bulan.');
bullet('Output', 'Grid kalender dengan emoji mood (😊😐😟😔😤😵) per hari · Detail check-in (tidur, mood, kekhawatiran) · Detail sesi (zona, intensitas, preview) · Stats strip.');
screenshotBox('Screenshot 20 — Jurnal Kalender: Grid bulan, beberapa hari berisi emoji mood (😊😟😐), hari ini disorot');
screenshotBox('Screenshot 21 — Jurnal Detail Hari: Card check-in (tidur 4/5, mood Cemas) + card sesi (zona kuning, intensitas 3)');

// ── 1.9 Psikolog ──
heading2('1.9  Temukan Profesional  (/dashboard/psikolog)');
bullet('Tujuan', 'Direktori psikolog dan psikiater mitra MinDora dengan filter dan pencarian.');
bullet('Fungsi Utama', 'Filter by tipe (Semua / Psikolog / Psikiater / Tersedia) diproses di frontend. Pencarian by nama atau spesialisasi. Menampilkan 3 profesional (data saat ini statis/mock).');
bullet('Input Pengguna', 'Search bar teks · Tap filter chip · Tap kartu profesional → ke detail · Tap "Buat Janji".');
bullet('Output', 'Kartu profesional: avatar inisial berwarna · nama · tier badge (Senior/Middle/Junior) · spesialisasi · rating · ulasan · status tersedia/sibuk · harga per sesi.');
screenshotBox('Screenshot 22 — Daftar Profesional: Filter chips (Semua/Psikolog/Psikiater/Tersedia), 3 kartu profesional lengkap');

// ── 1.10 Profil Profesional ──
heading2('1.10  Profil Profesional  (/dashboard/psikolog/[id])');
bullet('Tujuan', 'Halaman detail profil seorang profesional dengan pemilihan jadwal dan tipe sesi.');
bullet('Fungsi Utama', 'Menampilkan profil lengkap: bio naratif, tag spesialisasi, stats (rating, total sesi, universitas asal), harga per sesi, pilihan tipe sesi (Chat/Voice Call/Video Call), dan grid slot jadwal tersedia.');
bullet('Input Pengguna', 'Pilih tipe sesi · Tap slot waktu (highlight saat dipilih) · Tap "Buat Janji Sekarang" (disabled jika tidak tersedia).');
bullet('Output', 'Profil lengkap · Slot interaktif · Redirect ke /dashboard/booking dengan parameter professional, slot, type.');
screenshotBox('Screenshot 23 — Profil Psikolog: Avatar, nama+gelar, tag spesialisasi, stats (rating/sesi/univ), tipe sesi, slot jadwal (salah satu terpilih)');

// ── 1.11 Booking ──
heading2('1.11  Konfirmasi & Pembayaran  (/dashboard/booking)');
bullet('Tujuan', 'Konfirmasi detail sesi dan proses pembayaran via MidTrans Snap payment gateway.');
bullet('Fungsi Utama', 'Tampilkan ringkasan sesi (psikolog, jadwal, tipe, durasi, biaya). POST ke /api/payment/create-token untuk mendapatkan Snap token. Buka window.snap.pay(). Callback onSuccess → INSERT ke tabel bookings. Webhook MidTrans update payment_status.');
bullet('Input Pengguna', 'Centang checkbox setuju syarat · Tap "Konfirmasi & Bayar" (disabled jika belum centang).');
bullet('Output', 'Detail sesi · Sandbox notice (otomatis jika kunci SB-) · MidTrans Snap popup · Success / pending state.');
screenshotBox('Screenshot 24 — Booking Page: Detail sesi, sandbox notice (mode testing + kartu uji), checkbox syarat, tombol bayar');
screenshotBox('Screenshot 25 — MidTrans Snap Popup: Modal terbuka, pilihan metode pembayaran (kartu kredit, transfer, dll)');
screenshotBox('Screenshot 26 — Booking Berhasil: Emoji 🎉, "Janji Dibuat!", nama psikolog dikonfirmasi');

// ── 1.12 Forecast ──
heading2('1.12  Mood Forecast  (/dashboard/forecast)  ⭐ Fitur Premium');
bullet('Tujuan', 'Prediksi mood mingguan berbasis riwayat check-in dan sesi cerita pengguna.');
bullet('Fungsi Utama', 'Premium gate: cek profiles.is_premium, redirect ke /premium jika false. Fetch 60 hari mood_entries dan chat_sessions dari Supabase. Merge keduanya (data check-in prioritas atas data sesi). Jalankan algoritma generateForecast() untuk menghasilkan prediksi 7 hari dengan analisis pola per hari dalam seminggu dan probabilitas akurasi.');
bullet('Input Pengguna', 'Navigasi minggu ← (ke masa lalu) dan → (maks +2 minggu) · Tap "Bagaimana akurasi dihitung?" (accordion).');
bullet('Output', '7-day forecast cards (emoji mood + % akurasi) · Warning hari berat · Prevention plan teks · Mitigasi per hari berat.');
screenshotBox('Screenshot 27 — Mood Forecast: 7-day cards dengan emoji dan % akurasi per hari, warning hari berat, prevention plan di bawah');

// ── 1.13 Red Zone ──
heading2('1.13  Zona Merah  (/dashboard/red-zone)');
bullet('Tujuan', 'Halaman respons krisis — diarahkan otomatis saat AI mendeteksi intensitas ≥ 5 atau kata kunci krisis dalam percakapan.');
bullet('Fungsi Utama', 'Menampilkan pesan empati dari MinDora dan opsi bantuan darurat. Link tel: langsung ke hotline Into The Light. Tombol ke psikiater mitra.');
bullet('Pemicu Otomatis', 'Kata kunci krisis: "bunuh diri", "mau mati", "tidak mau hidup", "menyakiti diri", "self harm", "suicide", dll. (9 kata) ATAU skor intensitas = 5.');
bullet('Output', 'Pesan empati · Tombol "Hubungi Psikiater Mitra Sekarang" · Link telepon 021-7884-5555 (Into The Light) · Tombol lanjut cerita ke MinDora · Tombol Tutup.');
screenshotBox('Screenshot 28 — Zona Merah: Pesan empati MinDora, tombol psikiater, nomor Into The Light 021-7884-5555 terlihat jelas');

// ── 1.14 Notif ──
heading2('1.14  Notifikasi  (/dashboard/notifications)');
bullet('Tujuan', 'Pusat notifikasi terkait aktivitas pengguna dalam aplikasi.');
bullet('Fungsi Utama', 'Fetch 50 notifikasi terbaru dari tabel notifications. Auto-mark-as-read semua notifikasi belum-dibaca saat halaman dibuka. Grouping: Hari Ini / Kemarin / Sebelumnya.');
bullet('Tipe Notifikasi', 'checkin_reminder 🌤️ · forecast_alert 🟡 · booking_confirmed ✅ · session_reminder 💬 · streak_achieved 🎉 · report_ready 💙');
bullet('Output', 'Grouped list · Ikon per tipe · Unread indicator (dot biru + border kiri) · Waktu relatif (menit/jam/hari lalu).');
screenshotBox('Screenshot 29 — Notifikasi: Daftar dengan grouping "Hari Ini / Kemarin", ikon per tipe, dot unread biru');

// ── 1.15 Profil ──
heading2('1.15  Profil Utama  (/dashboard/profile)');
bullet('Tujuan', 'Pusat manajemen akun pengguna dan navigasi ke semua sub-pengaturan.');
bullet('Fungsi Utama', 'Fetch profiles (full_name, is_premium, streak, session_count). Hitung level = ⌊session_count ÷ 5⌋ + 1. Tampilkan user card dengan stats. Menu 4 section: Akun · Premium · Riwayat · Lainnya. Tombol Logout (supabase.auth.signOut).');
bullet('Output', 'Avatar inisial · Nama · Badge Premium/Free · Stats (streak, sesi, level) · Menu navigasi lengkap.');
screenshotBox('Screenshot 30 — Profil: Avatar inisial, nama, badge Premium/Free, stats streak/sesi/level, 4 section menu');

// ── 1.16 Sub-halaman ──
heading2('1.16  Sub-halaman Profil  (8 Halaman)');
table(
  ['Halaman', 'Tujuan', 'Status'],
  [
    ['/profile/edit',         'Edit nama lengkap (email read-only)',              '✅ Diimplementasikan'],
    ['/profile/password',     'Ganti password (re-auth + update)',                '✅ Diimplementasikan'],
    ['/profile/language',     'Pilih bahasa ID/EN (EN coming soon)',              '✅ Diimplementasikan'],
    ['/profile/subscription', 'Status premium + daftar fitur',                   '✅ Diimplementasikan'],
    ['/profile/sessions',     'Riwayat sesi cerita dari chat_sessions',           '✅ Diimplementasikan'],
    ['/profile/about',        'Info aplikasi, misi, disclaimer',                  '✅ Diimplementasikan'],
    ['/profile/privacy',      'Kebijakan privasi (accordion sections)',            '✅ Diimplementasikan'],
    ['/profile/help',         'FAQ accordion + info kontak',                      '✅ Diimplementasikan'],
  ],
  [35, 45, 20]
);
screenshotBox('Screenshot 31 — Edit Profil: Form nama (terisi), field email disabled/abu-abu, tombol simpan');
screenshotBox('Screenshot 32 — Status Langganan: Tabel fitur free vs premium, status aktif/terkunci per fitur');

// ── 1.17 Premium ──
heading2('1.17  Upgrade Premium  (/premium)');
bullet('Tujuan', 'Halaman paywall untuk upgrade ke akun premium (Rp 29.000/bulan).');
bullet('Fungsi Utama', 'Load MidTrans Snap.js via Next.js Script. Tampilkan perbandingan 8 fitur (3 free, 5 premium). Proses pembayaran via Snap. onSuccess callback → POST ke backend → UPDATE profiles.is_premium = true.');
bullet('Output', '8 fitur dengan tanda ✅ (free) atau 🔒 (premium) · Sandbox notice otomatis jika kunci SB- · Snap popup · Success/Pending state.');
screenshotBox('Screenshot 33 — Premium Page: 8 fitur free vs premium, harga Rp 29.000/bulan, tombol "Upgrade ke Premium", sandbox notice');

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 2 — USER JOURNEY
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('2. USER JOURNEY LENGKAP');

heading2('2.1  Journey A — Pengguna Pertama Kali');
table(
  ['#', 'Tahap', 'Aktivitas Pengguna', 'Tujuan', 'Respons Sistem', 'Output'],
  [
    ['1','Splash Screen','Buka aplikasi','Mulai menggunakan','Cek localStorage + Supabase session','Splash 2,5 detik → /onboarding'],
    ['2','Onboarding','Baca 3 slide, tap "Mulai"','Mengenal aplikasi','Set mindora_onboarded di localStorage','Redirect /auth/register'],
    ['3','Register','Isi nama, email, password','Buat akun','signUp(); buat row profiles','Validasi live; redirect /dashboard'],
    ['4','Dashboard','Baca greeting, tap quick mood','Lihat kondisi hari ini','Fetch profiles dari DB','Greeting personal + streak'],
    ['5','Check-in','Pilih tidur, mood, kekhawatiran','Catat kondisi harian','INSERT mood_entries; RPC increment_streak','Summary + CTA Sesi Cerita'],
    ['6','Sesi Cerita','Ketik pesan ke MinDora','Curhat / didengar','POST /api/chat → Gemini AI','Balasan empatik MinDora'],
    ['7','Intensitas','Tap skor (1–5) saat AI bertanya','Ekspresikan berat beban','Zona terdeteksi; MinDora respons','Chat berlanjut sesuai zona'],
    ['8','Akhiri Sesi','Tap "Akhiri" di header','Selesai curhat','INSERT chat_sessions; UPDATE session_count; POST /api/insights','Zone result screen'],
    ['9','Smart Routing','Tap CTA sesuai zona','Langkah selanjutnya','Kuning → psikolog; hijau → dashboard','Halaman tujuan'],
  ],
  [5, 16, 22, 18, 24, 15]
);

heading2('2.2  Journey B — Booking Psikolog');
table(
  ['#', 'Tahap', 'Aktivitas Pengguna', 'Respons Sistem', 'Output'],
  [
    ['1','Daftar Psikolog','Filter/cari psikolog','Filter di frontend','Kartu profesional terfilter'],
    ['2','Profil Profesional','Tap kartu, pilih slot & tipe sesi','Tampilkan detail lengkap','Profil + slot jadwal interaktif'],
    ['3','Konfirmasi','Centang syarat, tap "Bayar"','Fetch Snap token dari MidTrans','Snap payment popup terbuka'],
    ['4','Pembayaran','Pilih metode, selesaikan','Snap proses; webhook diterima','Booking tersimpan; success screen'],
  ],
  [5, 20, 25, 28, 22]
);

heading2('2.3  Journey C — Upgrade Premium & Akses Forecast');
table(
  ['#', 'Tahap', 'Aktivitas Pengguna', 'Respons Sistem', 'Output'],
  [
    ['1','Dashboard','Tap Mood Forecast (terkunci)','Redirect ke /premium','Halaman paywall'],
    ['2','Premium Page','Tap "Upgrade ke Premium"','Fetch Snap token','Popup pembayaran MidTrans'],
    ['3','Bayar','Selesaikan pembayaran (kartu uji)','Webhook → is_premium = true','Success screen'],
    ['4','Forecast','Kembali, akses Mood Forecast','Fetch 60 hari data; generate forecast','7-day prediction cards'],
  ],
  [5, 20, 28, 28, 19]
);

// ── Journey Arrow Visuals ──
doc.moveDown(0.5);
heading3('Visualisasi Alur Utama');
bodyText('Journey A — Pengguna Pertama Kali:');
journeyArrow(['Splash','Onboarding','Register','Login','Dashboard','Check-in','AI Chat','Akhiri','Smart Routing']);
doc.moveDown(0.3);
bodyText('Journey B — Booking Psikolog:');
journeyArrow(['Dashboard','Daftar Psikolog','Profil Profesional','Konfirmasi','Snap Payment','Berhasil']);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 3 — WORKFLOW SISTEM
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('3. WORKFLOW SISTEM LENGKAP');

heading2('3.1  Workflow Sesi Cerita — Fitur Inti');
step(1,'Input Pengguna: User mengetik pesan di field chat dan menekan Enter atau tombol kirim.');
step(2,'Frontend (chat/page.tsx): Append pesan ke state messages[]. Ambil history sebagai ChatHistory[]. POST ke /api/chat dengan {message, history}.');
step(3,'Backend (app/api/chat/route.ts): Verifikasi session Supabase. Jika pesan pertama (first exchange): SELECT profiles (nama, streak, session_count, ai_notes) + SELECT mood_entries terbaru → inject sebagai silent exchange pertama dalam history.');
step(4,'AI Processing (lib/gemini.ts): Coba model gemini-2.5-flash → gemini-2.0-flash → gemini-2.0-flash-lite. Terapkan system instruction persona MinDora (listener-first, bahasa santai, jangan tutup sesi). Kirim ke Gemini API. Cek response.includes(\'[INTENSITY_CHECK]\'). Strip marker. Return {response, triggerIntensityPicker}.');
step(5,'Frontend menerima response: Tampilkan bubble MinDora. Jika triggerIntensityPicker = true dan intensity masih null → tampilkan widget 1–5 dalam chat.');
step(6,'Intensity & Zone Detection: User tap skor. detectZone(score, allMessages): cek 9 keyword krisis + skor. Jika red → clear localStorage → redirect /red-zone. Jika yellow/green → kirim "[Sistem: intensitas N/5]" ke AI → lanjut chat.');
step(7,'Akhiri Sesi: User tap "Akhiri". INSERT chat_sessions {messages, intensity_score, zone}. UPDATE profiles.session_count + 1. POST /api/insights (background): Gemini ekstrak insights → UPDATE profiles.ai_notes (JSONB).');
step(8,'Output: Zone result screen overlay. Navigate: kuning → /dashboard/psikolog; hijau → /dashboard.');

doc.moveDown(0.5);
heading2('3.2  Workflow Morning Check-in');
step(1,'User tap salah satu dari 5 quick mood di dashboard → redirect ke /dashboard/checkin.');
step(2,'Step 1: user pilih sleep quality 1–5. Step 2: pilih mood dari 6 opsi. Step 3: pilih ada/tidak kekhawatiran + textarea opsional.');
step(3,'Tap "Selesai" → Supabase getUser() → INSERT mood_entries {user_id, sleep_quality, emotion, has_concern, concern_text, date}.');
step(4,'RPC increment_streak(user_id) → UPDATE profiles.streak di Supabase DB.');
step(5,'Done screen: tampilkan summary card (tidur, mood, kekhawatiran) + CTA "Mulai Sesi Cerita" | "Nanti aja".');

doc.moveDown(0.5);
heading2('3.3  Workflow Cross-session Memory (AI Notes)');
step(1,'Setiap akhir sesi chat → fire-and-forget fetch POST /api/insights {messages: UIMessage[]}.');
step(2,'Backend /api/insights/route.ts: SELECT profiles.ai_notes (JSON existing) untuk user bersangkutan.');
step(3,'extractUserInsights(messages, existingNotes): filter pesan user saja → prompt Gemini untuk ekstrak: interests, stressors, situation, coping_strategies, personality_notes, personal_context → parse JSON response → merge dengan existingNotes.');
step(4,'UPDATE profiles.ai_notes = mergedNotes di Supabase.');
step(5,'Sesi berikutnya (first exchange): ai_notes diinject ke konteks sebagai "[Catatan tentang user dari sesi-sesi sebelumnya:]" → MinDora tahu hobi, stressor, dan situasi tanpa perlu menanyakan ulang.');

doc.moveDown(0.5);
heading2('3.4  Workflow Pembayaran (Booking / Upgrade Premium)');
step(1,'User tap "Konfirmasi & Bayar" (booking) atau "Upgrade ke Premium" (paywall).');
step(2,'Frontend POST /api/payment/create-token {professional_id, amount, user_name, user_email, item_name}.');
step(3,'Backend: autentikasi Supabase → buat request ke MidTrans Snap API (server key MIDTRANS_SERVER_KEY) → return {token: snap_token}.');
step(4,'Frontend: window.snap.pay(token, {onSuccess, onPending, onError, onClose}).');
step(5,'MidTrans menampilkan Snap popup → user memilih metode pembayaran dan menyelesaikan transaksi.');
step(6,'MidTrans POST notifikasi ke /api/payment/webhook (notification URL yang dikonfigurasi di dashboard MidTrans).');
step(7,'Backend /api/payment/webhook: verifikasi signature → UPDATE bookings.payment_status. Jika premium: UPDATE profiles.is_premium = true.');
step(8,'onSuccess callback di frontend → tampilkan success screen (state \'success\').');

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 4 — STATUS FITUR
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('4. STATUS IMPLEMENTASI SELURUH FITUR');

table(
  ['Fitur', 'Status', 'Cara Kerja', 'Dependensi', 'Keterbatasan'],
  [
    ['Autentikasi Email/Password','✅ Lengkap','supabase.auth.signInWithPassword / signUp','Supabase Auth','Email confirmation harus dikonfigurasi di Supabase dashboard'],
    ['Autentikasi Google OAuth','✅ Lengkap','signInWithOAuth({provider:\'google\'}) + PKCE callback di /auth/callback','Supabase OAuth, Google Cloud Console','Redirect URL harus terdaftar di kedua platform'],
    ['Password Requirements Live Check','✅ Lengkap','Regex real-time check saat user mengetik (4 kriteria)','React state + useEffect','—'],
    ['AI Chat (MinDora)','✅ Lengkap','Gemini API via server route; system instruction; model fallback 3 tier','Gemini API key, @google/generative-ai npm','Rate limit pada free tier; fallback otomatis antar model'],
    ['Konteks Sesi Pertama','✅ Lengkap','Inject nama, streak, mood terakhir, ai_notes sebagai silent exchange di first message','Supabase DB read','Hanya diinject di pesan pertama setiap sesi baru'],
    ['AI-Driven Intensity Picker','✅ Lengkap','MinDora embed [INTENSITY_CHECK] ketika timing tepat; API strip marker; frontend tampilkan widget','Gemini response parsing','AI mungkin tidak selalu trigger; tidak ada fallback paksa'],
    ['Zona Deteksi (Hijau/Kuning/Merah)','✅ Lengkap','detectZone(intensity, text): cek 9 keyword krisis + skor intensitas','lib/gemini.ts','Keyword list terbatas (9 kata)'],
    ['Smart Routing','✅ Lengkap','Kuning → /psikolog; merah → /red-zone (auto); hijau → /dashboard','React Router (Next.js)','—'],
    ['Persistensi Chat (localStorage)','✅ Lengkap','Auto-save setiap pesan perubahan; restore jika usia < 24 jam; clear saat akhiri','Browser localStorage','Tidak sinkron antar device; hilang jika clear cache'],
    ['Morning Check-in','✅ Lengkap','3-step form; INSERT mood_entries; RPC increment_streak','Supabase DB','Tidak ada validasi duplikat per hari'],
    ['Streak Check-in','✅ Lengkap','RPC increment_streak(user_id) dipanggil setiap check-in','Supabase RPC','Logika streak sepenuhnya di DB-side'],
    ['Jurnal Kalender','✅ Lengkap','Fetch mood_entries + chat_sessions; build calendar grid; emoji per hari','Supabase DB','Tidak ada fitur export atau share'],
    ['Cross-session Memory (ai_notes)','✅ Lengkap','Gemini ekstrak insight per sesi; merge & simpan ke profiles.ai_notes JSONB','Gemini API, Supabase JSONB','Kolom ai_notes perlu migrasi SQL manual: ALTER TABLE profiles ADD COLUMN ai_notes jsonb DEFAULT \'{}\''],
    ['Daftar Profesional','✅ UI Lengkap','Filter + search diproses sepenuhnya di frontend','Data masih hardcoded (3 profesional)','Belum terhubung ke tabel DB dinamis; data statis'],
    ['Booking & Pembayaran','✅ Lengkap','MidTrans Snap; server-side token creation; webhook handler; simpan ke DB','MidTrans API keys, midtrans-client npm, Supabase','Saat ini Sandbox; belum Production; belum ada manajemen jadwal nyata'],
    ['Mood Forecast','✅ Lengkap (Premium)','Fetch 60 hari data; algoritma pola mingguan; 7-day prediction','Supabase, lib/forecast.ts','Akurasi bergantung volume data historis; < 7 hari = prediksi kurang presisi'],
    ['Premium Gate','✅ Lengkap','Cek profiles.is_premium; redirect ke /premium jika false','Supabase DB','—'],
    ['Pembayaran Premium','✅ Lengkap','MidTrans Snap; onSuccess callback → UPDATE is_premium = true','MidTrans, Supabase','Sandbox only; belum ada manajemen renewal/langganan berulang'],
    ['Notifikasi','✅ Lengkap (UI)','Fetch notifications table; grouping; auto-mark-as-read','Supabase DB','Belum ada push notification aktif; pengisian notifikasi perlu trigger eksternal'],
    ['Profil (8 sub-halaman)','✅ Lengkap','Update DB melalui Supabase; preferensi bahasa di localStorage','Supabase Auth + DB','—'],
    ['Komunitas','⚠️ Placeholder','Halaman statis dengan teks "segera hadir"','—','Tidak ada fungsionalitas sama sekali'],
    ['Laporan Bulanan',   '⚠️ Belum Ada','Disebutkan di UI dashboard tapi route /dashboard/report belum dibuat','—','Link menuju halaman tidak ada (404)'],
    ['Lupa Password','⚠️ Placeholder','Tombol ada di login page tetapi tanpa handler/action','—','Fungsionalitas belum diimplementasikan'],
  ],
  [22, 14, 28, 18, 18]
);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 5 — DAFTAR SCREENSHOT
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('5. DAFTAR SCREENSHOT UNTUK LAPORAN AKADEMIK');

table(
  ['No', 'Nama Screen', 'Wajib?', 'Alasan Akademik', 'Keterangan yang Perlu Terlihat'],
  [
    ['1','Splash Screen','Wajib','Bukti entry point & branding','Logo MinDora, tagline, background navy, 3 loading dots'],
    ['2','Onboarding Slide 1','Wajib','Bukti onboarding & value proposition','Emoji 🧘, headline, progress dot posisi 1 dari 3'],
    ['3','Onboarding Slide 3','Wajib','Bukti penjelasan fitur kepada pengguna baru','Slide terakhir, tombol "Mulai", progress dot penuh'],
    ['4','Register + Password Checker','Wajib','Bukti validasi & keamanan akun','Live checklist: beberapa ✅ beberapa ⬜ (saat user mengetik)'],
    ['5','Login — Form','Wajib','Bukti sistem autentikasi','Form email+password, tombol Google OAuth, link daftar'],
    ['6','Login — Error State','Rekomen.','Bukti error handling autentikasi','Pesan merah "Email atau password salah. Coba lagi ya."'],
    ['7','Dashboard (Free User)','Wajib','Bukti home screen & personalisasi','Nama user, tanggal, 5 quick mood, Mood Forecast terkunci 🔒'],
    ['8','Dashboard (Premium)','Wajib','Bukti fitur premium unlocked','Card Mood Forecast aktif tanpa gembok, badge premium'],
    ['9','Check-in Step 1 (Tidur)','Wajib','Bukti Expression System — tidur','Progress bar 1/3, 5 pilihan dengan emoji tidur'],
    ['10','Check-in Step 2 (Mood)','Wajib','Bukti Expression System — emosi','Grid 6 emosi, salah satu dipilih (highlight biru)'],
    ['11','Check-in Step 3 (Khawatir)','Wajib','Bukti Expression System — kekhawatiran','Tombol Ya/Tidak, textarea terbuka karena "Ya" dipilih'],
    ['12','Check-in Selesai','Wajib','Bukti output check-in & smart routing','Summary card (tidur, mood, kekhawatiran) + CTA'],
    ['13','Chat — Greeting Awal','Wajib','Bukti AI Response pembuka','Bubble pertama MinDora, input kosong, tombol "Akhiri"'],
    ['14','Chat — Percakapan','Wajib','Bukti AI Conversation System','3–4 bubble; respons empatik MinDora harus terlihat panjang'],
    ['15','Chat — Typing Indicator','Rekomen.','Bukti UX real-time feedback','3 titik animasi di bubble MinDora saat mengetik'],
    ['16','Chat — Intensity Picker','Wajib','Bukti AI-driven intensity assessment','Widget 1–5 muncul dalam alur chat, belum ada dipilih'],
    ['17','Chat — Pasca Intensitas','Wajib','Bukti MinDora merespons skor empatik','Balasan MinDora pasca intensitas; chat berlanjut (bukan berakhir)'],
    ['18','Chat — Zone Hijau','Wajib','Bukti Mood Analysis & Smart Routing hijau','Overlay zona hijau, pesan "Makasih udah cerita", toggle simpan'],
    ['19','Chat — Zone Kuning','Wajib','Bukti Smart Routing ke psikolog','Overlay zona kuning, CTA "Ya, hubungkan aku" terlihat'],
    ['20','Zona Merah','Wajib','Bukti mekanisme krisis & hotline','Pesan empati, tombol psikiater, nomor 021-7884-5555 terlihat'],
    ['21','Jurnal — Kalender','Wajib','Bukti Mood Analysis historis','Grid kalender, beberapa hari berisi emoji mood (min 3 hari)'],
    ['22','Jurnal — Detail Hari','Wajib','Bukti detail mood analysis per hari','Card check-in (tidur+mood) + card sesi (zona+intensitas)'],
    ['23','Daftar Profesional','Wajib','Bukti Smart Routing ke profesional','Filter chips, 3 kartu profesional dengan info lengkap'],
    ['24','Profil Profesional','Wajib','Bukti detail profesional & booking','Bio, tags, stats, slot jadwal (satu terpilih/highlight)'],
    ['25','Konfirmasi Booking','Wajib','Bukti alur pembayaran','Detail sesi + sandbox notice + checkbox syarat'],
    ['26','MidTrans Snap Popup','Wajib','Bukti integrasi payment gateway','Popup Snap terbuka, metode pembayaran terlihat'],
    ['27','Booking Berhasil','Wajib','Bukti alur booking end-to-end','Success screen dengan nama psikolog dan 🎉'],
    ['28','Mood Forecast (Premium)','Wajib','Bukti fitur premium Mood Analysis','7-day cards dengan emoji + % akurasi, prevention plan'],
    ['29','Profil Utama','Wajib','Bukti user profile system','Avatar, nama, badge premium/free, stats, menu 4 section'],
    ['30','Notifikasi','Rekomen.','Bukti sistem notifikasi','Daftar notifikasi dengan grouping waktu dan ikon'],
    ['31','Status Langganan','Rekomen.','Bukti manajemen premium','Tabel fitur free vs premium, status aktif/terkunci'],
    ['32','Premium Paywall','Wajib','Bukti monetization gate','8 fitur, harga Rp 29.000, tombol upgrade, sandbox notice'],
  ],
  [6, 22, 13, 25, 34]
);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 6 — URUTAN SCREENSHOT
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('6. URUTAN SCREENSHOT PER ALUR USER JOURNEY');

heading2('6.1  Alur Authentication');
journeyArrow(['SS#4\nRegister+Checker', 'SS#5\nLogin Form', 'SS#6\nError State']);
bodyText('Catatan: Pada screenshot register (#4), pastikan live password checklist terlihat dengan beberapa kriteria terpenuhi (✅) dan beberapa belum (⬜). Ketik sebagian password agar checklist aktif sebelum mengambil screenshot.', 10);

doc.moveDown(0.5);
heading2('6.2  Alur Morning Check-in — Expression System');
journeyArrow(['SS#7\nDashboard\n(quick mood)', 'SS#9\nStep 1\n(Tidur)', 'SS#10\nStep 2\n(Mood)', 'SS#11\nStep 3\n(Khawatir)', 'SS#12\nSelesai']);
bodyText('Catatan: Ambil Step 2 (SS#10) setelah salah satu emosi diklik agar highlight border biru terlihat. Step 3 (SS#11): pastikan textarea muncul (pilih "Ya, ada" terlebih dahulu).', 10);

doc.moveDown(0.5);
heading2('6.3  Alur AI Chat + Intensitas + Smart Routing');
journeyArrow(['SS#13\nGreeting', 'SS#14\nPercakapan\n3–4 pesan', 'SS#15\nTyping\nIndicator', 'SS#16\nIntensity\nPicker', 'SS#17\nPasca\nIntensitas']);
doc.moveDown(0.2);
journeyArrow(['SS#18\nZone Hijau', 'ATAU', 'SS#19\nZone Kuning']);
bodyText('Catatan: Untuk SS#14 (percakapan), pastikan respons MinDora terlihat panjang dan empatik — bukan satu kalimat pendek. Ini penting untuk membuktikan kualitas AI Response. Untuk zone kuning (SS#19), pilih skor intensitas 3 atau 4.', 10);

doc.moveDown(0.5);
heading2('6.4  Alur Smart Routing ke Psikolog');
journeyArrow(['SS#19\nZone Kuning\n"Hubungkan"', 'SS#22\nDaftar\nPsikolog', 'SS#23\nProfil\nPsikolog', 'SS#24\nKonfirmasi\nBooking', 'SS#25\nSnap\nPopup', 'SS#26\nBerhasil']);
bodyText('Catatan: Untuk SS#23 (profil profesional), pastikan salah satu slot jadwal sudah diklik (highlight navy) sebelum screenshot agar tombol "Buat Janji Sekarang" aktif.', 10);

doc.moveDown(0.5);
heading2('6.5  Alur Mood Analysis (Jurnal & Forecast)');
journeyArrow(['SS#20\nJurnal\nKalender', 'SS#21\nDetail\nHari', 'SS#27\nMood\nForecast']);
bodyText('Catatan: Untuk Jurnal (SS#20), lakukan minimal 3 hari check-in terlebih dahulu agar kalender terlihat berisi data dan emoji mood. Untuk Forecast (SS#27), akun harus sudah premium dan memiliki riwayat check-in.', 10);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION 7 — REKOMENDASI DIAGRAM
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
heading1('7. REKOMENDASI DIAGRAM WORKFLOW');

heading2('7.1  Diagram 1 — Arsitektur Sistem');
bodyText('Tipe yang direkomendasikan: Layered Architecture Diagram (3 lapisan). Gambarkan dari atas ke bawah:');
const archLayers = [
  ['Layer 1 — Pengguna', 'Mobile Browser / PWA (Chrome, Safari Mobile)', C.accent],
  ['Layer 2 — Aplikasi', 'Next.js 16.2.6 App Router @ Vercel\n  Pages (Client Components) | API Routes (Server)\n  /api/chat  /api/insights  /api/payment/*  /api/bookings', C.navy],
  ['Layer 3A — AI', 'Google Gemini AI\ngemini-2.5-flash → gemini-2.0-flash → gemini-2.0-flash-lite', '#34A853'],
  ['Layer 3B — Payment', 'MidTrans Snap API\nSandbox: app.sandbox.midtrans.com', '#E87722'],
  ['Layer 3C — Database', 'Supabase PostgreSQL\ntables: profiles · mood_entries · chat_sessions · notifications · bookings', '#3ECF8E'],
];
archLayers.forEach(([label, detail, color]) => {
  safeY(50);
  const ay = doc.y, ah = 38;
  doc.rect(x0(), ay, pageW(), ah).fillAndStroke(color + '18', color);
  doc.fillColor(color).font('Helvetica-Bold').fontSize(9).text(label, x0() + 10, ay + 6);
  doc.fillColor('#374151').font('Helvetica').fontSize(8).text(detail, x0() + 10, ay + 19, { width: pageW() - 20, lineGap: 1 });
  doc.y = ay + ah + 4;
});
doc.moveDown(0.5);

heading2('7.2  Diagram 2 — AI Chat Flow (Sequence Diagram)');
bodyText('Tipe yang direkomendasikan: UML Sequence Diagram dengan 4 actor vertikal:');
const seqActors = ['User', 'Frontend\n(chat/page.tsx)', 'API Route\n(/api/chat)', 'Gemini AI'];
const seqSteps = [
  'User kirim pesan → Frontend POST /api/chat {message, history}',
  'API Route: verifikasi session Supabase Auth',
  'API Route: jika first exchange → SELECT profiles + mood_entries → inject konteks',
  'API Route → Gemini: system instruction + history + user message',
  'Gemini → API Route: teks respons [+ INTENSITY_CHECK jika tepat]',
  'API Route: strip marker → return {response, triggerIntensityPicker}',
  'Frontend: tampilkan bubble MinDora; jika triggerIntensityPicker = true → tampilkan widget 1–5',
];
seqSteps.forEach((s, i) => bullet(`Step ${i+1}`, s, 10));

doc.moveDown(0.5);
heading2('7.3  Diagram 3 — Smart Routing Decision Tree');
bodyText('Tipe yang direkomendasikan: Flowchart dengan diamond decision nodes.');
const dtNodes = [
  ['START', 'Pesan masuk dari user dalam sesi chat', C.navy],
  ['DECISION', 'Apakah mengandung keyword krisis?', C.amber],
  ['→ YA', 'ZONA MERAH → Redirect /red-zone → Tampilkan hotline Into The Light', C.red],
  ['→ TIDAK', 'Tampilkan Intensity Picker (dimunculkan AI via [INTENSITY_CHECK])', C.accentDark],
  ['DECISION', 'Skor ≥ 5?', C.amber],
  ['→ YA', 'ZONA MERAH → Redirect /red-zone', C.red],
  ['→ TIDAK', 'Skor ≥ 3?', C.amber],
  ['→ YA', 'ZONA KUNING → Tampilkan rekomendasi psikolog', '#D97706'],
  ['→ TIDAK', 'ZONA HIJAU → Tampilkan pesan positif → /dashboard', C.green],
];
dtNodes.forEach(([key, val, color]) => {
  safeY(22);
  const dy = doc.y;
  doc.rect(x0(), dy, 60, 16).fill(color + '22');
  doc.fillColor(color).font('Helvetica-Bold').fontSize(8).text(key, x0() + 4, dy + 4, {width: 52});
  doc.fillColor('#374151').font('Helvetica').fontSize(8.5).text(val, x0() + 68, dy + 4, {width: pageW() - 68, lineGap: 1});
  doc.y = Math.max(doc.y, dy + 20);
});

doc.moveDown(0.5);
heading2('7.4  Diagram 4 — Data Flow Check-in → Forecast');
bodyText('Tipe yang direkomendasikan: Data Flow Diagram (DFD) Level 1.');
const dfSteps = [
  ['INPUT A', 'Morning Check-in → mood_entries (date, emotion, sleep_quality, has_concern, concern_text)'],
  ['INPUT B', 'Chat Session → chat_sessions (zone, intensity_score, messages, created_at)'],
  ['MERGE', 'Forecast Page: fetch 60 hari kedua sumber. Prioritas: mood_entries > chat_sessions (tanggal sama)'],
  ['PROCESS', 'generateForecast(mergedData, weekOffset): analisis pola per hari dalam seminggu (0–6), hitung frekuensi emosi, kalkulasi probabilitas (base ± dayPenalty + dataBonus)'],
  ['OUTPUT', '7-day ForecastDay[] {day, date, emotion, probability, severity} + PreventionPlan {title, description, actions[]}'],
];
dfSteps.forEach(([key, val]) => bullet(key, val, 10));

doc.moveDown(0.5);
heading2('7.5  Diagram 5 — Payment Flow');
bodyText('Tipe yang direkomendasikan: Swimlane Diagram dengan 4 jalur (User / Frontend / Backend / MidTrans).');
const paySteps = [
  ['User', 'Tap "Konfirmasi & Bayar" atau "Upgrade ke Premium"'],
  ['Frontend', 'POST /api/payment/create-token {professional_id, amount, user info}'],
  ['Backend', 'Autentikasi → buat request ke MidTrans Snap API dengan MIDTRANS_SERVER_KEY → return {token}'],
  ['Frontend', 'window.snap.pay(token, {onSuccess, onPending, onError, onClose})'],
  ['MidTrans', 'Tampilkan Snap payment popup → user pilih metode dan selesaikan'],
  ['MidTrans → Backend', 'POST notifikasi ke /api/payment/webhook dengan signature'],
  ['Backend', 'Verifikasi signature → UPDATE bookings.payment_status; jika premium: UPDATE profiles.is_premium = true'],
  ['Frontend', 'onSuccess callback → tampilkan success screen (state \'success\')'],
];
paySteps.forEach(([actor, action]) => bullet(actor, action, 10));

// ═══════════════════════════════════════════════════════════════════════════
//  FOOTER — semua halaman
// ═══════════════════════════════════════════════════════════════════════════
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  if (i === 0) continue; // skip cover
  doc.switchToPage(i);
  const fy = doc.page.height - 35;
  doc.moveTo(x0(), fy).lineTo(x0() + pageW(), fy)
     .strokeColor(C.border).lineWidth(0.5).stroke();
  doc.fillColor(C.muted).font('Helvetica').fontSize(7.5)
     .text('MinDora — Bab 6.2 Bukti Pengembangan dan Pengujian', x0(), fy + 6, { width: pageW() - 40, align: 'left' });
  doc.fillColor(C.muted).font('Helvetica').fontSize(7.5)
     .text(`Hal. ${i}`, x0(), fy + 6, { width: pageW(), align: 'right' });
}

doc.end();
console.log('PDF generated:', OUT);
