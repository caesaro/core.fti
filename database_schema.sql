-- ==========================================
-- SKEMA DATABASE CORE.FTI (PostgreSQL)
-- ==========================================

-- 1. Tabel Users
-- Menyimpan data semua pengguna (Mahasiswa, Dosen, Admin, Teknisi)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    identifier VARCHAR(50),
    telepon VARCHAR(20),
    avatar_image BYTEA,
    status VARCHAR(20) DEFAULT 'Aktif',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Tabel Staff
-- Menyimpan data staff/laboran yang bisa menjadi PIC ruangan
CREATE TABLE staff (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    identifier VARCHAR(50),
    email VARCHAR(100),
    telepon VARCHAR(20),
    jabatan VARCHAR(50),
    user_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Tabel Rooms
-- Menyimpan data ruangan laboratorium
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    deskripsi TEXT,
    kapasitas INT NOT NULL,
    pic_id VARCHAR(50),
    image_data BYTEA,
    fasilitas TEXT[],
    google_calendar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_staff FOREIGN KEY (pic_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- 3. Tabel Bookings
-- Transaksi peminjaman ruangan
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    penanggung_jawab VARCHAR(100) NOT NULL,
    contact_person VARCHAR(50) NOT NULL,
    keperluan TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    file_proposal BYTEA,
    tech_support_pic TEXT[],
    tech_support_needs TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3b. Tabel Booking Schedules (Detail Jadwal)
CREATE TABLE booking_schedules (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT fk_schedule_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 4. Tabel Equipment
-- Data barang inventaris
CREATE TABLE inventory (
    id VARCHAR(50) PRIMARY KEY,
    uksw_code VARCHAR(50),
    nama VARCHAR(100) NOT NULL,
    kategori VARCHAR(50),
    kondisi VARCHAR(20) DEFAULT 'Baik',
    is_available BOOLEAN DEFAULT TRUE,
    serial_number VARCHAR(100),
    lokasi VARCHAR(100), -- Lokasi/Rak/Ruangan barang saat ini
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Transactions
-- Header peminjaman (Satu transaksi bisa memuat banyak barang)
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    peminjam_identifier VARCHAR(50) NOT NULL,
    nama_peminjam VARCHAR(100) NOT NULL,
    petugas_pinjam VARCHAR(100),
    petugas_kembali VARCHAR(100),
    jaminan VARCHAR(50),
    tgl_pinjam DATE NOT NULL,
    waktu_pinjam TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Loans (Detail Barang)
-- Detail barang dalam satu transaksi
CREATE TABLE loans (
    id VARCHAR(50) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    inventory_id VARCHAR(50) NOT NULL,
    actual_return_date DATE,
    actual_return_time TIME,
    status VARCHAR(20) DEFAULT 'Dipinjam',
    petugas_pengembalian VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
);

-- 6b. Tabel Item Movements (Tracking Perpindahan Barang)
-- Mencatat perpindahan barang (baik dari peminjaman maupun input manual)
CREATE TABLE item_movements (
    id VARCHAR(50) PRIMARY KEY,
    inventory_id VARCHAR(50) NOT NULL,
    movement_date DATE NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- 'Peminjaman' atau 'Manual'
    from_person VARCHAR(100), -- Siapa yang menyerahkan
    to_person VARCHAR(100), -- Siapa yang menerima
    moved_by VARCHAR(100), -- Staff yang memproses
    quantity INT DEFAULT 1,
    from_location VARCHAR(100), -- Lokasi SEBELUM perpindahan
    to_location VARCHAR(100), -- Lokasi SESUDAH perpindahan
    notes TEXT,
    loan_id VARCHAR(50), -- Reference ke loans (nullable untuk manual)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movement_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Indexing untuk Item Movements
CREATE INDEX idx_movements_inventory ON item_movements(inventory_id);
CREATE INDEX idx_movements_date ON item_movements(movement_date);
CREATE INDEX idx_movements_type ON item_movements(movement_type);

-- 7. Tabel Notifications
-- Menyimpan riwayat notifikasi untuk dashboard
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexing untuk performa pencarian
CREATE INDEX idx_booking_schedules_date ON booking_schedules(schedule_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_inventory_uksw_code ON inventory(uksw_code);
-- Indexing untuk Foreign Keys (Mempercepat JOIN)
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_loans_inventory_id ON loans(inventory_id);
CREATE INDEX idx_loans_transaction_id ON loans(transaction_id);
CREATE INDEX idx_rooms_pic_id ON rooms(pic_id);
CREATE INDEX idx_transactions_peminjam ON transactions(peminjam_identifier);
CREATE INDEX idx_transactions_tgl ON transactions(tgl_pinjam);

-- 8. Tabel System Settings
-- Menyimpan konfigurasi global aplikasi
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default value (Maintenance Mode: OFF)
INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', 'false');
INSERT INTO system_settings (key, value) VALUES ('global_announcement', '{"active": false, "message": "", "type": "info"}');

-- 9. Tabel Room Computers (Spesifikasi Komputer per Ruangan)
CREATE TABLE room_computers (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    pc_number VARCHAR(50),
    cpu VARCHAR(100),
    gpu_type VARCHAR(50),
    gpu_model VARCHAR(100),
    vram VARCHAR(50),
    ram VARCHAR(50),
    storage VARCHAR(100),
    os VARCHAR(100),
    keyboard VARCHAR(100),
    mouse VARCHAR(100),
    monitor VARCHAR(100),
    condition VARCHAR(50) DEFAULT 'Baik',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_computer_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 10. Tabel PKL Students (Orang Magang/PKL)
CREATE TABLE pkl_students (
    id VARCHAR(50) PRIMARY KEY,
    nama_siswa VARCHAR(100) NOT NULL,
    sekolah VARCHAR(100) NOT NULL,
    Jurusan VARCHAR(100),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Aktif',
    surat_pengajuan BYTEA,
    pembimbing_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pkl_staff FOREIGN KEY (pembimbing_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Indexing untuk PKL
CREATE INDEX idx_pkl_sekolah ON pkl_students(sekolah);
CREATE INDEX idx_pkl_status ON pkl_students(status);
CREATE INDEX idx_pkl_pembimbing ON pkl_students(pembimbing_id);

-- 11. Tabel Class Schedules (Jadwal Kuliah)
-- Menyimpan jadwal kelas per semester
CREATE TABLE class_schedules (
    id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,       -- Kode Matakuliah (misal: TI401)
    course_name VARCHAR(100) NOT NULL,      -- Nama Matakuliah (misal: Jaringan Komputer)
    class_group VARCHAR(10) NOT NULL,       -- Kelompok Kelas (misal: A, B, C)
    day_of_week VARCHAR(10) NOT NULL,      -- Hari (Senin, Selasa, etc.)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester VARCHAR(20) NOT NULL,          -- Semester (misal: Ganjil 2024/2025)
    academic_year VARCHAR(20) NOT NULL,     -- Tahun Akademik (2024/2025)
    room_id VARCHAR(50),
    lecturer_name VARCHAR(100),             -- Nama Dosen Pengampu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Indexing untuk Class Schedules
CREATE INDEX idx_class_schedules_room ON class_schedules(room_id);
CREATE INDEX idx_class_schedules_semester ON class_schedules(semester);
CREATE INDEX idx_class_schedules_academic ON class_schedules(academic_year);
CREATE INDEX idx_class_schedules_day ON class_schedules(day_of_week);

