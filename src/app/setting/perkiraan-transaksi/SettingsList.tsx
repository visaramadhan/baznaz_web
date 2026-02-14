'use client';

import SettingItem from './SettingItem';

interface SettingsListProps {
  accounts: any[];
  settings: any[];
}

export default function SettingsList({ accounts, settings }: SettingsListProps) {
  const getSetting = (type: string) => settings.find(s => s.type === type);

  return (
    <div>
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
