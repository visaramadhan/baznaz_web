'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
    >
      <Printer size={16} />
      <span>Cetak PDF</span>
    </button>
  );
}
