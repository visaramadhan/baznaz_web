'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEstimation, updateEstimation } from './actions';
import { X } from 'lucide-react';

interface LevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  estimations: any[];
  initialData?: any;
}

export default function LevelForm({ isOpen, onClose, estimations, initialData }: LevelFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [levelType, setLevelType] = useState<number>(1); // 1, 2, or 3
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLevelType(initialData.level);
      } else {
        setLevelType(1);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  async function clientAction(formData: FormData) {
    // Parent logic removed as per user request
    formData.set('level', levelType.toString());
    
    // For simplicity, default to debet unless changed manually (could add selector)
    if (!formData.get('saldo_normal')) {
        formData.set('saldo_normal', initialData?.saldo_normal || 'debet');
    }

    let result;
    if (initialData) {
        result = await updateEstimation(initialData._id, formData);
    } else {
        result = await createEstimation(formData);
    }
    
    if (result.success) {
      formRef.current?.reset();
      router.refresh();
      alert(initialData ? 'Level berhasil diperbarui' : 'Level berhasil ditambahkan');
      onClose();
    } else {
      alert(`Gagal ${initialData ? 'memperbarui' : 'menambahkan'} level: ` + result.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Master Level' : 'Tambah Master Level'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Level</label>
          <div className="flex space-x-4">
             <label className="inline-flex items-center">
              <input 
                type="radio" 
                className="form-radio" 
                checked={levelType === 1} 
                onChange={() => setLevelType(1)} 
              />
              <span className="ml-2">Level 1</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                className="form-radio" 
                checked={levelType === 2} 
                onChange={() => setLevelType(2)} 
              />
              <span className="ml-2">Level 2</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                className="form-radio" 
                checked={levelType === 3} 
                onChange={() => setLevelType(3)} 
              />
              <span className="ml-2">Level 3</span>
            </label>
          </div>
        </div>

        <form ref={formRef} action={clientAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Level</label>
            <input 
              type="text" 
              name="nomor_akun" 
              defaultValue={initialData?.nomor_akun || ''} 
              placeholder={levelType === 1 ? 'Contoh: 1xx' : levelType === 2 ? 'Contoh: 21x' : 'Contoh: 113'}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Level</label>
            <input 
                name="nama" 
                defaultValue={initialData?.nama}
                required 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" 
            />
          </div>

          {/* Saldo Normal defaults to debet (can be inferred later if needed, but simplified for now) */ }
          <input type="hidden" name="saldo_normal" value={initialData?.saldo_normal || "debet"} />

          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Simpan Level
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
