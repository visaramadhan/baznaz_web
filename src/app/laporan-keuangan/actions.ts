'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';

export async function getBalanceSheetData() {
  await dbConnect();

  // 1. Get all Level 4 accounts (Transaction accounts) with Level 1 reference
  const accounts = await Estimation.find({ level: 4 })
    .sort({ nomor_akun: 1 })
    .populate('ref_level_1', 'nama');

  // 2. Calculate balances for each account
  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const debitResult = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creditResult = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDebit = (debitResult[0]?.total || 0) + (acc.debet || 0);
    const totalCredit = (creditResult[0]?.total || 0) + (acc.kredit || 0);

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

  const hasRefName = (acc: any, keyword: string) => {
    const ref = acc.ref_level_1 as any;
    if (!ref || typeof ref !== 'object' || !ref.nama) return false;
    return String(ref.nama).toLowerCase().includes(keyword.toLowerCase());
  };

  // 3. Group accounts menggunakan Level 1 (Aktiva, Kewajiban, Dana Program, Penerimaan Lain-Lain)
  const assets = {
    current: accountBalances.filter(a => hasRefName(a, 'aktiva') && a.nomor_akun.startsWith('11')),
    fixed: accountBalances.filter(a => hasRefName(a, 'aktiva') && a.nomor_akun.startsWith('12')),
    total: 0
  };
  
  const liabilities = {
    current: accountBalances.filter(a => hasRefName(a, 'kewajiban') && a.nomor_akun.startsWith('21')),
    longTerm: accountBalances.filter(a => hasRefName(a, 'kewajiban') && a.nomor_akun.startsWith('22')),
    total: 0
  };

  const equity = {
    funds: accountBalances.filter(a => hasRefName(a, 'dana program')),
    total: 0
  };

  const otherIncome = {
    accounts: accountBalances.filter(a => hasRefName(a, 'penerimaan lain')),
    total: 0
  };

  // 4. Calculate group totals
  assets.total = [...assets.current, ...assets.fixed].reduce((sum, acc) => sum + acc.balance, 0);
  liabilities.total = [...liabilities.current, ...liabilities.longTerm].reduce((sum, acc) => sum + acc.balance, 0);
  equity.total = equity.funds.reduce((sum, acc) => sum + acc.balance, 0);
  otherIncome.total = otherIncome.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return {
    assets,
    liabilities,
    equity,
    otherIncome,
    totalPassiva: liabilities.total + equity.total + otherIncome.total
  };
}

export async function getAssetChangesData() {
  await dbConnect();

  // Find accounts related to ZISWAF funds
  // We look for accounts starting with 3 (Dana)
  const fundAccounts = await Estimation.find({ 
    level: 4, 
    nomor_akun: { $regex: /^3/ } 
  }).sort({ nomor_akun: 1 });

  const reportData = await Promise.all(fundAccounts.map(async (acc) => {
    // For this report, we ideally need a date range. 
    // Assuming "Current Year" for now.
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    
    // 1. Saldo Awal (Balance before start of year)
    const initialDebit = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $lt: startOfYear }, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const initialCredit = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $lt: startOfYear }, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const saldoAwal = ((initialCredit[0]?.total || 0) + (acc.kredit || 0)) - ((initialDebit[0]?.total || 0) + (acc.debet || 0)); // Assuming Credit normal for Funds

    // 2. Penambahan (Credit during period)
    const addition = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $gte: startOfYear }, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const penambahan = addition[0]?.total || 0;

    // 3. Pengurangan (Debit during period)
    const deduction = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $gte: startOfYear }, nomor_transaksi: { $not: /^PA / } } },
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
  
  // Helper to categorize accounts
  const categorize = (acc: any) => {
    // Priority 1: Check Account Number Prefix (Level 2 Parent)
    if (acc.nomor_akun.startsWith('42') || acc.nomor_akun.startsWith('51')) return 'zakat';
    if (acc.nomor_akun.startsWith('43') || acc.nomor_akun.startsWith('52')) return 'infak';
    if (acc.nomor_akun.startsWith('41') || acc.nomor_akun.startsWith('44') || acc.nomor_akun.startsWith('53')) return 'amil';
    if (acc.nomor_akun.startsWith('45') || acc.nomor_akun.startsWith('54')) return 'nonhalal';

    // Priority 2: Fallback to Name Check (Legacy support)
    const name = acc.nama.toLowerCase();
    if (name.includes('zakat')) return 'zakat';
    if (name.includes('infak') || name.includes('infaq') || name.includes('sedekah') || name.includes('shadaqah')) return 'infak';
    if (name.includes('amil')) return 'amil';
    if (name.includes('nonhalal') || name.includes('non halal') || name.includes('bunga')) return 'nonhalal';
    
    return 'amil';
  };

  // Get all revenue (4) and expense (5) accounts
  const accounts = await Estimation.find({
    level: 4,
    $or: [
      { nomor_akun: { $regex: /^4/ } },
      { nomor_akun: { $regex: /^5/ } }
    ]
  }).sort({ nomor_akun: 1 });

  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const debitResult = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creditResult = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDebit = (debitResult[0]?.total || 0) + (acc.debet || 0);
    const totalCredit = (creditResult[0]?.total || 0) + (acc.kredit || 0);

    // For revenue (Kredit normal), balance = Credit - Debit
    // For expense (Debet normal), balance = Debit - Credit
    let balance = 0;
    if (acc.saldo_normal === 'debet') {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return {
      ...acc.toObject(),
      balance,
      category: categorize(acc)
    };
  }));

  // Group by category
  const funds: any = {
    zakat: { revenues: [], expenses: [], surplus: 0 },
    infak: { revenues: [], expenses: [], surplus: 0 },
    amil: { revenues: [], expenses: [], surplus: 0 },
    nonhalal: { revenues: [], expenses: [], surplus: 0 }
  };

  accountBalances.forEach(acc => {
    const type = acc.nomor_akun.startsWith('4') ? 'revenues' : 'expenses';
    funds[acc.category][type].push(acc);
  });

  // Calculate surplus for each fund
  Object.keys(funds).forEach(key => {
    const rev = funds[key].revenues.reduce((sum: number, a: any) => sum + a.balance, 0);
    const exp = funds[key].expenses.reduce((sum: number, a: any) => sum + a.balance, 0);
    funds[key].surplus = rev - exp;
  });

  return funds;
}

export async function getGeneralLedgerData(accountId: string, startDate: string, endDate: string) {
  await dbConnect();
  
  const account = await Estimation.findById(accountId);
  if (!account) throw new Error('Account not found');

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 1. Calculate Opening Balance
  const debitBefore = await Journal.aggregate([
    { $match: { debit_account_id: account._id, tanggal: { $lt: start }, nomor_transaksi: { $not: /^PA / } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const creditBefore = await Journal.aggregate([
    { $match: { credit_account_id: account._id, tanggal: { $lt: start }, nomor_transaksi: { $not: /^PA / } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalDebitBefore = (debitBefore[0]?.total || 0) + (account.debet || 0);
  const totalCreditBefore = (creditBefore[0]?.total || 0) + (account.kredit || 0);
  
  let openingBalance = 0;
  if (account.saldo_normal === 'debet') {
    openingBalance = totalDebitBefore - totalCreditBefore;
  } else {
    openingBalance = totalCreditBefore - totalDebitBefore;
  }

  // 2. Get Transactions
  const journals = await Journal.find({
    $or: [
      { debit_account_id: account._id },
      { credit_account_id: account._id }
    ],
    tanggal: { $gte: start, $lte: end },
    nomor_transaksi: { $not: /^PA / }
  })
  .populate('debit_account_id', 'nama nomor_akun')
  .populate('credit_account_id', 'nama nomor_akun')
  .sort({ tanggal: 1, createdAt: 1 });

  // 3. Format Transactions and Calculate Running Balance
  let currentBalance = openingBalance;
  const transactions = journals.map((journal: any) => {
    const isDebit = journal.debit_account_id._id.toString() === account._id.toString();
    const debitAmount = isDebit ? journal.amount : 0;
    const creditAmount = !isDebit ? journal.amount : 0;

    if (account.saldo_normal === 'debet') {
      currentBalance += (debitAmount - creditAmount);
    } else {
      currentBalance += (creditAmount - debitAmount);
    }

    return {
      _id: journal._id,
      date: journal.tanggal,
      description: journal.description || '-',
      ref: journal.nomor_transaksi,
      contra_account: isDebit ? journal.credit_account_id.nama : journal.debit_account_id.nama,
      debit: debitAmount,
      credit: creditAmount,
      balance: currentBalance
    };
  });

  return {
    account: JSON.parse(JSON.stringify(account)),
    openingBalance,
    transactions: JSON.parse(JSON.stringify(transactions))
  };
}

export async function getTrialBalanceData(startDate: string, endDate: string) {
  await dbConnect();
  
  const targetDate = new Date(endDate);
  targetDate.setHours(23, 59, 59, 999);

  // Fetch Level 4 accounts (Transaction Accounts)
  const accounts = await Estimation.find({ level: 4 }).sort({ nomor_akun: 1 });

  const data = await Promise.all(accounts.map(async (acc) => {
    // 1. Get Journal Movements up to target date (endDate)
    // Note: We calculate the balance AS OF endDate. The startDate is essentially ignored for the balance calculation
    // because Neraca Saldo typically shows the accumulated balance at a specific point in time.
    // If the user expects movements only within the range, that would be a different report (Neraca Lajur / Mutasi).
    // Given the columns requested (Debit, Credit), it implies Balance.
    
    const debitResult = await Journal.aggregate([
      { $match: { debit_account_id: acc._id, tanggal: { $lte: targetDate }, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creditResult = await Journal.aggregate([
      { $match: { credit_account_id: acc._id, tanggal: { $lte: targetDate }, nomor_transaksi: { $not: /^PA / } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const journalDebit = debitResult[0]?.total || 0;
    const journalCredit = creditResult[0]?.total || 0;
    
    // 2. Combine with Opening Balances from Estimation (Saldo Awal Manual)
    // Note: acc.debet and acc.kredit are the manual opening balances
    const initialDebit = acc.debet || 0;
    const initialCredit = acc.kredit || 0;

    const totalDebit = initialDebit + journalDebit;
    const totalCredit = initialCredit + journalCredit;
    
    let debit = 0;
    let credit = 0;
    
    // Calculate Net Balance
    if (acc.saldo_normal === 'debet') {
        const net = totalDebit - totalCredit;
        if (net >= 0) debit = net;
        else credit = Math.abs(net); // Should ideally be negative debit, but presentation-wise credit column
    } else {
        const net = totalCredit - totalDebit;
        if (net >= 0) credit = net;
        else debit = Math.abs(net);
    }

    return {
      ...acc.toObject(),
      debit,
      credit
    };
  }));

  const activeAccounts = data.filter(d => d.debit !== 0 || d.credit !== 0);

  return {
    accounts: JSON.parse(JSON.stringify(activeAccounts)),
    totalDebit: activeAccounts.reduce((sum, a) => sum + a.debit, 0),
    totalCredit: activeAccounts.reduce((sum, a) => sum + a.credit, 0),
  };
}

export async function getAllAccounts() {
  await dbConnect();
  const accounts = await Estimation.find({ level: 4 }).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(accounts));
}
