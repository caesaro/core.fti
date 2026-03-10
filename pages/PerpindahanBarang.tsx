// Page: ItemMovements (Perpindahan Barang)
import React, { useState, useEffect } from 'react';
import { Role, ItemMovement, Equipment } from '../types';
import { Search, Filter, Plus, X, ArrowRightLeft, Box, Calendar, MapPin, FileText, Eye, Save, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

interface ItemMovementsProps {
  role: Role;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const ItemMovements: React.FC<ItemMovementsProps> = ({ role, showToast }) => {
  const [movements, setMovements] = useState<ItemMovement[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Peminjaman' | 'Manual'>('All');
  const [filterInventory, setFilterInventory] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    inventoryId: '',
    movementDate: new Date().toISOString().split('T')[0],
    movementType: 'Manual' as 'Manual' | 'Peminjaman',
    fromPerson: '',
    toPerson: '',
    movedBy: '',
    quantity: 1,
    fromLocation: '',
    toLocation: '',
    notes: ''
  });

  const [selectedMovement, setSelectedMovement] = useState<ItemMovement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movRes, eqRes] = await Promise.all([
        api('/api/item-movements'),
        api('/api/inventory')
      ]);
      if (movRes.ok) setMovements(await movRes.json());
      if (eqRes.ok) setEquipment(await eqRes.json());
    } catch (e) { console.error(e); }
  };

  // Group movements by inventory ID and get only the latest movement per item
  const latestMovementsByItem = React.useMemo(() => {
    const grouped = movements.reduce((groups, movement) => {
      const key = movement.inventoryId;
      if (!groups[key]) {
        groups[key] = movement;
      } else {
        // Keep the latest movement (by date, then by createdAt)
        const existing = groups[key];
        const existingDate = new Date(existing.movementDate);
        const newDate = new Date(movement.movementDate);
        if (newDate > existingDate || 
            (newDate.getTime() === existingDate.getTime() && 
             new Date(movement.createdAt || 0) > new Date(existing.createdAt || 0))) {
          groups[key] = movement;
        }
      }
      return groups;
    }, {} as Record<string, ItemMovement>);
    return Object.values(grouped);
  }, [movements]);

  const filteredMovements = latestMovementsByItem.filter(m => {
    const matchesSearch = (m.inventoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.fromPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.toPerson?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || m.movementType === filterType;
    const matchesInventory = filterInventory === 'All' || m.inventoryId === filterInventory;
    return matchesSearch && matchesType && matchesInventory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inventoryId || !formData.movementDate || !formData.toPerson || !formData.movedBy) {
      showToast("Mohon lengkapi data perpindahan.", "error");
      return;
    }

    const selectedEquipment = equipment.find(item => item.id === formData.inventoryId);
    const currentLocation = selectedEquipment?.location || formData.fromLocation;

    try {
      const res = await api('/api/item-movements', {
        method: 'POST',
        data: {
          inventoryId: formData.inventoryId,
          movementDate: formData.movementDate,
          movementType: formData.movementType,
          fromPerson: formData.fromPerson,
          toPerson: formData.toPerson,
          movedBy: formData.movedBy,
          quantity: formData.quantity,
          fromLocation: currentLocation,
          toLocation: formData.toLocation,
          notes: formData.notes
        }
      });
      
      if (res.ok) {
        if (formData.toLocation) {
          await api(`/api/inventory/${formData.inventoryId}`, {
            method: 'PUT',
            data: { location: formData.toLocation }
          });
        }
        fetchData();
        showToast("Perpindahan barang berhasil dicatat.", "success");
        setIsModalOpen(false);
        resetForm();
      }
    } catch (e) { showToast("Gagal menyimpan data", "error"); }
  };

  const resetForm = () => {
    setFormData({
      inventoryId: '',
      movementDate: new Date().toISOString().split('T')[0],
      movementType: 'Manual',
      fromPerson: '',
      toPerson: '',
      movedBy: '',
      quantity: 1,
      fromLocation: '',
      toLocation: '',
      notes: ''
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Peminjaman': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Manual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUndo = async (id: string) => {
    if (!confirm("Batalkan perpindahan ini? Lokasi barang akan dikembalikan ke posisi sebelumnya.")) return;

    try {
      const res = await api(`/api/item-movements/${id}/undo`, { method: 'POST' });
      if (res.ok) {
        showToast("Perpindahan berhasil dibatalkan.", "success");
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal membatalkan perpindahan", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan server", "error");
    }
  };

  const getEquipmentName = (id: string) => {
    const item = equipment.find(e => e.id === id);
    return item ? item.name : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perpindahan Barang</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Tracking perpindahan dan lokasi inventaris</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium shadow-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" /> Input Manual
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari barang atau orang..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm w-full dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Semua Jenis</option>
              <option value="Peminjaman">Peminjaman</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-gray-400" />
            <select 
              value={filterInventory}
              onChange={(e) => setFilterInventory(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 max-w-[200px]"
            >
              <option value="All">Semua Barang</option>
              {equipment.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Lokasi Sebelum</th>
                <th className="px-6 py-4">Lokasi Sekarang</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMovements.length > 0 ? filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{movement.inventoryName || getEquipmentName(movement.inventoryId)}</div>
                    <div className="text-xs text-gray-500">{movement.movementDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(movement.movementType)}`}>
                      {movement.movementType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {movement.fromLocation || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {movement.toLocation || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {movement.movementType === 'Manual' && (
                        <button 
                          onClick={() => handleUndo(movement.id)}
                          className="text-orange-600 hover:text-orange-800 text-xs font-medium flex items-center"
                          title="Batalkan Perpindahan Terakhir"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" /> Undo
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedMovement(movement)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Detail
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <ArrowRightLeft className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Tidak ada data perpindahan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" />
                Input Perpindahan Manual
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Barang</label>
                <select 
                  required
                  value={formData.inventoryId}
                  onChange={(e) => {
                    const item = equipment.find(eq => eq.id === e.target.value);
                    setFormData({
                      ...formData, 
                      inventoryId: e.target.value,
                      fromLocation: item?.location || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Barang --</option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Lokasi: {item.location || 'Belum ada'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                  <input 
                    type="date" required
                    value={formData.movementDate}
                    onChange={(e) => setFormData({...formData, movementDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
                  <input 
                    type="number" min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dari Siapa</label>
                  <input 
                    type="text"
                    value={formData.fromPerson}
                    onChange={(e) => setFormData({...formData, fromPerson: e.target.value})}
                    placeholder="Contoh: Laboran, Gudang"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kepada Siapa</label>
                  <input 
                    type="text" required
                    value={formData.toPerson}
                    onChange={(e) => setFormData({...formData, toPerson: e.target.value})}
                    placeholder="Nama Penerima"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Asal</label>
                  <input 
                    type="text"
                    value={formData.fromLocation || equipment.find(e => e.id === formData.inventoryId)?.location || ''}
                    onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                    placeholder="Rak/Gudang"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Tujuan</label>
                  <input 
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                    placeholder="Rak/Ruang Baru"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Petugas / Staff</label>
                <input 
                  type="text" required
                  value={formData.movedBy}
                  onChange={(e) => setFormData({...formData, movedBy: e.target.value})}
                  placeholder="Nama Petugas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Catatan tambahan..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center">
                  <Save className="w-4 h-4 mr-2" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Detail Perpindahan
              </h3>
              <button onClick={() => setSelectedMovement(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedMovement.inventoryName || getEquipmentName(selectedMovement.inventoryId)}</h2>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${getTypeColor(selectedMovement.movementType)}`}>
                  {selectedMovement.movementType}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Tanggal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.movementDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Jumlah</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.quantity} unit</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Dari</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.fromPerson || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Kepada</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.toPerson || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Lokasi Sebelum</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.fromLocation || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Lokasi Sekarang</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.toLocation || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Petugas</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.movedBy || '-'}</span>
                </div>
                {selectedMovement.notes && (
                  <div className="pt-2">
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Keterangan</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedMovement.notes}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={() => setSelectedMovement(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMovements;
