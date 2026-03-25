import React from 'react';
import { BookingStatus, Room } from '../types';
import { X, User, Shield, Phone, MapPin, Calendar, Clock, Wrench, Edit, Save, FileText, Download, Share2, AlertTriangle, Trash2, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import nocLogo from "../src/assets/noc.png";
import { formatDateID } from '../src/utils/formatters';

const BookingDetailModal = ({
  isOpen,
  selectedBooking,
  setSelectedBooking,
  rooms,
  staffList,
  isEditingTech,
  setIsEditingTech,
  editTechData,
  setEditTechData,
  handleSaveTechData,
  handleViewFile,
  handleShareImage,
  handleRejectClick,
  handleDeleteClick,
  handleApproveClick,
  processingId,
  ticketRef
}: any) => {
  if (!isOpen || !selectedBooking) return null;
  
  const getRoomName = (roomId: string) => rooms.find((r: Room) => r.id === roomId)?.name || 'Ruangan Tidak Diketahui';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Detail Peminjaman
          </h3>
          <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Kolom Kiri: Info Peminjam */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase border-b pb-2 mb-3">Informasi Peminjam</h4>
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedBooking.userName}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.userId}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Penanggung Jawab</p>
                  <p className="text-xs text-gray-500">{selectedBooking.responsiblePerson}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Kontak / WA</p>
                  <p className="text-xs text-gray-500">{selectedBooking.contactPerson}</p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Info Peminjaman */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase border-b pb-2 mb-3">Detail Kegiatan</h4>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{getRoomName(selectedBooking.roomId)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center"><Calendar className="w-4 h-4 mr-1"/> Jadwal Pemakaian</h5>
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {selectedBooking.schedules && selectedBooking.schedules.length > 0 ? (
                        selectedBooking.schedules.map((sch: any, idx: number) => (
                            <div key={idx} className="px-3 py-2 text-sm flex justify-between border-b border-gray-100 dark:border-gray-600 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <span className="text-gray-800 dark:text-gray-200">{formatDateID(sch.date)}</span>
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 ml-2">{sch.startTime?.slice(0,5)} - {sch.endTime?.slice(0,5)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">{formatDateID(selectedBooking.date)} {selectedBooking.startTime} - {selectedBooking.endTime}</div>
                    )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Keperluan:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                  {selectedBooking.purpose}
                </p>
                {selectedBooking.status === BookingStatus.REJECTED && selectedBooking.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                    <span className="font-bold block text-xs uppercase mb-1">Alasan Penolakan:</span>
                    {selectedBooking.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Technical Support Section */}
            {(selectedBooking.status === BookingStatus.APPROVED || selectedBooking.status === BookingStatus.REJECTED) && (
              <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase flex items-center">
                    <Wrench className="w-4 h-4 mr-2" /> Technical Support
                  </h4>
                  {!isEditingTech ? (
                    <button onClick={() => setIsEditingTech(true)} className="text-xs text-blue-600 hover:underline flex items-center">
                      <Edit className="w-3 h-3 mr-1" /> Edit Data Teknis
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingTech(false)} className="text-xs text-gray-500 hover:text-gray-700">Batal</button>
                      <button onClick={handleSaveTechData} className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center">
                        <Save className="w-3 h-3 mr-1" /> Simpan
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  {isEditingTech ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">PIC Laboran</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editTechData.pic.map((picId: string) => {
                            const staff = staffList.find((s: any) => s.id === picId);
                            return (
                              <span key={picId} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {staff?.name}
                                <button type="button" onClick={() => setEditTechData((prev: any) => ({ ...prev, pic: prev.pic.filter((id: string) => id !== picId) }))} className="ml-1 text-blue-600 hover:text-blue-800">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                        <select
                          value=""
                          onChange={e => { if (e.target.value) setEditTechData((prev: any) => ({ ...prev, pic: [...prev.pic, e.target.value] })) }}
                          className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">+ Tambah PIC</option>
                          {staffList.filter((s: any) => !editTechData.pic.includes(s.id)).map((staff: any) => (
                            <option key={staff.id} value={staff.id}>{staff.name} ({staff.jabatan})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kebutuhan Alat</label>
                        <textarea
                          value={editTechData.needs}
                          onChange={e => setEditTechData({ ...editTechData, needs: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          rows={3}
                          placeholder="Contoh: 2 Mic Wireless, Sound System, Kabel HDMI Panjang"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">PIC Bertugas:</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedBooking.techSupportPicName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Kebutuhan Alat:</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{selectedBooking.techSupportNeeds || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dokumen Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Surat Permohonan.pdf</p>
                <p className="text-xs text-gray-500">Dokumen PDF</p>
              </div>
            </div>
            {selectedBooking.proposalFile && (
              <button
                onClick={(e) => handleViewFile(e, selectedBooking.proposalFile!)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-blue-600 text-xs font-bold rounded border border-blue-200 dark:border-blue-700 shadow-sm hover:bg-gray-50 flex items-center"
              >
                <Download className="w-3 h-3 mr-1.5" /> Buka File
              </button>
            )}
          </div>

          {/* Hidden Ticket for Image Generation */}
          <div className="absolute -left-[9999px] top-0">
            <div ref={ticketRef} className="w-[600px] bg-white p-8 border border-gray-200 rounded-xl font-sans">
              <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <img src={nocLogo} alt="Logo" className="w-16 h-16 object-contain" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">CORE.FTI</h1>
                    <p className="text-sm text-gray-600">Fakultas Teknologi Informasi - UKSW</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">APPROVED</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{selectedBooking.purpose}</h2>
                  <p className="text-sm text-gray-600">Peminjam: {selectedBooking.userName} ({selectedBooking.userId})</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ruangan</p>
                    <p className="text-lg font-medium text-gray-900">{getRoomName(selectedBooking.roomId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Waktu</p>
                    <p className="text-lg font-medium text-gray-900">{formatDateID(selectedBooking.date)}</p>
                    <p className="text-md text-gray-700">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Penanggung Jawab</p>
                    <p className="text-md font-medium text-gray-900">{selectedBooking.responsiblePerson}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Technical Support</p>
                    <p className="text-md font-medium text-gray-900">{selectedBooking.techSupportPicName || '-'}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Catatan Kebutuhan</p>
                  <p className="text-sm text-gray-700 italic">{selectedBooking.techSupportNeeds || 'Tidak ada kebutuhan khusus.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={() => setSelectedBooking(null)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            Tutup
          </button>

          {selectedBooking.status === BookingStatus.APPROVED && (
            <>
              <button
                onClick={handleShareImage}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share Gambar
              </button>
              <button
                onClick={() => { setSelectedBooking(null); handleRejectClick(selectedBooking); }}
                className="px-4 py-2 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg flex items-center shadow-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Batalkan
              </button>
              <button
                onClick={() => { setSelectedBooking(null); handleDeleteClick(selectedBooking); }}
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded-lg flex items-center shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Data
              </button>
            </>
          )}

          {selectedBooking.status === BookingStatus.PENDING && (
            <>
              <button
                onClick={() => { setSelectedBooking(null); handleRejectClick(selectedBooking); }}
                disabled={processingId === selectedBooking.id}
                className="px-4 py-2 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg flex items-center shadow-sm transition-colors disabled:opacity-50"
              >
                {processingId === selectedBooking.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Tolak
              </button>
              <button
                onClick={() => { setSelectedBooking(null); handleApproveClick(selectedBooking); }}
                disabled={processingId === selectedBooking.id}
                className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center shadow-md transition-colors disabled:opacity-50"
              >
                {processingId === selectedBooking.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Setuju Peminjaman
              </button>
            </>
          )}

          {selectedBooking.status === BookingStatus.REJECTED && (
            <button
              onClick={() => { setSelectedBooking(null); handleDeleteClick(selectedBooking); }}
              className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded-lg flex items-center shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Data
            </button>
          )}

          {selectedBooking.status !== BookingStatus.PENDING && (
            <span className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center 
              ${selectedBooking.status === BookingStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              Status: {selectedBooking.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetailModal;