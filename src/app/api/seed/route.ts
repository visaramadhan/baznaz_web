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
      { nomor_akun: '410', nama: 'Penerimaan Lain - Lain', level: 2, saldo_normal: 'kredit', induk_akun: '400' }, // Was Penerimaan
      { nomor_akun: '510', nama: 'Biaya', level: 2, saldo_normal: 'debet', induk_akun: '500' }, // Was Penyaluran

      // Level 3
      { nomor_akun: '111', nama: 'Kas', level: 3, saldo_normal: 'debet', induk_akun: '110' },
      { nomor_akun: '112', nama: 'Bank', level: 3, saldo_normal: 'debet', induk_akun: '110' }, // New
      { nomor_akun: '113', nama: 'Piutang Mitra', level: 3, saldo_normal: 'debet', induk_akun: '110' },
      { nomor_akun: '121', nama: 'Peralatan Kantor', level: 3, saldo_normal: 'debet', induk_akun: '120' }, // New
      { nomor_akun: '211', nama: 'Kewajiban Lancar', level: 3, saldo_normal: 'kredit', induk_akun: '210' }, // New/Renamed
      { nomor_akun: '311', nama: 'Dana Program', level: 3, saldo_normal: 'kredit', induk_akun: '310' }, // Renamed
      { nomor_akun: '411', nama: 'Penerimaan Lain - Lain', level: 3, saldo_normal: 'kredit', induk_akun: '410' }, // Renamed
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
