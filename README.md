# PanganAI — Monitoring & Prediksi Harga Pangan Indonesia

Sistem monitoring dan prediksi harga pangan Indonesia berbasis AI, menggunakan data real dari PIHPS Bank Indonesia.

## Komoditas yang Dipantau
- 🍚 Beras Medium I
- 🫗 Minyak Goreng Curah
- 🌶️ Cabai Merah Keriting

## Tech Stack
- **Frontend**: React 18 + Vite + Recharts + Tailwind CSS
- **Backend**: FastAPI (Python) + Pandas + Uvicorn
- **Data**: CSV dan JSON lokal (tidak ada database)

## Cara Menjalankan

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (terminal baru)
```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:5173
```

## Struktur Folder
```
pangan_predictions_web_app/
├── backend/
│   ├── main.py              ← FastAPI server
│   └── requirements.txt     ← Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Root with sidebar + routing
│   │   ├── api/index.js     ← API fetch functions + helpers
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Prediksi.jsx
│   │   │   └── Alert.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── MetricCard.jsx
│   │       ├── GrafikHistoris.jsx
│   │       ├── GrafikPrediksi.jsx
│   │       ├── AlertCard.jsx
│   │       └── TabelProvinsi.jsx
│   ├── vite.config.js       ← Proxy /api → localhost:8000
│   └── index.html
└── pangan_pipeline/
    └── data/                ← Source data (CSV + JSON)
```

## API Endpoints
| Endpoint | Deskripsi |
|---|---|
| `GET /api/komoditas` | List komoditas tersedia |
| `GET /api/provinsi` | List provinsi tersedia |
| `GET /api/harga-historis?komoditas=...&provinsi=...` | Data harga historis |
| `GET /api/prediksi?komoditas=...&provinsi=...` | Ringkasan prediksi + harian |
| `GET /api/prediksi-semua?komoditas=...` | Prediksi semua provinsi |
| `GET /api/alert` | Alert kenaikan harga |
| `GET /api/statistik-nasional` | Rata-rata harga nasional |
