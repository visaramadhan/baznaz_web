'use client';

import { useState } from 'react';
import PerkiraanTable from './PerkiraanTable';
import PerkiraanForm from './PerkiraanForm';
import LevelForm from './LevelForm';
import LevelTable from './LevelTable';
import { Plus, ListTree, Layers, List, X } from 'lucide-react';

import { seedLevels } from './seed';

export default function PerkiraanManager({ estimations, profile }: { estimations: any[], profile: any }) {
  const [isLevelFormOpen, setIsLevelFormOpen] = useState(false);
  const [isLevelListOpen, setIsLevelListOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const handleEdit = (account: any) => {
    // Separate handling for Perkiraan (Level 4) and Master Levels (1-3)
    if (account.level === 4) {
        setEditingAccount(account);
    } else {
        setEditingAccount(account);
        setIsLevelFormOpen(true);
        // If editing from the list modal, we might want to keep it open or close it?
        // Let's keep it open, but the form will appear on top (z-index should handle this)
    }
  };

  const openNewLevel = () => {
    setEditingAccount(null);
    setIsLevelFormOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Akun (Chart of Accounts)</h1>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsLevelListOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <List className="w-4 h-4" />
              Lihat Daftar Level
            </button>
            <button 
              onClick={openNewLevel}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Layers className="w-4 h-4" />
              Tambah Sub Level
            </button>
        </div>
      </div>

      {/* Inline Perkiraan Form */}
      <section>
        <PerkiraanForm 
          isOpen={true}
          onClose={() => setEditingAccount(null)}
          estimations={estimations}
          initialData={editingAccount}
          inline
        />
      </section>

      {/* Section 1: Master Levels Table (Removed from main view) */}
      
      {/* Section 2: Perkiraan Table */}
      <section>
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Perkiraan</h3>
        </div>
        <PerkiraanTable 
          estimations={estimations} 
          onEdit={handleEdit} 
        />
      </section>

      {/* Modals */}
      {isLevelListOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Daftar Master Level</h2>
              <button onClick={() => setIsLevelListOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <LevelTable 
                estimations={estimations} 
                onEdit={handleEdit}
            />
          </div>
        </div>
      )}

      <LevelForm  
        isOpen={isLevelFormOpen} 
        onClose={() => {
            setIsLevelFormOpen(false);
            setEditingAccount(null);
        }}
        estimations={estimations}
        initialData={editingAccount} 
      />

      {/* Modal Perkiraan Form removed in favor of inline form */}
    </div>
  );
}
