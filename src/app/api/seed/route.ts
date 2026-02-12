import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { FundSource } from '@/models/FundSource';
import { User } from '@/models/User';

export async function GET() {
  await dbConnect();

  try {
    // Seed Estimations (COA) - Updated per "Perbaikan Sistem" request
    const coaData = [
      // Level 1
      { nomor_akun: '100', nama: 'Aktiva', level: 1, saldo_normal: 'debet' },
      { nomor_akun: '200', nama: 'Kewajiban', level: 1, saldo_normal: 'kredit' }, // Was Hutang
      { nomor_akun: '300', nama: 'Dana Program', level: 1, saldo_normal: 'kredit' }, // Was Saldo Dana
      { nomor_akun: '400', nama: 'Pendapatan', level: 1, saldo_normal: 'kredit' },
      { nomor_akun: '500', nama: 'Biaya', level: 1, saldo_normal: 'debet' }, // New/Renamed

      // Level 2
      { nomor_akun: '110', nama: 'Aktiva Lancar', level: 2, saldo_normal: 'debet', induk_akun: '100' }, // Was Lancar
      { nomor_akun: '120', nama: 'Aktiva Tetap', level: 2, saldo_normal: 'debet', induk_akun: '100' }, // Was Tetap
      { nomor_akun: '210', nama: 'Kewajiban Lancar', level: 2, saldo_normal: 'kredit', induk_akun: '200' }, // Was Jangka Pendek
      { nomor_akun: '220', nama: 'Kewajiban Tetap', level: 2, saldo_normal: 'kredit', induk_akun: '200' }, // Was Jangka Panjang
      { nomor_akun: '310', nama: 'Dana Program', level: 2, saldo_normal: 'kredit', induk_akun: '300' }, // Was Saldo Dana
      
      // Pendapatan Categories (Level 2)
      { nomor_akun: '410', nama: 'Pendapatan Penyaluran', level: 2, saldo_normal: 'kredit', induk_akun: '400' },
      { nomor_akun: '420', nama: 'Penerimaan Zakat', level: 2, saldo_normal: 'kredit', induk_akun: '400' },
      { nomor_akun: '430', nama: 'Penerimaan Infak/Sedekah', level: 2, saldo_normal: 'kredit', induk_akun: '400' },
      { nomor_akun: '440', nama: 'Penerimaan Amil', level: 2, saldo_normal: 'kredit', induk_akun: '400' },
      { nomor_akun: '450', nama: 'Penerimaan Non-Halal', level: 2, saldo_normal: 'kredit', induk_akun: '400' },

      // Biaya/Penyaluran Categories (Level 2)
      { nomor_akun: '510', nama: 'Penyaluran Zakat', level: 2, saldo_normal: 'debet', induk_akun: '500' },
      { nomor_akun: '520', nama: 'Penyaluran Infak/Sedekah', level: 2, saldo_normal: 'debet', induk_akun: '500' },
      { nomor_akun: '530', nama: 'Beban Operasional (Amil)', level: 2, saldo_normal: 'debet', induk_akun: '500' },
      { nomor_akun: '540', nama: 'Penyaluran Non-Halal', level: 2, saldo_normal: 'debet', induk_akun: '500' },

      // Level 3
      { nomor_akun: '111', nama: 'Kas', level: 3, saldo_normal: 'debet', induk_akun: '110' },
      { nomor_akun: '112', nama: 'Bank', level: 3, saldo_normal: 'debet', induk_akun: '110' }, // New
      { nomor_akun: '113', nama: 'Piutang Mitra', level: 3, saldo_normal: 'debet', induk_akun: '110' },
      { nomor_akun: '121', nama: 'Peralatan Kantor', level: 3, saldo_normal: 'debet', induk_akun: '120' }, // New
      { nomor_akun: '211', nama: 'Kewajiban Lancar', level: 3, saldo_normal: 'kredit', induk_akun: '210' }, // New/Renamed
      { nomor_akun: '311', nama: 'Dana Program', level: 3, saldo_normal: 'kredit', induk_akun: '310' }, // Renamed
      
      // Pendapatan Details (Level 3)
      { nomor_akun: '411', nama: 'Pendapatan Margin', level: 3, saldo_normal: 'kredit', induk_akun: '410' },
      { nomor_akun: '421', nama: 'Penerimaan Zakat Maal', level: 3, saldo_normal: 'kredit', induk_akun: '420' },
      { nomor_akun: '422', nama: 'Penerimaan Zakat Fitrah', level: 3, saldo_normal: 'kredit', induk_akun: '420' },
      { nomor_akun: '431', nama: 'Penerimaan Infak Terikat', level: 3, saldo_normal: 'kredit', induk_akun: '430' },
      { nomor_akun: '432', nama: 'Penerimaan Infak Tidak Terikat', level: 3, saldo_normal: 'kredit', induk_akun: '430' },
      { nomor_akun: '441', nama: 'Bagian Amil dari Zakat', level: 3, saldo_normal: 'kredit', induk_akun: '440' },
      { nomor_akun: '442', nama: 'Bagian Amil dari Infak', level: 3, saldo_normal: 'kredit', induk_akun: '440' },
      { nomor_akun: '451', nama: 'Bunga Bank (Non-Halal)', level: 3, saldo_normal: 'kredit', induk_akun: '450' },

      // Penyaluran/Biaya Details (Level 3)
      { nomor_akun: '511', nama: 'Penyaluran Fakir Miskin', level: 3, saldo_normal: 'debet', induk_akun: '510' },
      { nomor_akun: '512', nama: 'Penyaluran Fisabilillah', level: 3, saldo_normal: 'debet', induk_akun: '510' },
      { nomor_akun: '513', nama: 'Penyaluran Ibnu Sabil', level: 3, saldo_normal: 'debet', induk_akun: '510' },
      { nomor_akun: '521', nama: 'Penyaluran Infak Sosial', level: 3, saldo_normal: 'debet', induk_akun: '520' },
      { nomor_akun: '531', nama: 'Gaji & Tunjangan Karyawan', level: 3, saldo_normal: 'debet', induk_akun: '530' },
      { nomor_akun: '532', nama: 'Biaya Operasional Kantor', level: 3, saldo_normal: 'debet', induk_akun: '530' },
      { nomor_akun: '541', nama: 'Penyaluran Dana Non-Halal', level: 3, saldo_normal: 'debet', induk_akun: '540' },
    ];

    // Delete deprecated accounts if needed (optional, or manual cleanup)
    // For now, we just upsert the new structure.
    
    for (const coa of coaData) {
      // Use findOneAndUpdate with upsert to avoid duplicates but update if exists
      await Estimation.findOneAndUpdate({ nomor_akun: coa.nomor_akun }, coa, { upsert: true, new: true });
    }

    // Seed Fund Sources
    const funds = [
      { name: 'Baznas Pusat', description: 'Dana dari Baznas Pusat' },
      { name: 'Dana Bergulir', description: 'Dana hasil pengembalian' },
    ];

    for (const fund of funds) {
      await FundSource.findOneAndUpdate({ name: fund.name }, fund, { upsert: true, new: true });
    }

    // Seed Admin User
    // Note: Password should be hashed in production. Here it's plain text for prototype simplicity.
    await User.findOneAndUpdate(
      { email: 'admin@baznas.id' },
      { name: 'Admin Baznas', email: 'admin@baznas.id', role: 'admin', password: 'password123' }, 
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Seeding completed successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 });
  }
}
