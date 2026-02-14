'use client';

import { useRef, useState, useEffect } from 'react';
import { createEstimation, updateEstimation } from './actions';
import { X } from 'lucide-react';

interface PerkiraanFormProps {
  isOpen: boolean;
  onClose: () => void;
  estimations: any[];
  initialData?: any; // If provided, it's edit mode
}

export default function PerkiraanForm({ isOpen, onClose, estimations, initialData }: PerkiraanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');
  const [selectedL3, setSelectedL3] = useState('');
  
  // Initialize form state when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
        // Use direct references if available, otherwise try to deduce (backward compatibility)
        const ref1 = initialData.ref_level_1 ? (typeof initialData.ref_level_1 === 'object' ? initialData.ref_level_1._id : initialData.ref_level_1) : '';
        const ref2 = initialData.ref_level_2 ? (typeof initialData.ref_level_2 === 'object' ? initialData.ref_level_2._id : initialData.ref_level_2) : '';
        const ref3 = initialData.ref_level_3 ? (typeof initialData.ref_level_3 === 'object' ? initialData.ref_level_3._id : initialData.ref_level_3) : '';
        
        setSelectedL1(ref1);
        setSelectedL2(ref2);
        setSelectedL3(ref3);
        
        // If refs are missing but induk_akun exists (old data), try to map?
        // For now, let's assume we want fresh independent selection or data is migrated.
        // If data is old, these might be empty, user can re-select.
    } else {
        setSelectedL1('');
        setSelectedL2('');
        setSelectedL3('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Filter accounts for dropdowns - Independent now!
  const level1Accounts = estimations.filter((e: any) => e.level === 1);
  const level2Accounts = estimations.filter((e: any) => e.level === 2);
  const level3Accounts = estimations.filter((e: any) => e.level === 3);

  async function clientAction(formData: FormData) {
    formData.set('level', '4');
    
    // Save independent references
    if (selectedL1) formData.set('ref_level_1', selectedL1);
    if (selectedL2) formData.set('ref_level_2', selectedL2);
    if (selectedL3) formData.set('ref_level_3', selectedL3);
    
    // For compatibility, set induk_akun to L3 if available, or L2, or L1
    // But since they are independent, maybe we don't force a tree structure anymore.
    // However, existing code might rely on induk_akun.
    // Let's set it to the lowest level selected.
    if (selectedL3) formData.set('induk_akun', selectedL3);
    else if (selectedL2) formData.set('induk_akun', selectedL2);
    else if (selectedL1) formData.set('induk_akun', selectedL1);

    let result;
    if (initialData) {
        // We need to pass the ID for update
        result = await updateEstimation(initialData._id, formData);
    } else {
        result = await createEstimation(formData);
    }

    if (result.success) {
      formRef.current?.reset();
      // Reset hierarchy state
      setSelectedL1('');
      setSelectedL2('');
      setSelectedL3('');
      
      alert(initialData ? 'Perkiraan berhasil diperbarui' : 'Perkiraan berhasil ditambahkan');
      onClose();
    } else {
      alert('Gagal menyimpan perkiraan: ' + result.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Perkiraan' : 'Input Perkiraan'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level 1 (Induk)</label>
                <select 
                    value={selectedL1}
                    onChange={(e) => setSelectedL1(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                >
                    <option value="">-- Pilih Level 1 --</option>
                    {level1Accounts.map((acc: any) => (
                        <option key={acc._id} value={acc._id}>{acc.nomor_akun} - {acc.nama}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level 2 (Induk)</label>
                <select 
                    value={selectedL2}
                    onChange={(e) => setSelectedL2(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                >
                    <option value="">-- Pilih Level 2 --</option>
                    {level2Accounts.map((acc: any) => (
                        <option key={acc._id} value={acc._id}>{acc.nomor_akun} - {acc.nama}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level 3 (Sub)</label>
                <select 
                    value={selectedL3}
                    onChange={(e) => setSelectedL3(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                >
                    <option value="">-- Pilih Level 3 --</option>
                    {level3Accounts.map((acc: any) => (
                        <option key={acc._id} value={acc._id}>{acc.nomor_akun} - {acc.nama}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">No. Perkiraan</label>
            <input 
                type="text" 
                name="nomor_akun" 
                defaultValue={initialData?.nomor_akun}
                required 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Perkiraan</label>
            <input 
                type="text" 
                name="nama" 
                defaultValue={initialData?.nama}
                required 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                autoFocus 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Saldo Normal</label>
            <select 
                name="saldo_normal" 
                defaultValue={initialData?.saldo_normal || 'debet'}
                required 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="debet">Debet</option>
              <option value="kredit">Kredit</option>
            </select>
          </div>

          <div className="md:col-span-2">
             <h3 className="block text-sm font-medium text-gray-700 mb-2">Saldo Awal</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">Debet</label>
                    <input 
                        type="number" 
                        name="debet" 
                        defaultValue={initialData?.debet || 0}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">Kredit</label>
                    <input 
                        type="number" 
                        name="kredit" 
                        defaultValue={initialData?.kredit || 0}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" 
                    />
                 </div>
             </div>
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
            >
              Simpan Perkiraan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
