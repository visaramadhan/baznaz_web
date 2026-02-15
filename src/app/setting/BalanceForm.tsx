'use client';

import { useRef, useState } from 'react';
import { updateInitialBalance } from './actions';

export default function BalanceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [saldoDisplay, setSaldoDisplay] = useState('');
  const [saldoValue, setSaldoValue] = useState(0);
  function onSaldoChange(v: string) {
    const digits = v.replace(/\D/g, '');
    const num = digits ? Number(digits) : 0;
    setSaldoValue(num);
    setSaldoDisplay(digits ? `Rp. ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '');
  }

  async function clientAction(formData: FormData) {
    const result = await updateInitialBalance(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Saldo Awal berhasil diupdate');
    } else {
      alert('Gagal update saldo: ' + result.error);
    }
  }

  return (
    <form ref={formRef} action={clientAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Saldo Awal Tunai (Kas)</label>
        <input 
          type="text" 
          name="saldo_tunai_display" 
          placeholder="Rp. 0" 
          value={saldoDisplay}
          onChange={(e) => onSaldoChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" 
        />
        <input type="hidden" name="saldo_tunai" value={saldoValue} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Saldo Awal Bank (Coming Soon)</label>
        <input type="number" name="saldo_bank" defaultValue="0" disabled className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-100 shadow-sm" />
      </div>
      <div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Update Saldo
        </button>
      </div>
    </form>
  );
}
