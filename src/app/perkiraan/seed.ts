'use server';

import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

const LEVEL_1_ITEMS = [
  'Aktiva',
  'Kewajiban',
  'Dana Program',
  'Penerimaan Lain-Lain'
];

const LEVEL_2_ITEMS = [
  'Aktiva Lancar',
  'Aktiva tetap',
  'Kewajiban Lancar',
  'Kewajiban Tetap',
  'Dana Program',
  'Penerimaan Lain – Lain',
  'Biaya'
];

const LEVEL_3_ITEMS = [
  'Kas',
  'Bank',
  'Piutang',
  'Biaya Dibayar Dimuka',
  'Kendaraan',
  'Peralatan Kantor',
  'Kewajiban Lancar',
  'Kewajiban Tetap',
  'Dana Program',
  'Penerimaan Lain – Lain',
  'Biaya'
];

export async function seedLevels() {
  await dbConnect();

  try {
    // Seed Level 1
    let l1Index = 1;
    for (const l1Name of LEVEL_1_ITEMS) {
      let l1 = await Estimation.findOne({ nama: l1Name, level: 1 });
      if (!l1) {
        await Estimation.create({
          nomor_akun: `${l1Index}`, 
          nama: l1Name,
          level: 1,
          saldo_normal: (l1Name === 'Aktiva' || l1Name === 'Biaya') ? 'debet' : 'kredit',
        });
      }
      l1Index++;
    }

    // Seed Level 2 (Independent)
    let l2Index = 1;
    for (const l2Name of LEVEL_2_ITEMS) {
      let l2 = await Estimation.findOne({ nama: l2Name, level: 2 });
      if (!l2) {
         // Determine saldo normal heuristic or default
         const isDebet = l2Name.toLowerCase().includes('aktiva') || l2Name.toLowerCase().includes('biaya');
         
         await Estimation.create({
            nomor_akun: `2.${l2Index}`, // Simple numbering
            nama: l2Name,
            level: 2,
            saldo_normal: isDebet ? 'debet' : 'kredit'
         });
      }
      l2Index++;
    }

    // Seed Level 3 (Independent)
    let l3Index = 1;
    for (const l3Name of LEVEL_3_ITEMS) {
      let l3 = await Estimation.findOne({ nama: l3Name, level: 3 });
      if (!l3) {
         const isDebet = l3Name.toLowerCase().includes('kas') || 
                         l3Name.toLowerCase().includes('bank') || 
                         l3Name.toLowerCase().includes('piutang') ||
                         l3Name.toLowerCase().includes('kendaraan') ||
                         l3Name.toLowerCase().includes('peralatan') ||
                         l3Name.toLowerCase().includes('biaya');

         await Estimation.create({
            nomor_akun: `3.${l3Index}`,
            nama: l3Name,
            level: 3,
            saldo_normal: isDebet ? 'debet' : 'kredit'
         });
      }
      l3Index++;
    }

    
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Seed failed:', error);
    return { success: false, error: error.message };
  }
}
