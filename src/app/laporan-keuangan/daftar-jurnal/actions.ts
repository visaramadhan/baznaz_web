'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';

export async function getJournalList(startDate: string, endDate: string) {
  await dbConnect();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const journals = await Journal.find({
    tanggal: { $gte: start, $lte: end }
  })
    .populate('debit_account_id', 'nama nomor_akun')
    .populate('credit_account_id', 'nama nomor_akun')
    .sort({ tanggal: 1, nomor_transaksi: 1 });

  // Flatten each journal into two rows: one for debit side and one for credit side
  const rows: any[] = [];
  for (const j of journals) {
    rows.push({
      _id: `${j._id}-D`,
      nomor_transaksi: j.nomor_transaksi,
      tanggal: j.tanggal,
      nomor_akun: (j as any).debit_account_id?.nomor_akun || '-',
      nama_akun: (j as any).debit_account_id?.nama || '-',
      referensi: j.reference || '-',
      debit: j.amount,
      kredit: 0,
      keterangan: j.description || '-'
    });
    rows.push({
      _id: `${j._id}-K`,
      nomor_transaksi: j.nomor_transaksi,
      tanggal: j.tanggal,
      nomor_akun: (j as any).credit_account_id?.nomor_akun || '-',
      nama_akun: (j as any).credit_account_id?.nama || '-',
      referensi: j.reference || '-',
      debit: 0,
      kredit: j.amount,
      keterangan: j.description || '-'
    });
  }

  return JSON.parse(JSON.stringify(rows));
}

