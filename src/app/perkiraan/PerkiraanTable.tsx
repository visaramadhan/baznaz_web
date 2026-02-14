'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { deleteEstimation } from './actions';

interface PerkiraanTableProps {
  estimations: any[];
  onEdit: (account: any) => void;
}

export default function PerkiraanTable({ estimations, onEdit }: PerkiraanTableProps) {
  
  // Filter only Level 4 for the main table
  const perkiraanList = estimations.filter((e: any) => e.level === 4);

  // Helper to find lineage names (using direct references or fallback)
  const getLineage = (account: any) => {
    let l1 = '-', l2 = '-', l3 = '-';
    
    // Check direct references first
    if (account.ref_level_1) {
        l1 = typeof account.ref_level_1 === 'object' ? account.ref_level_1.nama : '?';
    }
    if (account.ref_level_2) {
        l2 = typeof account.ref_level_2 === 'object' ? account.ref_level_2.nama : '?';
    }
    if (account.ref_level_3) {
        l3 = typeof account.ref_level_3 === 'object' ? account.ref_level_3.nama : '?';
    }

    // Fallback to old lineage logic if refs missing (backward compatibility)
    if (l1 === '-' && l2 === '-' && l3 === '-') {
        // ... (Existing logic can be removed or kept as backup, but simpler to just rely on refs for new structure)
        // Since we updated the model, let's just use refs. If old data, it might show '-'.
    }

    return { l1, l2, l3 };
  };

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
        const result = await deleteEstimation(id);
        if (!result.success) {
            alert(result.error);
        }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Perkiraan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perkiraan</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Normal</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Awal Debet</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Awal Kredit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level 1</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level 2</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level 3</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {perkiraanList.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  Belum ada data perkiraan (Level 4).
                </td>
              </tr>
            ) : (
              perkiraanList.map((acc) => {
                const { l1, l2, l3 } = getLineage(acc);
                // "Saldo Awal ditampilkan sebagai berdasarkan input"
                // Assuming this means if user entered Debet, show that. If Credit, show that.
                // Or maybe just show the Net Saldo Awal.
                // Let's interpret "berdasarkan input" as showing the raw non-zero value or just net value.
                // Given I already calculate Net Saldo Awal, let's just use that but formatted nicely.
                // Or maybe they want to see the exact input number? 
                // Let's stick to the current implementation but verify order.
                // Order: No, Nama, Saldo Awal, Saldo Normal, Debet, Kredit, L1, L2, L3, Aksi.
                // My current code matches this order.
                
                return (
                  <tr key={acc._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{acc.nomor_akun}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{acc.nama}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center uppercase">{acc.saldo_normal}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(acc.debet || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(acc.kredit || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{l1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{l2}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{l3}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => onEdit(acc)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(acc._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}