# Task: Refactor Ruangan.tsx & Add Software Management

## Objective
Separate computer specs management from Ruangan.tsx into a dedicated page, and add software inventory management for Laboratorium.

## Steps

### 1. Update Types
- [ ] Add `Software` interface to `types.ts`
- [ ] Add `RoomComputer` related interfaces if not present

### 2. Create New Page
- [ ] Create `pages/ManajemenSpesifikasi.tsx` containing:
  - Room list with computer management
  - Computer specs CRUD
  - Software inventory management
  - Import/Export Excel functionality

### 3. Update Backend (server.js)
- [ ] Add GET/POST/PUT/DELETE endpoints for software management
- [ ] Ensure existing computer endpoints are functional

### 4. Refactor Ruangan.tsx
- [ ] Remove computer specs management code (keep summary display)
- [ ] Add "Manage Specs" button that links to new page

### 5. Update Navigation
- [ ] Add menu item to `Sidebar.tsx` for "Manajemen Spesifikasi & Software"

## Implementation Details

### Software Interface
```typescript
interface Software {
  id: string;
  name: string;
  version: string;
  licenseType: 'Free' | 'Commercial' | 'Open Source';
  licenseKey?: string;
  vendor?: string;
  installDate?: string;
  roomId?: string; // Optional: link to specific room
  notes?: string;
}
```

### Database Schema (Software)
- Table: `software`
- Fields: id, name, version, license_type, license_key, vendor, install_date, room_id, notes, created_at, updated_at

