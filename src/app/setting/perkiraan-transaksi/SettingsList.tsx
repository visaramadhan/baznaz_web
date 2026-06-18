'use client';

import SettingItem from './SettingItem';

interface SettingsListProps {
  accounts: any[];
  settings: any[];
}

export default function SettingsList({ accounts, settings }: SettingsListProps) {
  const getSetting = (type: string) => settings.find(s => s.type === type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Akuntansi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur pola debet dan kredit default untuk transaksi yang digunakan sistem.
        </p>
      </div>

      <SettingItem 
        title="Penyaluran Dana Baznas RI" 
        type="penyaluran_baznas"
        accounts={accounts}
        currentSetting={getSetting('penyaluran_baznas')}
      />
      
      <SettingItem 
        title="Penyaluran Dana Bergulir" 
        type="penyaluran_bergulir"
        accounts={accounts}
        currentSetting={getSetting('penyaluran_bergulir')}
      />
      
      <SettingItem 
        title="Pembayaran Tunai" 
        type="pembayaran_tunai"
        accounts={accounts}
        currentSetting={getSetting('pembayaran_tunai')}
      />
      
      <SettingItem 
        title="Pembayaran Transfer Bank" 
        type="pembayaran_transfer"
        accounts={accounts}
        currentSetting={getSetting('pembayaran_transfer')}
      />
    </div>
  );
}
