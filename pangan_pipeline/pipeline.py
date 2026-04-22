import pandas as pd
import numpy as np
from pathlib import Path
import json

# ── Konfigurasi Path ──────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent
RAW_DIR    = BASE_DIR / "pangan_pipeline" / "data" / "dataset"
CLEAN_DIR  = BASE_DIR / "pangan_pipeline" / "data" / "dataset" /"clean_dataset"
CLEAN_DIR.mkdir(parents=True, exist_ok=True)

# ── Mapping nama file → nama komoditas ───────────────────────────
FILE_KOMODITAS = {
    "beras_medium_I.xlsx"       : "Beras Medium I",
    "minyak_goreng_curah.xlsx"  : "Minyak Goreng Curah",
    "cabai_merah_keriting.xlsx" : "Cabai Merah Keriting",
}

# Angka romawi untuk identifikasi baris provinsi
ROMAWI = [
    'I','II','III','IV','V','VI','VII','VIII','IX','X',
    'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
    'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII',
    'XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV'
]


# ═══════════════════════════════════════════════════════════════════
# STEP 1 — Baca & Validasi File Mentah
# ═══════════════════════════════════════════════════════════════════

def baca_xlsx(path: Path) -> pd.DataFrame:
    """Baca file xlsx PIHPS, kembalikan DataFrame mentah."""
    df = pd.read_excel(path, header=None)
    print(f"  [OK] {path.name} → shape {df.shape}")
    return df


# ═══════════════════════════════════════════════════════════════════
# STEP 2 — Parsing Struktur Hierarkis → Format Tidy
# ═══════════════════════════════════════════════════════════════════

def parse_pihps(df: pd.DataFrame, nama_komoditas: str) -> pd.DataFrame:
    """
    Ubah format wide PIHPS (provinsi × tanggal) menjadi format tidy:
    | tanggal | provinsi | komoditas | harga |

    Format mentah PIHPS:
    - Baris 0       : header (No | Nama | tgl1 | tgl2 | ...)
    - Baris romawi  : level provinsi (rata-rata)
    - Baris angka   : level kota/kabupaten
    - Value '-'     : data tidak tersedia (→ NaN)
    """
    # Ambil daftar tanggal dari baris header
    tanggal_raw = df.iloc[0, 2:].tolist()

    rows = []
    for _, row in df.iterrows():
        no   = str(row.iloc[0]).strip()
        nama = str(row.iloc[1]).strip()

        # Hanya ambil baris level provinsi, skip "Semua Provinsi"
        if no not in ROMAWI or nama == "Semua Provinsi":
            continue

        for i, tgl in enumerate(tanggal_raw):
            val = row.iloc[i + 2]

            # Bersihkan nilai harga
            if pd.isna(val) or str(val).strip() == '-':
                harga = np.nan
            else:
                try:
                    harga = float(str(val).replace(',', '').strip())
                except ValueError:
                    harga = np.nan

            # Bersihkan format tanggal "02/ 03/ 2026" → "2026-03-02"
            try:
                tgl_clean = pd.to_datetime(
                    str(tgl).replace(' ', ''), format='%d/%m/%Y'
                )
            except Exception:
                tgl_clean = pd.NaT

            rows.append({
                'tanggal'   : tgl_clean,
                'provinsi'  : nama,
                'komoditas' : nama_komoditas,
                'harga'     : harga,
            })

    result = pd.DataFrame(rows)
    result = result.dropna(subset=['tanggal'])
    result = result.sort_values(['provinsi', 'tanggal']).reset_index(drop=True)
    return result


# ═══════════════════════════════════════════════════════════════════
# STEP 3 — Cleaning & Imputasi
# ═══════════════════════════════════════════════════════════════════

def cleaning(df: pd.DataFrame) -> pd.DataFrame:
    """
    Bersihkan data:
    - Forward-fill missing value per provinsi (pakai harga hari sebelumnya)
    - Hapus baris yang masih kosong setelah ffill (awal periode)
    - Pastikan tipe data benar
    """
    df = df.copy()

    # Forward-fill per provinsi
    df['harga'] = (
        df.groupby(['provinsi', 'komoditas'])['harga']
          .transform(lambda x: x.ffill())
    )

    # Hitung statistik missing sebelum & sesudah
    n_missing_before = df['harga'].isna().sum()
    df = df.dropna(subset=['harga'])
    n_missing_after  = df['harga'].isna().sum()

    print(f"  Missing: {n_missing_before} sel → {n_missing_after} (setelah ffill + drop)")
    return df


# ═══════════════════════════════════════════════════════════════════
# STEP 4 — Feature Engineering
# ═══════════════════════════════════════════════════════════════════

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """
    Tambahkan fitur turunan yang berguna untuk analisis & model:
    - harga_nasional    : rata-rata harga semua provinsi per hari
    - gap_dari_nasional : selisih harga provinsi vs nasional (Rp)
    - gap_pct           : selisih dalam persen
    - perubahan_harian  : delta harga hari ini vs kemarin (per provinsi)
    - rolling_7d        : rata-rata bergerak 7 hari
    - rolling_30d       : rata-rata bergerak 30 hari
    - volatilitas_7d    : std dev harga 7 hari terakhir
    """
    df = df.copy().sort_values(['komoditas', 'provinsi', 'tanggal'])

    # Rata-rata nasional per hari per komoditas
    nasional = (
        df.groupby(['tanggal', 'komoditas'])['harga']
          .mean()
          .reset_index()
          .rename(columns={'harga': 'harga_nasional'})
    )
    df = df.merge(nasional, on=['tanggal', 'komoditas'], how='left')

    # Gap vs nasional
    df['gap_dari_nasional'] = df['harga'] - df['harga_nasional']
    df['gap_pct'] = (df['gap_dari_nasional'] / df['harga_nasional'] * 100).round(2)

    # Perubahan harian per provinsi
    df['perubahan_harian'] = (
        df.groupby(['provinsi', 'komoditas'])['harga']
          .diff()
    )

    # Rolling statistics per provinsi
    def rolling_per_grup(grup, window):
        return grup['harga'].rolling(window, min_periods=1).mean()

    def rolling_std_per_grup(grup, window):
        return grup['harga'].rolling(window, min_periods=1).std()

    df['rolling_7d']      = df.groupby(['provinsi','komoditas'], group_keys=False).apply(lambda g: rolling_per_grup(g, 7))
    df['rolling_30d']     = df.groupby(['provinsi','komoditas'], group_keys=False).apply(lambda g: rolling_per_grup(g, 30))
    df['volatilitas_7d']  = df.groupby(['provinsi','komoditas'], group_keys=False).apply(lambda g: rolling_std_per_grup(g, 7))

    # Tambah kolom waktu untuk analisis musiman
    df['tahun']  = df['tanggal'].dt.year
    df['bulan']  = df['tanggal'].dt.month
    df['minggu'] = df['tanggal'].dt.isocalendar().week.astype(int)
    df['hari']   = df['tanggal'].dt.day_of_week  # 0=Senin

    return df


# ═══════════════════════════════════════════════════════════════════
# STEP 5 — Analisis Gap (Surplus / Defisit)
# ═══════════════════════════════════════════════════════════════════

def analisis_gap(df: pd.DataFrame) -> pd.DataFrame:
    """
    Klasifikasi tiap provinsi per komoditas per tanggal:
    - SURPLUS  : harga < nasional - 5%  (oversupply, petani tertekan)
    - NORMAL   : dalam range ±5% dari nasional
    - DEFISIT  : harga > nasional + 5%  (kekurangan pasokan)

    Threshold 5% berdasarkan toleransi disparitas HET Bapanas.
    """
    def klasifikasi(row):
        if row['gap_pct'] < -5:
            return 'SURPLUS'
        elif row['gap_pct'] > 5:
            return 'DEFISIT'
        else:
            return 'NORMAL'

    df = df.copy()
    df['status_pasokan'] = df.apply(klasifikasi, axis=1)
    return df


# ═══════════════════════════════════════════════════════════════════
# STEP 6 — Simpan Output
# ═══════════════════════════════════════════════════════════════════

def simpan(df: pd.DataFrame, nama: str):
    """Simpan ke CSV dan ringkasan JSON."""
    # CSV lengkap
    path_csv = CLEAN_DIR / f"{nama}_clean.csv"
    df.to_csv(path_csv, index=False)
    print(f"  Tersimpan → {path_csv}")

    # Ringkasan JSON untuk dashboard
    ringkasan = {
        "komoditas"         : nama,
        "total_baris"       : len(df),
        "jumlah_provinsi"   : df['provinsi'].nunique(),
        "rentang_tanggal"   : {
            "mulai" : str(df['tanggal'].min().date()),
            "akhir" : str(df['tanggal'].max().date()),
        },
        "harga_nasional_terakhir" : round(
            df[df['tanggal'] == df['tanggal'].max()]['harga_nasional'].mean(), 0
        ),
        "status_terbaru" : (
            df[df['tanggal'] == df['tanggal'].max()]
              .groupby('status_pasokan')['provinsi']
              .apply(list)
              .to_dict()
        ),
    }
    path_json = CLEAN_DIR / f"{nama}_ringkasan.json"
    with open(path_json, 'w', encoding='utf-8') as f:
        json.dump(ringkasan, f, ensure_ascii=False, indent=2)
    print(f"  Ringkasan → {path_json}")


# ═══════════════════════════════════════════════════════════════════
# MAIN — Jalankan Pipeline untuk Semua Komoditas
# ═══════════════════════════════════════════════════════════════════

def jalankan_pipeline():
    print("=" * 55)
    print("  PIPELINE DATA HARGA PANGAN — PIHPS BI")
    print("=" * 55)

    semua = []  # Untuk gabungan semua komoditas

    for nama_file, nama_komoditas in FILE_KOMODITAS.items():
        path = RAW_DIR / nama_file
        slug = nama_komoditas.lower().replace(' ', '_')

        print(f"\n▶ {nama_komoditas}")
        print(f"  File: {nama_file}")

        # Cek file ada
        if not path.exists():
            print(f"  ⚠️  File tidak ditemukan di {path}")
            print(f"      Letakkan file di folder: data/raw/")
            continue

        # Jalankan setiap step
        df_raw   = baca_xlsx(path)
        df_tidy  = parse_pihps(df_raw, nama_komoditas)
        df_clean = cleaning(df_tidy)
        df_feat  = feature_engineering(df_clean)
        df_final = analisis_gap(df_feat)

        # Simpan per komoditas
        simpan(df_final, slug)
        semua.append(df_final)

        # Preview hasil
        print(f"\n  Preview 3 baris terakhir ({nama_komoditas}):")
        cols_preview = ['tanggal','provinsi','harga','gap_pct','status_pasokan']
        print(df_final[cols_preview].tail(3).to_string(index=False))

    # Gabungkan semua komoditas dalam 1 file master
    if semua:
        df_master = pd.concat(semua, ignore_index=True)
        path_master = CLEAN_DIR / "semua_komoditas.csv"
        df_master.to_csv(path_master, index=False)
        print(f"\n{'='*55}")
        print(f"  Master dataset → {path_master}")
        print(f"  Total baris    : {len(df_master):,}")
        print(f"  Komoditas      : {df_master['komoditas'].nunique()}")
        print(f"  Provinsi       : {df_master['provinsi'].nunique()}")
        print(f"{'='*55}")

    return df_master if semua else None


if __name__ == "__main__":
    df = jalankan_pipeline()