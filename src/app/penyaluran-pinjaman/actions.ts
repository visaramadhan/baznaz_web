'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { Group } from '@/models/Group';
import { FundSource } from '@/models/FundSource';
import { revalidatePath } from 'next/cache';

import { GroupMember } from '@/models/GroupMember';
import { TransactionSetting } from '@/models/TransactionSetting';

export async function getGroups() {
  await dbConnect();
  const groups = await Group.find({}, 'nama _id');
  return JSON.parse(JSON.stringify(groups));
}

export async function getGroupMembers(groupId: string) {
  await dbConnect();
  const members = await GroupMember.find({ group_id: groupId }).sort({ no_anggota: 1 });
  return JSON.parse(JSON.stringify(members));
}

export async function createLoan(formData: FormData) {
  await dbConnect();
  
  const group_id = formData.get('group_id') as string;
  const sumber_dana = formData.get('sumber_dana') as string;
  const jumlah_per_anggota = parseFloat(formData.get('jumlah_per_anggota') as string);
  const jangka_waktu = parseInt(formData.get('jangka_waktu') as string);
  const nomor_transaksi = formData.get('nomor_transaksi') as string;

  try {
    // Check if Transaction Number already exists
    const existingLoan = await Loan.findOne({ nomor_transaksi });
    if (existingLoan) {
        throw new Error('Nomor Transaksi sudah digunakan');
    }

    // Get Member Count
    const memberCount = await GroupMember.countDocuments({ group_id });
    if (memberCount === 0) {
        throw new Error('Kelompok tidak memiliki anggota');
    }

    const jumlah = jumlah_per_anggota * memberCount;
    const angsuran_per_minggu = jumlah / jangka_waktu;

    const members = await GroupMember.find({ group_id });
    const allocations = members.map((m: any) => ({ member_id: m._id, amount: jumlah_per_anggota }));

    // 1. Create Loan
    const loan = await Loan.create({
      nomor_transaksi,
      group_id,
      sumber_dana,
      jumlah,
      jumlah_per_anggota,
      jangka_waktu,
      angsuran_per_minggu,
      status: 'active',
      tanggal_akad: new Date(),
      allocations,
    });

    // 2. Create Journal (Accounting) based on Transaction Setting
    const type = sumber_dana === 'Baznas RI' ? 'penyaluran_baznas' : 'penyaluran_bergulir';
    const setting = await TransactionSetting.findOne({ type })
      .populate('debit_account_id')
      .populate('credit_account_id');

    let debitAccountId: any = null;
    let creditAccountId: any = null;
    if (setting) {
      debitAccountId = (setting as any).debit_account_id?._id;
      creditAccountId = (setting as any).credit_account_id?._id;
    }
    if (!debitAccountId || !creditAccountId) {
      const fallbackDebit = await Estimation.findOne({ nomor_akun: '113' });
      const fallbackCredit = await Estimation.findOne({ nomor_akun: '311' });
      if (!fallbackDebit || !fallbackCredit) {
        throw new Error('Setting penyaluran tidak ditemukan dan akun fallback (113/311) tidak tersedia.');
      }
      debitAccountId = fallbackDebit._id;
      creditAccountId = fallbackCredit._id;
    }

    const date = new Date();
    const yy = String(date.getFullYear() % 100).padStart(2, '0');
    const journal_no = `PP ${yy}${String(Math.floor(1000 + Math.random() * 9000))}`;
    
    await Journal.create({
      nomor_transaksi: journal_no,
      tanggal: new Date(),
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      amount: jumlah,
      description: `Penyaluran Pinjaman - ${sumber_dana} - ${nomor_transaksi}`,
      reference: loan._id.toString(),
    });

    revalidatePath('/penyaluran-pinjaman');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create loan:', error);
    return { success: false, error: error.message || 'Failed to create loan' };
  }
}

export async function getLoans() {
    await dbConnect();
    const loans = await Loan.find({})
        .populate('group_id', 'nama')
        .sort({ nomor_transaksi: -1, tanggal_akad: -1 });
    return JSON.parse(JSON.stringify(loans));
}
