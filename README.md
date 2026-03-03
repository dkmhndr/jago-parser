# 🏦 Bank Jago PDF Statement Parser

Aplikasi web untuk mengkonversi PDF mutasi rekening Bank Jago menjadi format CSV atau Excel. **Self-hosted & privacy-focused** - tidak ada third-party service, cloud storage, atau analytics yang terlibat.

## ✨ Fitur

- **📄 Parse PDF Statement** - Upload file PDF mutasi Bank Jago dan otomatis diextract
- **📊 Preview Data** - Lihat preview 20 transaksi pertama langsung di browser
- **💾 Export Fleksibel** - Download hasil dalam format CSV atau Excel
- **📅 Sheet per Tahun** - File Excel otomatis dipecah per tahun untuk memudahkan analisis
- **🔒 Privacy First** - Self-hosted di server kamu sendiri, zero third-party services
- **🎨 UI Modern** - Interface clean dengan preview data yang mudah dibaca
- **💰 Format Indonesia** - Support parsing angka Indonesia (1.234.567,89)

## 🏗️ Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **pdf-parse** - PDF text extraction
- **xlsx** - Excel file generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ dan npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/dkmhndr/jago-parser.git
cd jago-parser

# Install dependencies
npm install

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
npm run build
npm start
```

## 📖 Cara Pakai

1. **Upload PDF** - Klik tombol "Pilih file PDF" dan pilih file statement Bank Jago kamu
2. **Preview Data** - Aplikasi akan otomatis parse dan tampilkan preview 20 transaksi pertama
3. **Download** - Pilih format yang kamu mau:
   - **CSV** - Format universal, bisa dibuka di Excel/Google Sheets
   - **Excel** - File .xlsx dengan sheet terpisah per tahun

## 📊 Format Output

Data diparse menjadi 6 kolom sesuai format PDF asli:

| Kolom                 | Deskripsi                                             |
| --------------------- | ----------------------------------------------------- |
| **Tanggal & Waktu**   | Timestamp transaksi lengkap                           |
| **Sumber/Tujuan**     | Nama rekening/merchant asal/tujuan                    |
| **Rincian Transaksi** | Jenis transaksi (Transfer Masuk, Top Up, dll)         |
| **Catatan**           | Catatan/keterangan tambahan                           |
| **Jumlah**            | Nominal transaksi (negatif = debit, positif = kredit) |
| **Saldo**             | Saldo akhir setelah transaksi                         |

## 🗂️ Struktur Project

```
jago-parser/
├── app/
│   ├── api/parse/
│   │   └── route.ts          # API endpoint untuk parse PDF
│   ├── layout.tsx             # Root layout dengan metadata
│   ├── page.tsx               # Main UI component
│   ├── globals.css            # Global styles
│   └── icon.svg               # App icon/favicon
├── lib/
│   └── statement-parser.ts    # Core parsing logic
├── public/
│   └── bank-jago-logo.svg     # Bank Jago logo
└── package.json
```

### Key Files

- **`lib/statement-parser.ts`** - Logic untuk extract dan parse transaksi dari PDF text
  - Regex pattern untuk deteksi format Bank Jago
  - Indonesian number normalization
  - Transaction block segmentation
  - CSV generation

- **`app/api/parse/route.ts`** - Server-side PDF processing
  - PDF text extraction menggunakan pdf-parse
  - Excel generation dengan sheet per tahun
  - Error handling

- **`app/page.tsx`** - Client-side UI
  - File upload dengan custom picker
  - Data preview table
  - Download handlers
  - Privacy modal

## 🔒 Privacy & Security

**Arsitektur:** File PDF dikirim ke Next.js server (yang kamu host sendiri) untuk diproses, lalu hasilnya dikembalikan ke browser untuk download.

- ✅ **Self-Hosted** - Kamu kontrol penuh atas server dan data
- ✅ **No Third-Party** - Tidak ada data yang dikirim ke layanan eksternal (AI, cloud, analytics)
- ✅ **No Storage** - File tidak disimpan di database atau disk setelah diproses
- ✅ **No Logging** - Tidak ada tracking, monitoring, atau pencatatan data transaksi
- ✅ **Direct Download** - Hasil langsung download dari memori server ke perangkat kamu

⚠️ **Catatan:** Ini bukan client-side only app. File tetap melalui Next.js server untuk parsing PDF (karena limitasi `pdf-parse` library). Jika kamu deploy ke hosting provider (Vercel, Netlify, dll), mereka secara teknis bisa memiliki akses ke file yang diproses selama request berlangsung.

## 🛠️ Known Limitations

- Parser dirancang spesifik untuk format PDF Bank Jago saat ini
- Jika Bank Jago mengubah format PDF mereka, parser perlu disesuaikan
- Hanya support file PDF (tidak support format lain seperti CSV/Excel dari bank)

## 🤝 Contributing

Contributions welcome! Jika kamu menemukan bug atau punya ide untuk improvement:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## ⚠️ Disclaimer

Ini adalah aplikasi **tidak resmi** dan tidak berafiliasi dengan Bank Jago. Gunakan dengan risiko kamu sendiri. Selalu periksa hasil export dengan data asli di PDF statement kamu.

---

**Made with ❤️ for easier financial data management**
