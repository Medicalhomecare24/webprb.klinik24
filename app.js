// ==========================================================
// 1. DATA DUMMY PASIEN (Simulasi database lokal)
// ==========================================================
let dataPasien = [
    {
        nama: "Ahmad Subarjo",
        nik: "327310xxxxxx1234",
        tdSistole: 125,
        tdDiastole: 85,
        gulaDarah: "145",
        tglObatBerikutnya: "2025-11-20",
        statusProlanis: "Ya",
        kesadaran: "Compos Mentis",
        jenisPrb: "DM, HT",
        tglInput: "20-10-2025",
        riwayat: [
            { tglArsip: "2025-10-20", sistole: 125, diastole: 85, gulaDarah: "145", kesadaran: "Compos Mentis", jenisPrb: "DM, HT" },
            { tglArsip: "2025-09-20", sistole: 120, diastole: 80, gulaDarah: "150", kesadaran: "Compos Mentis", jenisPrb: "DM, HT" },
            { tglArsip: "2025-08-20", sistole: 130, diastole: 88, gulaDarah: "160", kesadaran: "Compos Mentis", jenisPrb: "DM, HT" },
        ]
    },
    {
        nama: "Budi Santoso",
        nik: "327310xxxxxx5678",
        tdSistole: 140,
        tdDiastole: 90,
        gulaDarah: "-",
        tglObatBerikutnya: "2025-11-25",
        statusProlanis: "Tidak",
        kesadaran: "Apatis",
        jenisPrb: "HT",
        tglInput: "25-10-2025",
        riwayat: [
            { tglArsip: "2025-10-25", sistole: 140, diastole: 90, gulaDarah: "-", kesadaran: "Apatis", jenisPrb: "HT" },
            { tglArsip: "2025-09-25", sistole: 135, diastole: 85, gulaDarah: "-", kesadaran: "Compos Mentis", jenisPrb: "HT" },
        ]
    }
];


// ==========================================================
// 2. FUNGSI UTAMA: PENGATUR NAVIGASI & SETUP Awal
// ==========================================================

/** Mengganti tampilan konten berdasarkan tautan navbar yang diklik */
function switchSection(sectionId) {
    // 1. Sembunyikan semua section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Tampilkan section yang diminta
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // 3. Atur status aktif pada navbar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // 4. Render ulang data untuk section yang aktif
    if (sectionId === 'rekapan-section') {
        renderPasienTable('rekapan');
    } else if (sectionId === 'daftar-section') {
        renderPasienTable('daftar');
    }
}

// Event listener untuk navigasi navbar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Tampilkan section default saat pertama kali dimuat
    switchSection('rekapan-section'); 
});


// ==========================================================
// 3. FUNGSI UTAMA: MENANGANI DATA & TAMPILAN TABEL
// ==========================================================

/** Fungsi pembantu untuk format tanggal YYYY-MM-DD ke DD-MM-YYYY */
function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    try {
        // Menerima format YYYY-MM-DD atau DD-MM-YYYY (atau Date object)
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
             // Coba parse DD-MM-YYYY (untuk data dummy)
             const parts = dateStr.split('-');
             if (parts.length === 3) {
                 return dateStr;
             }
             return '-';
        }
        
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear();
        return `${day}-${month}-${year}`;

    } catch (error) {
        return dateStr; // Kembalikan string asli jika gagal
    }
}


/** Fungsi untuk merender data pasien ke dalam tabel (rekapan/daftar) */
function renderPasienTable(type, data = dataPasien) {
    let tableBodyId, showInputDate;
    
    // Tentukan elemen dan kolom yang akan ditampilkan
    if (type === 'rekapan') {
        tableBodyId = 'pasien-data-body-rekapan';
        showInputDate = true;
    } else if (type === 'daftar') {
        tableBodyId = 'pasien-data-body-daftar';
        showInputDate = false;
    } else {
        return; // Hentikan jika tipe tidak valid
    }

    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Bersihkan tabel

    data.forEach((pasien, index) => {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-nama', pasien.nama);
        
        // Logika untuk Rekapan Pasien (Kunjungan Terbaru)
        if (showInputDate) {
            newRow.innerHTML = `
                <td data-label="No.">${index + 1}</td>
                <td data-label="Nama Pasien"><strong>${pasien.nama}</strong></td>
                <td data-label="No. BPJS / NIK">${pasien.nik}</td>
                <td data-label="TD (mmHg)">${pasien.tdSistole}/${pasien.tdDiastole}</td>
                <td data-label="Gula Darah (mg/dL)">${pasien.gulaDarah}</td>
                <td data-label="Tgl. Obat Berikutnya">${formatDate(pasien.tglObatBerikutnya)}</td>
                <td data-label="Status Prolanis">${pasien.statusProlanis}</td>
                <td data-label="Tgl. Input">${pasien.tglInput}</td>
                <td data-label="Aksi">
                    <button class="btn-rekap" onclick="showRekapModal(${index})">
                        <i class="fas fa-file-alt"></i> Rekap
                    </button>
                </td>
            `;
        } 
        // Logika untuk Daftar Pasien (Hanya Data Utama)
        else {
            newRow.innerHTML = `
                <td data-label="No.">${index + 1}</td>
                <td data-label="Nama Pasien"><strong>${pasien.nama}</strong></td>
                <td data-label="No. BPJS / NIK">${pasien.nik}</td>
                <td data-label="TD Terbaru (mmHg)">${pasien.tdSistole}/${pasien.tdDiastole}</td>
                <td data-label="Gula Darah Terbaru">${pasien.gulaDarah}</td>
                <td data-label="Tgl. Obat Berikutnya">${formatDate(pasien.tglObatBerikutnya)}</td>
                <td data-label="Status Prolanis">${pasien.statusProlanis}</td>
                <td data-label="Aksi">
                    <button class="btn-rekap" onclick="showRekapModal(${index})">
                        <i class="fas fa-file-alt"></i> Riwayat
                    </button>
                </td>
            `;
        }
        tableBody.appendChild(newRow);
    });
}


// ==========================================================
// 4. PENANGANAN FORM SUBMIT (Simpan/Update Data)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pasien-input-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nama = document.getElementById('namaPasien').value.trim();
        const nik = document.getElementById('nik').value.trim();
        const sistole = document.getElementById('tdSistole').value;
        const diastole = document.getElementById('tdDiastole').value;
        const gulaDarah = document.getElementById('gulaDarah').value.trim();
        const tglObatBerikutnya = document.getElementById('tglObatBerikutnya').value;
        const statusProlanis = document.getElementById('statusProlanis').value;
        const kesadaran = document.getElementById('kesadaran').value.trim();
        const jenisPrb = document.getElementById('jenisPrb').value.trim();

        const today = new Date();
        const tglInputFormatted = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

        // Cek apakah pasien sudah ada
        let existingIndex = dataPasien.findIndex(p => p.nik === nik);

        const newRiwayat = {
            tglArsip: tglObatBerikutnya, 
            sistole: parseInt(sistole),
            diastole: parseInt(diastole),
            gulaDarah: gulaDarah,
            kesadaran: kesadaran,
            jenisPrb: jenisPrb,
        };

        if (existingIndex !== -1) {
            // Pasien sudah ada: Update data utama dan tambahkan riwayat
            dataPasien[existingIndex] = {
                ...dataPasien[existingIndex],
                tdSistole: parseInt(sistole),
                tdDiastole: parseInt(diastole),
                gulaDarah: gulaDarah,
                tglObatBerikutnya: tglObatBerikutnya,
                statusProlanis: statusProlanis,
                kesadaran: kesadaran,
                jenisPrb: jenisPrb,
                tglInput: tglInputFormatted,
            };
            // Tambahkan riwayat baru ke paling awal (terbaru di atas)
            dataPasien[existingIndex].riwayat.unshift(newRiwayat);
            
        } else {
            // Pasien baru: Tambahkan data baru
            dataPasien.push({
                nama: nama,
                nik: nik,
                tdSistole: parseInt(sistole),
                tdDiastole: parseInt(diastole),
                gulaDarah: gulaDarah,
                tglObatBerikutnya: tglObatBerikutnya,
                statusProlanis: statusProlanis,
                kesadaran: kesadaran,
                jenisPrb: jenisPrb,
                tglInput: tglInputFormatted,
                riwayat: [newRiwayat]
            });
        }

        renderPasienTable('rekapan'); // Update tampilan tabel rekapan
        form.reset(); // Bersihkan form
        // Ganti alert dengan console.log atau UI custom jika menggunakan iFrame
        console.log(`Data Pasien ${nama} berhasil disimpan/diperbarui!`);
    });
});


// ==========================================================
// 5. FUNGSI PENCARIAN (Search)
// ==========================================================

/** Fungsi Pencarian yang fleksibel */
function performSearch(type) {
    const searchInputId = type === 'rekapan' ? 'search-input-rekapan' : 'search-input-daftar';
    const searchInput = document.getElementById(searchInputId);
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredData = dataPasien.filter(pasien => 
        pasien.nama.toLowerCase().includes(searchTerm) || 
        pasien.nik.includes(searchTerm)
    );

    renderPasienTable(type, filteredData);
}

// Tambahkan event listener untuk Pencarian
document.addEventListener('DOMContentLoaded', () => {
    // Rekapan
    const searchButtonRekapan = document.getElementById('search-button-rekapan');
    const searchInputRekapan = document.getElementById('search-input-rekapan');
    if (searchButtonRekapan) searchButtonRekapan.addEventListener('click', () => performSearch('rekapan'));
    if (searchInputRekapan) searchInputRekapan.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch('rekapan');
    });

    // Daftar Pasien
    const searchButtonDaftar = document.getElementById('search-button-daftar');
    const searchInputDaftar = document.getElementById('search-input-daftar');
    if (searchButtonDaftar) searchButtonDaftar.addEventListener('click', () => performSearch('daftar'));
    if (searchInputDaftar) searchInputDaftar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch('daftar');
    });
});


// ==========================================================
// 6. FUNGSI UNTUK MODAL REKAP RIWAYAT BULANAN
// ==========================================================

let currentPasienIndex = null; 

/** Fungsi untuk menampilkan detail rekap dalam modal */
window.showRekapModal = (index) => {
    currentPasienIndex = index;
    const pasien = dataPasien[index];
    const rekapModal = document.getElementById('rekapModal');
    const pasienNamaElement = document.getElementById('pasien-nama-rekap-modal');
    const filterBulanElement = document.getElementById('filterBulan');

    if (!rekapModal || !pasienNamaElement || !filterBulanElement) return;

    pasienNamaElement.textContent = pasien.nama;
    
    // Set filter bulan default
    let latestDateStr = new Date().toISOString().substring(0, 7);
    if (pasien.riwayat.length > 0) {
        // Ambil tanggal terbaru dari riwayat (asumsi format YYYY-MM-DD)
        const latestRiwayatDate = pasien.riwayat[0].tglArsip;
        if (latestRiwayatDate && latestRiwayatDate.length >= 7) {
            latestDateStr = latestRiwayatDate.substring(0, 7);
        }
    }
    filterBulanElement.value = latestDateStr;
    
    filterRekap(); // Tampilkan data riwayat sesuai filter default
    rekapModal.style.display = 'block';
};

/** Fungsi untuk menutup modal rekap */
window.closeRekapModal = () => {
    const rekapModal = document.getElementById('rekapModal');
    if (rekapModal) {
        rekapModal.style.display = 'none';
    }
};

/** Fungsi untuk memfilter dan merender data rekap di modal */
window.filterRekap = () => {
    if (currentPasienIndex === null) return;

    const pasien = dataPasien[currentPasienIndex];
    const filterBulanElement = document.getElementById('filterBulan');
    const rekapBodyModal = document.getElementById('rekap-detail-body-modal');

    if (!filterBulanElement || !rekapBodyModal) return;

    const filterBulan = filterBulanElement.value; // Format YYYY-MM
    rekapBodyModal.innerHTML = '';

    // Filter riwayat berdasarkan bulan
    const riwayatTerfilter = pasien.riwayat.filter(riwayat => {
        // Asumsi tglArsip berbentuk YYYY-MM-DD
        return riwayat.tglArsip.startsWith(filterBulan);
    }); 

    if (riwayatTerfilter.length > 0) {
        riwayatTerfilter.forEach(riwayat => {
            const newRowRekap = document.createElement('tr');
            newRowRekap.innerHTML = `
                <td data-label="Tgl. Kunjungan">${formatDate(riwayat.tglArsip)}</td>
                <td data-label="Kesadaran">${riwayat.kesadaran}</td>
                <td data-label="Sistole (mmHg)">${riwayat.sistole}</td>
                <td data-label="Diastole (mmHg)">${riwayat.diastole}</td>
                <td data-label="Gula Darah (mg/dL)">${riwayat.gulaDarah || '-'}</td>
                <td data-label="Jenis PRB">${riwayat.jenisPrb}</td>
            `;
            rekapBodyModal.appendChild(newRowRekap);
        });
    } else {
        rekapBodyModal.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada riwayat kunjungan di bulan ini.</td></tr>';
    }
};


// ==========================================================
// 7. FUNGSI PENGATUR TEMA (DARK MODE)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!themeToggle || !body) return;

    function toggleTheme() {
        body.classList.toggle('dark');
        const isDarkMode = body.classList.contains('dark');
        // Simpan preferensi di localStorage
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        
        // Update ikon tombol
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon', 'fa-sun');
            icon.classList.add(isDarkMode ? 'fa-sun' : 'fa-moon');
        }
    }

    // Cek tema yang tersimpan saat memuat halaman
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'enabled') {
        body.classList.add('dark');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    } else {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.add('fa-moon');
        }
    }

    // Event listener untuk tombol toggle
    themeToggle.addEventListener('click', toggleTheme);
});
