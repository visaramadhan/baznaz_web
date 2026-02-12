'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';

export async function getBalanceSheetData() {
  await dbConnect();

  // 1. Get all Level 3 accounts (Detail accounts)
  const accounts = await Estimation.find({ level: 3 }).sort({ nomor_akun: 1 });

  // 2. Calculate balances for each account
  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const debitResult = await Journal.aggregate([
      { $match: { debit_account_id: acc._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creditResult = await Journal.aggregate([
      { $match: { credit_account_id: acc._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDebit = debitResult[0]?.total || 0;
    const totalCredit = creditResult[0]?.total || 0;

    let balance = 0;
    if (acc.saldo_normal === 'debet') {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return {
      ...acc.toObject(),
      balance
    };
  }));

  // 3. Group accounts
  const assets = {
    current: accountBalances.filter(a => a.nomor_akun.startsWith('11')),
    fixed: accountBalances.filter(a => a.nomor_akun.startsWith('12')),
    total: 0
  };
  
  const liabilities = {
    current: accountBalances.filter(a => a.nomor_akun.startsWith('21')),
    longTerm: accountBalances.filter(a => a.nomor_akun.startsWith('22')),
    total: 0
  };

  const equity = {
    funds: accountBalances.filter(a => a.nomor_akun.startsWith('3')),
    total: 0
  };

  // 4. Calculate group totals
  assets.total = [...assets.current, ...assets.fixed].reduce((sum, acc) => sum + acc.balance, 0);
  liabilities.total = [...liabilities.current, ...liabilities.longTerm].reduce((sum, acc) => sum + acc.balance, 0);
  equity.total = equity.funds.reduce((sum, acc) => sum + acc.balance, 0);

  // Note: If Balance Sheet is not balanced, it might be due to Revenue/Expense accounts (Profit/Loss) not being closed to Equity.
  // For a simple system, we calculate Current Year Earnings (Laba/Rugi Tahun Berjalan)
  
  const revenues = accountBalances.filter(a => a.nomor_akun.startsWith('4'));
  const expenses = accountBalances.filter(a => a.nomor_akun.startsWith('5'));
  
  const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
  const totalExpense = expenses.reduce((sum, acc) => sum + acc.balance, 0);
  const currentEarnings = totalRevenue - totalExpense;

  // Add Current Earnings to Equity for display
  equity.funds.push({
    _id: 'laba-rugi',
    nomor_akun: '',
    nama: 'Surplus/Defisit Tahun Berjalan',
    level: 3,
    saldo_normal: 'kredit',
    balance: currentEarnings
  } as any);
  equity.total += currentEarnings;

  return {
    assets,
    liabilities,
    equity,
    totalPassiva: liabilities.total + equity.total
  };
}

export async function getAssetChangesData() {
  await dbConnect();

  // Find accounts related to ZISWAF funds
  // We look for accounts starting with 3 (Dana)
  const fundAccounts = await Estimation.find({ 
    level: 3, 
    nomor_akun: { $regex: /^3/ } 
  }).sort({ nomor_akun: 1 });

  const reportData = await Promise.all(fundAccounts.map(async (acc) => {
    // For this report, we ideally need a date range. 
    // Assuming "Current Year" for now.
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    
    // 1. Saldo Awal (Balance before start of year)
    const initialDebit = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $lt: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const initialCredit = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $lt: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const saldoAwal = (initialCredit[0]?.total || 0) - (initialDebit[0]?.total || 0); // Assuming Credit normal for Funds

    // 2. Penambahan (Credit during period)
    const addition = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const penambahan = addition[0]?.total || 0;

    // 3. Pengurangan (Debit during period)
    const deduction = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pengurangan = deduction[0]?.total || 0;

    // 4. Saldo Akhir
    const saldoAkhir = saldoAwal + penambahan - pengurangan;

    return {
      ...acc.toObject(),
      saldoAwal,
      penambahan,
      pengurangan,
      saldoAkhir
    };
  }));

  return reportData;
}

export async function getFundChangesData() {
  await dbConnect();

  // 1. Get all Revenue (4xx) and Expense (5xx) accounts
  const accounts = await Estimation.find({
    level: 3,
    $or: [
      { nomor_akun: { $regex: /^4/ } },
      { nomor_akun: { $regex: /^5/ } }
    ]
  }).sort({ nomor_akun: 1 });

  // 2. Calculate balances (Activity for the period)
  // Assuming current year for now
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const debitResult = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creditResult = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDebit = debitResult[0]?.total || 0;
    const totalCredit = creditResult[0]?.total || 0;

    let balance = 0;
    // Revenue (4xx) is Credit normal
    if (acc.nomor_akun.startsWith('4')) {
      balance = totalCredit - totalDebit;
    }
    // Expense (5xx) is Debit normal
    else {
      balance = totalDebit - totalCredit;
    }

    return {
      ...acc.toObject(),
      balance
    };
  }));

  // 3. Group by Fund Type
  const categorize = (acc: any) => {
    // Priority 1: Check Account Number Prefix (Level 2 Parent)
    // Zakat: 42x (Rev), 51x (Exp)
    if (acc.nomor_akun.startsWith('42') || acc.nomor_akun.startsWith('51')) return 'zakat';
    
    // Infak: 43x (Rev), 52x (Exp)
    if (acc.nomor_akun.startsWith('43') || acc.nomor_akun.startsWith('52')) return 'infak';
    
    // Amil: 41x (Margin), 44x (Rev), 53x (Exp)
    if (acc.nomor_akun.startsWith('41') || acc.nomor_akun.startsWith('44') || acc.nomor_akun.startsWith('53')) return 'amil';
    
    // Non-Halal: 45x (Rev), 54x (Exp)
    if (acc.nomor_akun.startsWith('45') || acc.nomor_akun.startsWith('54')) return 'nonhalal';

    // Priority 2: Fallback to Name Check (Legacy support)
    const name = acc.nama.toLowerCase();
    if (name.includes('zakat')) return 'zakat';
    if (name.includes('infak') || name.includes('infaq') || name.includes('sedekah') || name.includes('shadaqah')) return 'infak';
    if (name.includes('amil')) return 'amil';
    if (name.includes('nonhalal') || name.includes('non halal') || name.includes('bunga')) return 'nonhalal';
    
    return 'amil'; // Default to Amil/Operational for generic revenues/expenses
  };

  const funds: Record<string, { revenues: any[], expenses: any[], surplus: number }> = {
    zakat: { revenues: [], expenses: [], surplus: 0 },
    infak: { revenues: [], expenses: [], surplus: 0 },
    amil: { revenues: [], expenses: [], surplus: 0 },
    nonhalal: { revenues: [], expenses: [], surplus: 0 }
  };

  accountBalances.forEach(acc => {
    const category = categorize(acc);
    // Safety check if category exists (it should based on categorize logic)
    if (funds[category]) {
      const type = acc.nomor_akun.startsWith('4') ? 'revenues' : 'expenses';
      funds[category][type].push(acc);
    }
  });

  // Calculate Surplus
  Object.keys(funds).forEach(key => {
    const f = funds[key];
    const totalRev = f.revenues.reduce((s: number, a: any) => s + a.balance, 0);
    const totalExp = f.expenses.reduce((s: number, a: any) => s + a.balance, 0);
    f.surplus = totalRev - totalExp;
  });

  return funds;
}
