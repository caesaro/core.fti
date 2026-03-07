import React, { useState, useEffect } from 'react';
import { Room, Role, RoomComputer, Software } from '../types';
import { 
  Monitor, Cpu, HardDrive, Keyboard, Mouse, Download, FileSpreadsheet,
  Plus, Edit2, Trash2, Search, ChevronRight, X, Loader2, 
  Save, Package
} from 'lucide-react';
import { api } from '../services/api';
import ExcelJS from 'exceljs';

interface ManajemenSpesifikasiProps {
  role: Role;
  isDarkMode: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const getConditionColor = (condition?: string) => {
  switch (condition) {
    case 'Baik': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'Rusak Ringan': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Rusak Berat': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const ManajemenSpesifikasi: React.FC<ManajemenSpesifikasiProps> = ({ role, isDarkMode, showToast }) => {
  const isAdmin = role.toString().toUpperCase() === Role.ADMIN.toString().toUpperCase();
  const isLaboran = role.toString().toUpperCase() === Role.LABORAN.toString().toUpperCase();
  const canManage = isAdmin || isLaboran;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'computers' | 'software'>('computers');
  const [searchTerm, setSearchTerm] = useState('');

  // Computer State
  const [roomComputers, setRoomComputers] = useState<RoomComputer[]>([]);
  const [editingComputer, setEditingComputer] = useState<Partial<RoomComputer> | null>(null);

  // Software State
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [editingSoftware, setEditingSoftware] = useState<Partial<Software> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComputers = roomComputers.filter(pc => 
    pc.pcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pc.cpu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSoftware = softwareList.filter(soft => 
    soft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soft.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soft.version?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchRooms();
    if (selectedRoom) {
      fetchRoomComputers();
      fetchSoftware();
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const res = await api('/api/rooms');
      if (res.ok) setRooms(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchRoomComputers = async () => {
    if (!selectedRoom) return;
    try {
      const res = await api(`/api/rooms/${selectedRoom.id}/computers`);
      if (res.ok) setRoomComputers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSoftware = async () => {
    if (!selectedRoom) return;
    try {
      const res = await api(`/api/software?roomId=${selectedRoom.id}`);
      if (res.ok) setSoftwareList(await res.json());
    } catch (e) { console.error(e); }
  };

  // --- COMPUTER HANDLERS ---

  const handleSaveComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComputer || !selectedRoom) return;

    setIsSaving(true);
    const payload = {
      ...editingComputer,
      id: editingComputer.id || `PC-${Date.now()}`,
      roomId: selectedRoom.id
    };

    try {
      await api('/api/computers', { method: 'POST', data: payload });
      setEditingComputer(null);
      fetchRoomComputers();
    } catch (e) { 
      alert("Gagal menyimpan data komputer"); 
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComputer = async (id: string) => {
    if (confirm("Hapus data komputer ini?")) {
      try {
        await api(`/api/computers/${id}`, { method: 'DELETE' });
        fetchRoomComputers();
      } catch (e) { alert("Gagal menghapus"); }
    }
  };

  const handleDeleteAllComputers = async () => {
    if (!selectedRoom) return;
    if (confirm(`PERINGATAN: Hapus SEMUA data komputer di ${selectedRoom.name}?`)) {
      try {
        await api(`/api/rooms/${selectedRoom.id}/computers`, { method: 'DELETE' });
        fetchRoomComputers();
      } catch (e) { alert("Gagal menghapus"); }
    }
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Komputer');
    worksheet.columns = [
      { header: 'No PC', key: 'pcNumber', width: 10 },
      { header: 'OS', key: 'os', width: 15 },
      { header: 'CPU', key: 'cpu', width: 25 },
      { header: 'Tipe GPU', key: 'gpuType', width: 25 },
      { header: 'Model GPU', key: 'gpuModel', width: 20 },
      { header: 'VRAM', key: 'vram', width: 10 },
      { header: 'RAM', key: 'ram', width: 10 },
      { header: 'Storage', key: 'storage', width: 25 },
      { header: 'Monitor', key: 'monitor', width: 20 },
      { header: 'Keyboard', key: 'keyboard', width: 20 },
      { header: 'Mouse', key: 'mouse', width: 20 },
      { header: 'Kondisi', key: 'condition', width: 15 },
    ];
    worksheet.addRow({ pcNumber: 'PC-01', os: 'Windows 11', cpu: 'Intel Core i5-12400', gpuType: 'Integrated', gpuModel: 'Intel UHD 730', vram: '-', ram: '16GB', storage: 'SSD 512GB', monitor: 'Dell 24"', keyboard: 'Logitech', mouse: 'Logitech', condition: 'Baik' });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_data_komputer.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) return alert("File Excel kosong");
        const promises: Promise<any>[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const pcNumber = row.getCell(1).text;
          if (!pcNumber) return;
          const payload = {
            id: `PC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            roomId: selectedRoom.id,
            pcNumber: pcNumber,
            os: row.getCell(2).text,
            cpu: row.getCell(3).text,
            gpuType: row.getCell(4).text || 'Integrated',
            gpuModel: row.getCell(5).text,
            vram: row.getCell(6).text,
            ram: row.getCell(7).text,
            storage: row.getCell(8).text,
            monitor: row.getCell(9).text,
            keyboard: row.getCell(10).text,
            mouse: row.getCell(11).text,
            condition: row.getCell(12).text || 'Baik',
          };
          promises.push(api('/api/computers', { method: 'POST', data: payload }));
        });
        await Promise.all(promises);
        alert("Berhasil import komputer");
        fetchRoomComputers();
      } catch (error) { 
        console.error(error);
        alert("Gagal process Excel"); 
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportComputers = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Komputer ${selectedRoom?.name}`);

    worksheet.columns = [
      { header: 'No PC', key: 'pcNumber', width: 10 },
      { header: 'OS', key: 'os', width: 20 },
      { header: 'CPU', key: 'cpu', width: 30 },
      { header: 'Tipe GPU', key: 'gpuType', width: 15 },
      { header: 'Model GPU', key: 'gpuModel', width: 25 },
      { header: 'VRAM', key: 'vram', width: 10 },
      { header: 'RAM', key: 'ram', width: 15 },
      { header: 'Storage', key: 'storage', width: 25 },
      { header: 'Monitor', key: 'monitor', width: 20 },
      { header: 'Keyboard', key: 'keyboard', width: 20 },
      { header: 'Mouse', key: 'mouse', width: 20 },
      { header: 'Kondisi', key: 'condition', width: 15 },
    ];

    filteredComputers.forEach(pc => worksheet.addRow(pc));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spek_komputer_${selectedRoom?.name.replace(/\s/g, '_')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Data komputer berhasil diexport!", "success");
  };

  const handleExportSoftware = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Software ${selectedRoom?.name}`);

    worksheet.columns = [
      { header: 'Nama Software', key: 'name', width: 30 },
      { header: 'Versi', key: 'version', width: 15 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Tipe Lisensi', key: 'licenseType', width: 15 },
      { header: 'Vendor', key: 'vendor', width: 20 },
      { header: 'Tanggal Install', key: 'installDate', width: 15 },
      { header: 'Catatan', key: 'notes', width: 30 },
    ];

    filteredSoftware.forEach(soft => worksheet.addRow(soft));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `software_${selectedRoom?.name.replace(/\s/g, '_')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Data software berhasil diexport!", "success");
  };

  // --- SOFTWARE HANDLERS ---

  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSoftware) return;

    setIsSaving(true);
    const payload = {
      ...editingSoftware,
      id: editingSoftware.id,
      roomId: selectedRoom?.id
    };

    try {
      if (editingSoftware.id) {
        await api(`/api/software/${editingSoftware.id}`, { method: 'PUT', data: payload });
      } else {
        await api('/api/software', { method: 'POST', data: payload });
      }
      setEditingSoftware(null);
      fetchSoftware();
    } catch (e) { alert("Gagal menyimpan software"); } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSoftware = async (id: string) => {
    if (confirm("Hapus software ini?")) {
      try {
        await api(`/api/software/${id}`, { method: 'DELETE' });
        fetchSoftware();
      } catch (e) { alert("Gagal menghapus"); }
    }
  };

  // --- RENDER ---

  if (!selectedRoom) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Spesifikasi & Software</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pilih ruangan untuk mengelola spesifikasi komputer dan software</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari ruangan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => setSelectedRoom(room)}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600">{room.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{room.category}</p>
                </div>
                <Monitor className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-300">Kapasitas: {room.capacity}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">Tidak ada ruangan ditemukan</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedRoom(null)} 
            className="text-sm text-blue-500 hover:underline"
          >
            &larr; Pilih Ruangan
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedRoom.name}
          </h2>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={handleDownloadTemplate} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" /> Template
            </button>
            <button onClick={activeTab === 'computers' ? handleExportComputers : handleExportSoftware} className="px-3 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
            </button>
            <label className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Import
              <input type="file" accept=".xlsx" className="hidden" onChange={handleExcelUpload} />
            </label>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('computers')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'computers' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Monitor className="w-4 h-4 inline mr-2" />
          Spesifikasi Komputer
        </button>
        <button
          onClick={() => setActiveTab('software')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'software' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Software
        </button>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={activeTab === 'computers' ? "Cari komputer..." : "Cari software..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white"
          />
        </div>
        {canManage && activeTab === 'computers' && (
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteAllComputers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Reset Semua
            </button>
            <button 
              onClick={() => setEditingComputer({ pcNumber: '', cpu: '', gpuType: 'Integrated', gpuModel: '', vram: '', ram: '', storage: '', os: '', keyboard: '', mouse: '', monitor: '', condition: 'Baik' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Komputer
            </button>
          </div>
        )}
        {canManage && activeTab === 'software' && (
          <button 
            onClick={() => setEditingSoftware({ name: '', version: '', licenseType: 'Free', category: '' })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Software
          </button>
        )}
      </div>

      {/* COMPUTERS TABLE */}
      {activeTab === 'computers' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">No. PC</th>
                  <th className="px-4 py-3">CPU</th>
                  <th className="px-4 py-3">GPU</th>
                  <th className="px-4 py-3">RAM/Storage</th>
                  <th className="px-4 py-3">Kondisi</th>
                  <th className="px-4 py-3">OS</th>
                  {canManage && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComputers.map(pc => (
                  <tr key={pc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-bold">{pc.pcNumber}</td>
                    <td className="px-4 py-3">{pc.cpu}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{pc.gpuModel}</div>
                      <div className="text-[10px] text-gray-500">{pc.gpuType} ({pc.vram})</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{pc.ram}</div>
                      <div className="text-xs text-gray-500">{pc.storage}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(pc.condition)}`}>{pc.condition}</span>
                    </td>
                    <td className="px-4 py-3">{pc.os}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditingComputer(pc)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteComputer(pc.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredComputers.length === 0 && (
                  <tr><td colSpan={canManage ? 7 : 6} className="text-center py-8 text-gray-500">Belum ada data komputer</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SOFTWARE TABLE */}
      {activeTab === 'software' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Nama Software</th>
                  <th className="px-4 py-3">Versi</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Lisensi</th>
                  <th className="px-4 py-3">Vendor</th>
                  {canManage && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSoftware.map(soft => (
                  <tr key={soft.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium">{soft.name}</td>
                    <td className="px-4 py-3">{soft.version}</td>
                    <td className="px-4 py-3">{soft.category || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        soft.licenseType === 'Commercial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        soft.licenseType === 'Open Source' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {soft.licenseType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{soft.vendor || '-'}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditingSoftware(soft)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteSoftware(soft.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredSoftware.length === 0 && (
                  <tr><td colSpan={canManage ? 6 : 5} className="text-center py-8 text-gray-500">Belum ada data software</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPUTER MODAL */}
      {editingComputer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {editingComputer.id ? 'Edit Komputer' : 'Tambah Komputer'}
              </h3>
              <button onClick={() => setEditingComputer(null)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleSaveComputer} className="p-6 grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nomor PC</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">#</span>
                  <input type="text" required value={editingComputer.pcNumber || ''} onChange={e => setEditingComputer({...editingComputer, pcNumber: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="PC-01"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">OS</label>
                <input type="text" value={editingComputer.os || ''} onChange={e => setEditingComputer({...editingComputer, os: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Windows 11 Pro"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">CPU</label>
                <div className="relative">
                  <Cpu className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={editingComputer.cpu || ''} onChange={e => setEditingComputer({...editingComputer, cpu: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Intel Core i7-12700"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipe GPU</label>
                <select value={editingComputer.gpuType || 'Integrated'} onChange={e => setEditingComputer({...editingComputer, gpuType: e.target.value as any})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="Integrated">Integrated</option>
                  <option value="Dedicated">Dedicated (Card)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Model GPU</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] border border-gray-400 rounded-sm px-0.5">G</span>
                  <input type="text" value={editingComputer.gpuModel || ''} onChange={e => setEditingComputer({...editingComputer, gpuModel: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="NVIDIA RTX 3060"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">VRAM</label>
                <input type="text" value={editingComputer.vram || ''} onChange={e => setEditingComputer({...editingComputer, vram: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="12 GB"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">RAM</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] border border-gray-400 rounded-sm px-0.5">R</span>
                  <input type="text" value={editingComputer.ram || ''} onChange={e => setEditingComputer({...editingComputer, ram: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="16 GB DDR4"/>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Storage</label>
                <div className="relative">
                  <HardDrive className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={editingComputer.storage || ''} onChange={e => setEditingComputer({...editingComputer, storage: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="SSD NVMe 512GB"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monitor</label>
                <div className="relative">
                  <Monitor className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={editingComputer.monitor || ''} onChange={e => setEditingComputer({...editingComputer, monitor: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Dell 24 inch"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Keyboard</label>
                <div className="relative">
                  <Keyboard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={editingComputer.keyboard || ''} onChange={e => setEditingComputer({...editingComputer, keyboard: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mouse</label>
                <div className="relative">
                  <Mouse className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={editingComputer.mouse || ''} onChange={e => setEditingComputer({...editingComputer, mouse: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Kondisi</label>
                <select value={editingComputer.condition || 'Baik'} onChange={e => setEditingComputer({...editingComputer, condition: e.target.value as any})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setEditingComputer(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFTWARE MODAL */}
      {editingSoftware && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {editingSoftware.id ? 'Edit Software' : 'Tambah Software'}
              </h3>
              <button onClick={() => setEditingSoftware(null)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleSaveSoftware} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nama Software</label>
                <input type="text" required value={editingSoftware.name || ''} onChange={e => setEditingSoftware({...editingSoftware, name: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Microsoft Office"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Versi</label>
                  <input type="text" value={editingSoftware.version || ''} onChange={e => setEditingSoftware({...editingSoftware, version: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="2021"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                  <select value={editingSoftware.category || ''} onChange={e => setEditingSoftware({...editingSoftware, category: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">-- Pilih --</option>
                    <option value="Operating System">Operating System</option>
                    <option value="Office">Office</option>
                    <option value="Development Tool">Development Tool</option>
                    <option value="Antivirus">Antivirus</option>
                    <option value="Design">Design</option>
                    <option value="Multimedia">Multimedia</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipe Lisensi</label>
                <select value={editingSoftware.licenseType || 'Free'} onChange={e => setEditingSoftware({...editingSoftware, licenseType: e.target.value as any})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="Free">Free</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
                  <input type="text" value={editingSoftware.vendor || ''} onChange={e => setEditingSoftware({...editingSoftware, vendor: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Microsoft"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Install</label>
                  <input type="date" value={editingSoftware.installDate || ''} onChange={e => setEditingSoftware({...editingSoftware, installDate: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Catatan</label>
                <textarea value={editingSoftware.notes || ''} onChange={e => setEditingSoftware({...editingSoftware, notes: e.target.value})} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} placeholder="Catatan opsional..."/>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setEditingSoftware(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenSpesifikasi;
