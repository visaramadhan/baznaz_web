'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { Group } from '@/models/Group';
import { FundSource } from '@/models/FundSource';
import { revalidatePath } from 'next/cache';

import { GroupMember } from '@/models/GroupMember';

export async function getGroups() {
  await dbConnect();
  const groups = await Group.find({}, 'nama _id');
  return JSON.parse(JSON.stringify(groups));
}

export async function getGroupMembers(groupId: string) {
  await dbConnect();
  const members = await GroupMember.find({ group_id: groupId });
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
    });

    // 2. Create Journal (Accounting)
    // Find Accounts
    // For Disbursement: Credit Kas (111) or Bank (112), Debit Piutang (113)
    // Based on Source?
    // User said: "Sumber dana; Baznas RI, Dana Bergulir". 
    // Usually Baznas RI funds might come from a specific account, and Dana Bergulir from another.
    // But for now, let's stick to the previous logic but handle the "Sumber Dana" logic if needed.
    // The previous code used Account 111 (Kas).
    // Let's keep using Kas (111) for now unless specified.
    
    const accountKas = await Estimation.findOne({ nomor_akun: '111' }); // Kas
    const accountPiutang = await Estimation.findOne({ nomor_akun: '113' }); // Piutang Mitra

    if (!accountKas || !accountPiutang) {
      throw new Error('Akun COA Kas (111) atau Piutang Mitra (113) tidak ditemukan.');
    }

    // Transaction: Kredit Kas (Uang keluar), Debit Piutang (Aset bertambah)
    const date = new Date();
    const yy = String(date.getFullYear() % 100).padStart(2, '0');
    const journal_no = `PP ${yy}${String(Math.floor(1000 + Math.random() * 9000))}`;
    
    await Journal.create({
      nomor_transaksi: journal_no,
      tanggal: new Date(),
      debit_account_id: accountPiutang._id,
      credit_account_id: accountKas._id,
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
