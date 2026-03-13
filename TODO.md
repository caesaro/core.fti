# TODO: Implement Konfirmasi Pengembalian Enhancements & Detail Peminjaman UI Refinements

## Steps from Approved Plan (to be checked off as completed)

### 1. [x] Update types.ts
   - Add `returnLocation?: string; condition?: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';` to Loan interface.
   - Add `'Pengembalian'` to ItemMovement.movementType union.

### 2. [x] Update pages/PeminjamanBarang.tsx - Return Modal & Logic
   - Extend returnConfirmation state with returnLocation (default loans[0].location), condition ('Baik').
   - Add JSX inputs: Lokasi Pengembalian text, Kondisi dropdown.
   - Update confirmReturn(): Send new fields to /api/loans/return, auto-create ItemMovement(s), update equipment location.

### 3. [x] Refine Detail Peminjaman UI/UX in pages/PeminjamanBarang.tsx
   - Convert item list to cards/grid.
   - Enhance header, add condition display, improve responsiveness/spacing.

### 4. [x] Update pages/PerpindahanBarang.tsx
   - Add 'Pengembalian' to filterType and getTypeColor.

### 5. [ ] Test & Backend Followups
   - Test full flow: borrow → return with fields → verify in PerpindahanBarang, equipment location.
   - Backend: Update server.js/database_schema.sql for new fields/ItemMovement creation.

**All frontend steps completed ✅ Next: Backend/database updates & testing**

