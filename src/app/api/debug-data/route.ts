import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';

export async function GET() {
  await dbConnect();

  try {
    const allAccounts = await Estimation.find({});
    const level3Accounts = await Estimation.find({ level: 3 });
    const cashAccounts = await Estimation.find({ nomor_akun: { $regex: /^(111|112)/ } });

    return NextResponse.json({
      total: allAccounts.length,
      level3_count: level3Accounts.length,
      cash_count: cashAccounts.length,
      sample_level3: level3Accounts[0] || null,
      sample_types: level3Accounts[0] ? {
        level_type: typeof level3Accounts[0].level,
        nomor_akun_type: typeof level3Accounts[0].nomor_akun
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
