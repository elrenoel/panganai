from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import os
from pathlib import Path

app = FastAPI(title="Pangan AI - Monitoring Harga Pangan Indonesia")

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data paths ──────────────────────────────────────────────────────
# Mendapatkan root directory project (satu level di atas folder backend)
ROOT_DIR = Path(__file__).resolve().parent
BASE_DIR = ROOT_DIR / "data"

# Tambahkan print untuk debugging di Vercel Logs
print(f"Mencari data di: {BASE_DIR}")
if not BASE_DIR.exists():
    print("WARNING: Folder pangan_pipeline tidak ditemukan!")

PREDICTIONS_CSV = BASE_DIR / "predictions" / "csv"
PREDICTIONS_JSON = BASE_DIR / "predictions" / "json"
DATASET_DIR = BASE_DIR / "dataset" / "clean_dataset"


# ── Load data once at startup ───────────────────────────────────────
def load_data():
    global df_hasil, df_harian, alerts, df_semua

    df_hasil = pd.read_csv(PREDICTIONS_CSV / "hasil_prediksi.csv")
    df_harian = pd.read_csv(PREDICTIONS_CSV / "prediksi_harian.csv")
    df_semua = pd.read_csv(DATASET_DIR / "semua_komoditas.csv")

    with open(PREDICTIONS_JSON / "alert_prediksi.json", "r", encoding="utf-8") as f:
        alerts = json.load(f)

    # Ensure date columns are proper datetime
    df_harian["tanggal"] = pd.to_datetime(df_harian["tanggal"])
    df_semua["tanggal"] = pd.to_datetime(df_semua["tanggal"])
    df_hasil["tanggal_data"] = pd.to_datetime(df_hasil["tanggal_data"])


load_data()


# ── Helpers ─────────────────────────────────────────────────────────
def safe_float(val):
    """Convert numpy/pandas numeric to Python float."""
    try:
        if pd.isna(val):
            return None
        return round(float(val), 2)
    except Exception:
        return None


# ── Endpoints ───────────────────────────────────────────────────────


@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "API Pangan AI siap melayani permintaan data harga pangan Indonesia.",
    }


@app.get("/api/komoditas")
def get_komoditas():
    """Return list of available commodities."""
    komoditas = sorted(df_semua["komoditas"].unique().tolist())
    return komoditas


@app.get("/api/provinsi")
def get_provinsi():
    """Return list of available provinces."""
    provinsi = sorted(df_semua["provinsi"].unique().tolist())
    return provinsi


@app.get("/api/harga-historis")
def get_harga_historis(
    komoditas: str = Query(..., description="Nama komoditas"),
    provinsi: str = Query(..., description="Nama provinsi"),
):
    """Return historical daily price data for charts."""
    mask = (df_semua["komoditas"] == komoditas) & (df_semua["provinsi"] == provinsi)
    subset = df_semua[mask].sort_values("tanggal")

    result = []
    for _, row in subset.iterrows():
        result.append(
            {
                "tanggal": row["tanggal"].strftime("%Y-%m-%d"),
                "harga": safe_float(row["harga"]),
                "harga_nasional": safe_float(row["harga_nasional"]),
                "status_pasokan": row.get("status_pasokan", "NORMAL"),
            }
        )
    return result


@app.get("/api/prediksi")
def get_prediksi(
    komoditas: str = Query(..., description="Nama komoditas"),
    provinsi: str = Query(..., description="Nama provinsi"),
):
    """Return prediction summary + daily forecast data."""
    # Ringkasan from hasil_prediksi.csv
    mask_r = (df_hasil["komoditas"] == komoditas) & (df_hasil["provinsi"] == provinsi)
    row_r = df_hasil[mask_r]

    ringkasan = {}
    if not row_r.empty:
        r = row_r.iloc[0]
        ringkasan = {
            "harga_sekarang": safe_float(r["harga_sekarang"]),
            "prediksi_7h": safe_float(r["prediksi_7h"]),
            "prediksi_30h": safe_float(r["prediksi_30h"]),
            "tren_7h": r["tren_7h"],
            "tren_30h": r["tren_30h"],
            "mape_pct": safe_float(r["mape_pct"]),
            "bawah_7h": safe_float(r["bawah_7h"]),
            "atas_7h": safe_float(r["atas_7h"]),
            "bawah_30h": safe_float(r["bawah_30h"]),
            "atas_30h": safe_float(r["atas_30h"]),
            "mae": safe_float(r["mae"]),
        }

    # Harian from prediksi_harian.csv
    mask_h = (df_harian["komoditas"] == komoditas) & (df_harian["provinsi"] == provinsi)
    subset_h = df_harian[mask_h].sort_values("tanggal")

    harian = []
    for _, row in subset_h.iterrows():
        harian.append(
            {
                "tanggal": row["tanggal"].strftime("%Y-%m-%d"),
                "prediksi": safe_float(row["prediksi"]),
                "batas_bawah": safe_float(row["batas_bawah"]),
                "batas_atas": safe_float(row["batas_atas"]),
            }
        )

    return {"ringkasan": ringkasan, "harian": harian}


@app.get("/api/prediksi-semua")
def get_prediksi_semua(
    komoditas: str = Query(..., description="Nama komoditas"),
):
    """Return prediction for all provinces for one commodity."""
    mask = df_hasil["komoditas"] == komoditas
    subset = df_hasil[mask].copy()

    result = []
    for _, r in subset.iterrows():
        harga = safe_float(r["harga_sekarang"])
        pred7 = safe_float(r["prediksi_7h"])
        pred30 = safe_float(r["prediksi_30h"])

        ubah_7_pct = round((pred7 - harga) / harga * 100, 1) if harga and pred7 else 0
        ubah_30_pct = (
            round((pred30 - harga) / harga * 100, 1) if harga and pred30 else 0
        )

        result.append(
            {
                "provinsi": r["provinsi"],
                "harga_sekarang": harga,
                "prediksi_7h": pred7,
                "prediksi_30h": pred30,
                "tren_7h": r["tren_7h"],
                "tren_30h": r["tren_30h"],
                "ubah_7_pct": ubah_7_pct,
                "ubah_30_pct": ubah_30_pct,
            }
        )
    return result


@app.get("/api/alert")
def get_alert():
    """Return all alerts sorted by kenaikan_pct descending."""
    sorted_alerts = sorted(alerts, key=lambda x: x.get("kenaikan_pct", 0), reverse=True)
    return sorted_alerts


@app.get("/api/statistik-nasional")
def get_statistik_nasional():
    """Return national average price per commodity on the latest date."""
    latest_date = df_semua["tanggal"].max()
    today_data = df_semua[df_semua["tanggal"] == latest_date]

    result = []
    for komoditas in today_data["komoditas"].unique():
        kom_data = today_data[today_data["komoditas"] == komoditas]
        harga_avg = safe_float(kom_data["harga"].mean())

        # Majority trend from hasil_prediksi for this commodity
        pred_kom = df_hasil[df_hasil["komoditas"] == komoditas]
        if not pred_kom.empty:
            tren_counts = pred_kom["tren_30h"].value_counts()
            tren_mayoritas = tren_counts.index[0] if len(tren_counts) > 0 else "STABIL"
        else:
            tren_mayoritas = "STABIL"

        result.append(
            {
                "komoditas": komoditas,
                "harga_rata_nasional": harga_avg,
                "tren_30h_mayoritas": tren_mayoritas,
            }
        )
    return result
