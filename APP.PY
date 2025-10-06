import json
from datetime import date, datetime
import os

# Nama file untuk menyimpan data
DATA_FILE = 'pasien_data.json'
# --- FUNGSI UTILITY DATA I/O ---

def load_data():
    """Memuat data pasien dari file JSON lokal."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                print("Peringatan: File data korup atau kosong. Membuat data kosong.")
                return {}
    return {}

def save_data(data):
    """Menyimpan data pasien ke file JSON lokal."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    print(">>> Data berhasil disimpan.")

# --- FUNGSI UTILITY WAKTU & FORMATTING ---

def get_today_date_str():
    """Mengembalikan tanggal hari ini dalam format YYYY-MM-DD."""
    return date.today().isoformat()

def format_date_display(iso_date_str):
    """Mengubah format YYYY-MM-DD menjadi DD-MM-YYYY."""
    if not iso_date_str:
        return "-"
    try:
        dt = date.fromisoformat(iso_date_str)
        return dt.strftime("%d-%m-%Y")
    except ValueError:
        return iso_date_str # Kembalikan asli jika format salah

def parse_date_input(prompt):
    """Meminta input tanggal dan memastikan format YYYY-MM-DD yang valid."""
    while True:
        date_str = input(prompt).strip()
        if not date_str:
            return None
        try:
            # Mengasumsikan input user adalah DD-MM-YYYY
            dt = datetime.strptime(date_str, "%d-%m-%Y").date()
            return dt.isoformat() # Simpan sebagai YYYY-MM-DD
        except ValueError:
            print("Format tanggal salah. Gunakan format DD-MM-YYYY (Contoh: 31-12-2024).")

def check_ready_to_contact(patient_data):
    """Memeriksa apakah pasien siap dihubungi."""
    today = date.today()
    
    # Ambil tanggal obat berikutnya
    next_contact_date_str = patient_data.get('tglObatBerikutnya')
    
    if not next_contact_date_str:
        return False, "Tidak ada Tgl. Obat Berikutnya"

    try:
        next_contact_date = date.fromisoformat(next_contact_date_str)
    except ValueError:
        return False, "Format Tgl. Obat Berikutnya tidak valid"

    # Periksa apakah tanggal sudah tiba atau terlewat
    date_passed = next_contact_date <= today
    
    # Periksa apakah sudah dihubungi hari ini
    last_contact = patient_data.get('lastContactDate')
    contacted_today = last_contact == get_today_date_str()

    if date_passed and not contacted_today:
        return True, "SIAP DIHUBUNGI"
    elif contacted_today:
        return False, "Sudah Dihubungi Hari Ini"
    else:
        return False, f"Menunggu ({format_date_display(next_contact_date_str)})"

# --- FUNGSI UTAMA APLIKASI ---

def add_new_visit(data):
    """Memasukkan data pasien baru atau kunjungan baru untuk pasien lama."""
    print("\n--- INPUT KUNJUNGAN BARU ---")
    
    # 1. Data Identitas
    while True:
        nik = input("Masukkan NIK/BPJS (ID Unik): ").strip()
        if nik:
            break
        print("NIK tidak boleh kosong.")
    
    existing_patient = data.get(nik)

    if existing_patient:
        print(f"Pasien '{existing_patient['nama']}' ditemukan.")
        nama = existing_patient['nama']
        nomor_hp = existing_patient['nomorHp']
        status_prolanis = existing_patient['statusProlanis']
        jenis_prb = existing_patient['jenisPrb']
    else:
        nama = input("Nama Pasien: ").strip()
        nomor_hp = input("Nomor HP (Contoh: 62812xxxxxx): ").strip()
        status_prolanis = input("Status Prolanis (Ya/Tidak/Perlu Dicek): ").strip() or "Perlu Dicek"
        jenis_prb = input("Jenis PRB (Contoh: DM, HT): ").strip()
        
    # 2. Data Pemeriksaan Kunjungan
    print("\n--- DATA PEMERIKSAAN ---")
    
    try:
        td_sistole = int(input("TD Sistole (mmHg): ").strip())
        td_diastole = int(input("TD Diastole (mmHg): ").strip())
    except ValueError:
        print("TD harus berupa angka.")
        return

    gula_darah = input("Gula Darah (mg/dL atau -): ").strip() or "-"
    kesadaran = input("Kesadaran: ").strip() or "Compos Mentis"
    
    tgl_obat_berikutnya = parse_date_input("Tanggal Obat Berikutnya (DD-MM-YYYY): ")
    if not tgl_obat_berikutnya:
        print("Pembatalan input kunjungan.")
        return

    tgl_input = get_today_date_str()
    
    # Kumpulkan data riwayat kunjungan
    new_riwayat = {
        'tglArsip': tgl_input,
        'sistole': td_sistole,
        'diastole': td_diastole,
        'gulaDarah': gula_darah,
        'kesadaran': kesadaran,
        'jenisPrb': jenis_prb,
    }

    # Kumpulkan data pasien utama
    new_patient_data = {
        'nama': nama,
        'nik': nik,
        'nomorHp': nomor_hp,
        'statusProlanis': status_prolanis,
        'jenisPrb': jenis_prb,
        # Data kunjungan terbaru
        'tdSistole': td_sistole,
        'tdDiastole': td_diastole,
        'gulaDarah': gula_darah,
        'tglObatBerikutnya': tgl_obat_berikutnya,
        'kesadaran': kesadaran,
        'tglInput': tgl_input,
        'lastContactDate': existing_patient.get('lastContactDate') if existing_patient else None,
        'riwayat': [new_riwayat] # Riwayat baru
    }

    # Jika pasien sudah ada, tambahkan riwayat ke data yang sudah ada
    if existing_patient:
        existing_patient['riwayat'].insert(0, new_riwayat)
        
        # Perbarui data utama pasien dengan kunjungan terbaru
        existing_patient.update(new_patient_data)
        
        print(f"\nKunjungan baru untuk {nama} berhasil ditambahkan.")
    else:
        # Jika pasien baru, inisialisasi dengan data baru
        data[nik] = new_patient_data
        print(f"\nPasien baru {nama} berhasil didaftarkan dan kunjungan pertama dicatat.")

    save_data(data)

def display_recap(data):
    """Menampilkan rekapan kunjungan dengan status 'SIAP DIHUBUNGI'."""
    print("\n--- REKAPAN KUNJUNGAN PASIEN ---")
    if not data:
        print("Belum ada data pasien.")
        return

    patients = list(data.values())
    
    # Urutkan berdasarkan tanggal obat berikutnya yang paling dekat
    patients.sort(key=lambda p: (
        check_ready_to_contact(p)[0], # Prioritaskan yang siap dihubungi (True > False)
        p.get('tglObatBerikutnya') or '9999-12-31' # Urutan tanggal
    ), reverse=True)

    print("---------------------------------------------------------------------------------------------------------------------")
    print("| No. | Nama Pasien        | NIK/BPJS           | TD (mmHg) | Tgl. Obat Berikutnya | Status Kontak     | Status Prolanis |")
    print("---------------------------------------------------------------------------------------------------------------------")

    for i, p in enumerate(patients):
        is_ready, contact_status_text = check_ready_to_contact(p)
        
        status_display = f"\033[91m{contact_status_text}\033[0m" if is_ready else contact_status_text
        
        # Ambil TD terbaru dari data utama
        td_display = f"{p.get('tdSistole', '-')}/{p.get('tdDiastole', '-')}"
        
        print(f"| {i+1:<3} | {p['nama']:<18} | {p['nik']:<18} | {td_display:<9} | {format_date_display(p['tglObatBerikutnya']):<20} | {status_display:<17} | {p['statusProlanis']:<15} |")
    
    print("---------------------------------------------------------------------------------------------------------------------")


def mark_contacted(data):
    """Menandai pasien sebagai sudah dihubungi hari ini."""
    display_recap(data)
    if not data:
        return

    nik_to_contact = input("\nMasukkan NIK/BPJS pasien yang ingin ditandai sudah dihubungi: ").strip()

    if nik_to_contact in data:
        patient = data[nik_to_contact]
        is_ready, _ = check_ready_to_contact(patient)
        
        if is_ready:
            patient['lastContactDate'] = get_today_date_str()
            save_data(data)
            print(f"Pasien {patient['nama']} ({nik_to_contact}) berhasil ditandai sudah dihubungi hari ini.")
        else:
            print(f"Pasien {patient['nama']} tidak perlu ditandai, status: {check_ready_to_contact(patient)[1]}.")
    else:
        print("NIK/BPJS tidak ditemukan.")

def main():
    """Fungsi utama untuk menjalankan aplikasi CLI."""
    data = load_data()

    while True:
        print("\n==============================================")
        print("  SISTEM MANAJEMEN PASIEN PROLANIS (CLI) ")
        print("==============================================")
        print("1. Input Kunjungan Baru/Pasien Baru")
        print("2. Tampilkan Rekapan Kunjungan")
        print("3. Tandai Pasien Sudah Dihubungi Hari Ini")
        print("4. Keluar")
        print("----------------------------------------------")

        choice = input("Pilih Opsi (1-4): ").strip()

        if choice == '1':
            add_new_visit(data)
        elif choice == '2':
            display_recap(data)
        elif choice == '3':
            mark_contacted(data)
        elif choice == '4':
            print("Terima kasih. Program diakhiri.")
            break
        else:
            print("Pilihan tidak valid. Silakan coba lagi.")

if __name__ == "__main__":
    main()
