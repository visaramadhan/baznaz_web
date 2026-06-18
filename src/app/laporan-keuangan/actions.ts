'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';

const startOfYear = new Date(new Date().getFullYear(), 0, 1);
const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const includesKeyword = (value: string, ...keywords: string[]) => {
  const normalizedValue = normalizeText(value);
  return keywords.some((keyword) => normalizedValue.includes(normalizeText(keyword)));
};

const getReferenceNames = (acc: any) => {
  const refs = [acc.ref_level_1, acc.ref_level_2, acc.ref_level_3]
    .map((ref: any) => (ref && typeof ref === 'object' ? ref.nama : ''))
    .filter(Boolean);

  return refs;
};

const hasReferenceName = (acc: any, ...keywords: string[]) => {
  const refs = getReferenceNames(acc);
  return refs.some((name) => includesKeyword(String(name), ...keywords));
};

const isDepreciationName = (name: string) =>
  includesKeyword(name, 'penyusutan', 'akumulasi penyusutan', 'susut');

const isNonHalalName = (name: string) =>
  includesKeyword(name, 'non halal', 'nonhalal');

const isBankProfitAccount = (acc: any) =>
  includesKeyword(acc.nama || '', 'bagi hasil bank', 'bunga bank') || String(acc.nomor_akun || '').startsWith('45');

const isFixedAssetAccount = (acc: any) =>
  hasReferenceName(acc, 'aktiva') &&
  String(acc.nomor_akun || '').startsWith('12') &&
  !isDepreciationName(acc.nama || '');

const isFixedAssetDepreciationAccount = (acc: any) =>
  hasReferenceName(acc, 'aktiva') &&
  String(acc.nomor_akun || '').startsWith('12') &&
  isDepreciationName(acc.nama || '');

const isCashLikeAccount = (acc: any) =>
  hasReferenceName(acc, 'aktiva') &&
  String(acc.nomor_akun || '').startsWith('11') &&
  includesKeyword(acc.nama || '', 'kas', 'bank');

async function getJournalTotals(accountId: any, tanggalFilter?: Record<string, any>) {
  const baseMatch = {
    nomor_transaksi: { $not: /^PA / },
    ...(tanggalFilter ? { tanggal: tanggalFilter } : {}),
  };

  const [debitResult, creditResult] = await Promise.all([
    Journal.aggregate([
      { $match: { ...baseMatch, debit_account_id: accountId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Journal.aggregate([
      { $match: { ...baseMatch, credit_account_id: accountId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    debit: debitResult[0]?.total || 0,
    credit: creditResult[0]?.total || 0,
  };
}

function calculateBalance(acc: any, totalDebit: number, totalCredit: number) {
  if (acc.saldo_normal === 'debet') {
    return totalDebit - totalCredit;
  }

  return totalCredit - totalDebit;
}

function mergeAccountsByName(accounts: any[]) {
  const merged = new Map<string, any>();

  accounts.forEach((acc) => {
    const nama = isBankProfitAccount(acc) ? 'Bagi Hasil Bank' : acc.nama;
    const existing = merged.get(nama);

    if (existing) {
      existing.balance += acc.balance;
      return;
    }

    merged.set(nama, {
      _id: acc._id,
      nama,
      balance: acc.balance,
    });
  });

  return Array.from(merged.values());
}

function getRelatedDepreciationAccounts(assetAcc: any, depreciationAccounts: any[]) {
  const assetRefLevel3Id =
    assetAcc.ref_level_3 && typeof assetAcc.ref_level_3 === 'object'
      ? String(assetAcc.ref_level_3._id)
      : '';

  const assetName = normalizeText(assetAcc.nama || '');

  return depreciationAccounts.filter((depAcc) => {
    const depRefLevel3Id =
      depAcc.ref_level_3 && typeof depAcc.ref_level_3 === 'object'
        ? String(depAcc.ref_level_3._id)
        : '';

    if (assetRefLevel3Id && depRefLevel3Id && assetRefLevel3Id === depRefLevel3Id) {
      return true;
    }

    const depreciationName = normalizeText(depAcc.nama || '')
      .replace(normalizeText('akumulasi penyusutan'), '')
      .replace(normalizeText('penyusutan'), '');

    return Boolean(depreciationName) && (assetName.includes(depreciationName) || depreciationName.includes(assetName));
  });
}

export async function getBalanceSheetData() {
  await dbConnect();

  // 1. Get all Level 4 accounts (Transaction accounts) with Level 1 reference
  const accounts = await Estimation.find({ level: 4 })
    .sort({ nomor_akun: 1 })
    .populate('ref_level_1', 'nama');

  // 2. Calculate balances for each account
  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const totals = await getJournalTotals(acc._id);
    const totalDebit = totals.debit + (acc.debet || 0);
    const totalCredit = totals.credit + (acc.kredit || 0);
    const balance = calculateBalance(acc, totalDebit, totalCredit);

    return {
      ...acc.toObject(),
      balance
    };
  }));

  // 3. Group accounts menggunakan Level 1 (Aktiva, Kewajiban, Dana Program, Penerimaan Lain-Lain)
  const fixedAssetsFromReport = await getAssetChangesData();
  const assets = {
    current: accountBalances.filter((acc) => hasReferenceName(acc, 'aktiva') && String(acc.nomor_akun).startsWith('11')),
    fixed: fixedAssetsFromReport.length > 0
      ? fixedAssetsFromReport.map((row: any) => ({
          _id: row._id,
          nama: row.nama,
          balance: row.saldoAkhir,
        }))
      : accountBalances.filter((acc) => isFixedAssetAccount(acc)).map((acc) => ({
          _id: acc._id,
          nama: acc.nama,
          balance: acc.balance,
        })),
    total: 0
  };
  
  const liabilities = {
    current: accountBalances.filter((acc) => hasReferenceName(acc, 'kewajiban') && String(acc.nomor_akun).startsWith('21')),
    longTerm: accountBalances.filter((acc) => hasReferenceName(acc, 'kewajiban') && String(acc.nomor_akun).startsWith('22')),
    total: 0
  };

  const equity = {
    funds: accountBalances.filter((acc) => hasReferenceName(acc, 'dana program') && !isNonHalalName(acc.nama || '')),
    total: 0
  };

  const bankProfitTotal = accountBalances
    .filter((acc) => isBankProfitAccount(acc))
    .reduce((sum, acc) => sum + acc.balance, 0);

  const otherIncome = {
    accounts: bankProfitTotal !== 0
      ? [{ _id: 'bank-profit', nama: 'Bagi Hasil Bank', balance: bankProfitTotal }]
      : [],
    total: bankProfitTotal
  };

  // 4. Calculate group totals
  assets.total = [...assets.current, ...assets.fixed].reduce((sum, acc) => sum + acc.balance, 0);
  liabilities.total = [...liabilities.current, ...liabilities.longTerm].reduce((sum, acc) => sum + acc.balance, 0);
  equity.total = equity.funds.reduce((sum, acc) => sum + acc.balance, 0);

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

  const accounts = await Estimation.find({
    level: 4,
    nomor_akun: { $regex: /^12/ }
  })
    .sort({ nomor_akun: 1 })
    .populate('ref_level_1', 'nama')
    .populate('ref_level_2', 'nama')
    .populate('ref_level_3', 'nama');

  const fixedAssetAccounts = accounts.filter((acc: any) => isFixedAssetAccount(acc));
  const depreciationAccounts = accounts.filter((acc: any) => isFixedAssetDepreciationAccount(acc));

  const reportData = await Promise.all(fixedAssetAccounts.map(async (acc: any) => {
    const initialTotals = await getJournalTotals(acc._id, { $lt: startOfYear });
    const periodTotals = await getJournalTotals(acc._id, { $gte: startOfYear, $lte: endOfToday });

    const saldoAwalBruto = calculateBalance(
      acc,
      initialTotals.debit + (acc.debet || 0),
      initialTotals.credit + (acc.kredit || 0)
    );

    const penambahan = periodTotals.debit;
    const pengurangan = periodTotals.credit;

    const relatedDepreciationAccounts = getRelatedDepreciationAccounts(acc, depreciationAccounts);

    const depreciationData = await Promise.all(relatedDepreciationAccounts.map(async (depAcc: any) => {
      const depInitialTotals = await getJournalTotals(depAcc._id, { $lt: startOfYear });
      const depPeriodTotals = await getJournalTotals(depAcc._id, { $gte: startOfYear, $lte: endOfToday });

      const saldoAwal = calculateBalance(
        depAcc,
        depInitialTotals.debit + (depAcc.debet || 0),
        depInitialTotals.credit + (depAcc.kredit || 0)
      );

      const penyusutanPeriode = Math.max(0, calculateBalance(depAcc, depPeriodTotals.debit, depPeriodTotals.credit));

      return {
        saldoAwal,
        penyusutanPeriode,
      };
    }));

    const saldoAwalPenyusutan = depreciationData.reduce((sum, item) => sum + item.saldoAwal, 0);
    const penyusutan = depreciationData.reduce((sum, item) => sum + item.penyusutanPeriode, 0);
    const saldoAwal = saldoAwalBruto - saldoAwalPenyusutan;
    const saldoAkhir = saldoAwal + penambahan - pengurangan - penyusutan;

    return {
      ...acc.toObject(),
      saldoAwal,
      penambahan,
      pengurangan,
      penyusutan,
      saldoAkhir
    };
  }));

  return reportData;
}

export async function getFundChangesData() {
  await dbConnect();
  
  // Get all revenue (4) and expense (5) accounts
  const accounts = await Estimation.find({
    level: 4,
    $or: [
      { nomor_akun: { $regex: /^4/ } },
      { nomor_akun: { $regex: /^5/ } }
    ]
  }).sort({ nomor_akun: 1 });

  const accountBalances = await Promise.all(accounts.map(async (acc) => {
    const totals = await getJournalTotals(acc._id);
    const totalDebit = totals.debit + (acc.debet || 0);
    const totalCredit = totals.credit + (acc.kredit || 0);

    return {
      ...acc.toObject(),
      balance: calculateBalance(acc, totalDebit, totalCredit)
    };
  }));

  const amilRevenueAccounts = mergeAccountsByName(
    accountBalances.filter((acc) =>
      String(acc.nomor_akun).startsWith('41') ||
      String(acc.nomor_akun).startsWith('44') ||
      isBankProfitAccount(acc) ||
      includesKeyword(acc.nama || '', 'amil')
    )
  );

  const amilExpenseAccounts = mergeAccountsByName(
    accountBalances.filter((acc) =>
      String(acc.nomor_akun).startsWith('53') ||
      includesKeyword(acc.nama || '', 'amil')
    )
  );

  const funds: any = {
    amil: {
      revenues: amilRevenueAccounts,
      expenses: amilExpenseAccounts,
      surplus:
        amilRevenueAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0) -
        amilExpenseAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0),
    },
  };

  return funds;
}

export async function getCashFlowData() {
  await dbConnect();

  const accounts = await Estimation.find({ level: 4 })
    .sort({ nomor_akun: 1 })
    .populate('ref_level_1', 'nama')
    .populate('ref_level_2', 'nama')
    .populate('ref_level_3', 'nama');

  const cashAccounts = accounts.filter((acc: any) => isCashLikeAccount(acc));
  const cashAccountIds = cashAccounts.map((acc: any) => acc._id);

  const cashBalanceData = await Promise.all(cashAccounts.map(async (acc: any) => {
    const initialTotals = await getJournalTotals(acc._id, { $lt: startOfYear });
    const finalTotals = await getJournalTotals(acc._id, { $lte: endOfToday });

    return {
      openingBalance: calculateBalance(
        acc,
        initialTotals.debit + (acc.debet || 0),
        initialTotals.credit + (acc.kredit || 0)
      ),
      endingBalance: calculateBalance(
        acc,
        finalTotals.debit + (acc.debet || 0),
        finalTotals.credit + (acc.kredit || 0)
      ),
    };
  }));

  const [receiptJournals, disbursementJournals] = await Promise.all([
    Journal.find({
      debit_account_id: { $in: cashAccountIds },
      credit_account_id: { $nin: cashAccountIds },
      tanggal: { $gte: startOfYear, $lte: endOfToday },
      nomor_transaksi: { $not: /^PA / }
    })
      .populate('debit_account_id', 'nama nomor_akun')
      .populate('credit_account_id', 'nama nomor_akun')
      .sort({ tanggal: 1, createdAt: 1 }),
    Journal.find({
      credit_account_id: { $in: cashAccountIds },
      debit_account_id: { $nin: cashAccountIds },
      tanggal: { $gte: startOfYear, $lte: endOfToday },
      nomor_transaksi: { $not: /^PA / }
    })
      .populate('debit_account_id', 'nama nomor_akun')
      .populate('credit_account_id', 'nama nomor_akun')
      .sort({ tanggal: 1, createdAt: 1 }),
  ]);

  const penerimaan = receiptJournals.map((journal: any) => ({
    _id: journal._id,
    tanggal: journal.tanggal,
    nomor_transaksi: journal.nomor_transaksi,
    keterangan: journal.description || journal.credit_account_id?.nama || '-',
    lawanAkun: journal.credit_account_id?.nama || '-',
    jumlah: journal.amount,
  }));

  const pengeluaran = disbursementJournals.map((journal: any) => ({
    _id: journal._id,
    tanggal: journal.tanggal,
    nomor_transaksi: journal.nomor_transaksi,
    keterangan: journal.description || journal.debit_account_id?.nama || '-',
    lawanAkun: journal.debit_account_id?.nama || '-',
    jumlah: journal.amount,
  }));

  const totalPenerimaan = penerimaan.reduce((sum, row) => sum + row.jumlah, 0);
  const totalPengeluaran = pengeluaran.reduce((sum, row) => sum + row.jumlah, 0);
  const saldoAwal = cashBalanceData.reduce((sum, row) => sum + row.openingBalance, 0);
  const saldoAkhir = saldoAwal + totalPenerimaan - totalPengeluaran;
  const saldoKasPosisiKeuangan = cashBalanceData.reduce((sum, row) => sum + row.endingBalance, 0);

  return {
    penerimaan,
    pengeluaran,
    totalPenerimaan,
    totalPengeluaran,
    saldoAwal,
    saldoAkhir,
    saldoKasPosisiKeuangan,
  };
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
