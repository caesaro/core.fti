# TODO: Implementasi Fitur Manajemen PKL

## Step 1: Update Database Schema
- [x] Tambahkan tabel `pkl_students` ke database_schema.sql (tanpa NISN)

## Step 2: Update Backend (server.js)
- [x] Tambahkan endpoint GET /api/pkl
- [x] Tambahkan endpoint POST /api/pkl (support batch)
- [x] Tambahkan endpoint PUT /api/pkl/:id
- [x] Tambahkan endpoint DELETE /api/pkl/:id

## Step 3: Update Types
- [x] Tambahkan interface PKLStudent ke types.ts

## Step 4: Update Sidebar
- [x] Tambahkan menu "Manajemen PKL" untuk role Admin dan Laboran

## Step 5: Update App.tsx
- [x] Tambahkan routing untuk halaman PKLManagement
- [x] Import komponen PKLManagement

## Step 6: Create PKL Management Page
- [x] Buat file pages/PKLManagement.tsx
- [x] Implementasi tabel data PKL
- [x] Implementasi form tambah/edit PKL (batch support)
- [x] Implementasi upload surat pengajuan
- [x] Filter dan search functionality

## Status: SELESAI ✓

