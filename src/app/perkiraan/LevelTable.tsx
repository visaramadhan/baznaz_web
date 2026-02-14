'use client';

import { Edit, Trash2 } from 'lucide-react';
import { deleteEstimation } from './actions';

interface LevelTableProps {
  estimations: any[];
  onEdit?: (level: any) => void;
}

export default function LevelTable({ estimations, onEdit }: LevelTableProps) {
  // Filter only levels 1, 2, 3
  const levels = estimations.filter((e: any) => e.level < 4).sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.nomor_akun.localeCompare(b.nomor_akun);
  });

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus level ini?')) {
        const result = await deleteEstimation(id);
        if (!result.success) {
            alert(result.error);
        }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Level</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {levels.map((level: any) => (
              <tr key={level._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    level.level === 1 ? 'bg-blue-100 text-blue-800' :
                    level.level === 2 ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Level {level.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{level.nomor_akun || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button 
                    onClick={() => onEdit && onEdit(level)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(level._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {levels.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada data level master
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
