'use server';

import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { Journal } from '@/models/Journal';
import { revalidatePath } from 'next/cache';

export async function getEstimations() {
  await dbConnect();
  // Fetch all estimations, sorted by account number
  const estimations = await Estimation.find({}).sort({ nomor_akun: 1 })
    .populate('induk_akun')
    .populate('ref_level_1')
    .populate('ref_level_2')
    .populate('ref_level_3');
  return JSON.parse(JSON.stringify(estimations));
}

export async function createEstimation(formData: FormData) {
  await dbConnect();
  
  let nomor_akun = formData.get('nomor_akun') as string;
  const nama = formData.get('nama') as string;
  const level = parseInt(formData.get('level') as string);
  const saldo_normal = formData.get('saldo_normal') as string;
  const induk_akun = formData.get('induk_akun') as string;
  const ref_level_1 = formData.get('ref_level_1') as string;
  const ref_level_2 = formData.get('ref_level_2') as string;
  const ref_level_3 = formData.get('ref_level_3') as string;
  const debet = parseFloat(formData.get('debet') as string || '0');
  const kredit = parseFloat(formData.get('kredit') as string || '0');

  // Auto-generate nomor_akun if missing
  if (!nomor_akun) {
    if (induk_akun) {
        const parent = await Estimation.findById(induk_akun);
        if (parent) {
            // Find existing children to determine next number
            const lastChild = await Estimation.findOne({ induk_akun: parent._id })
                .sort({ nomor_akun: -1 })
                .collation({ locale: "en_US", numericOrdering: true });
            
            if (lastChild) {
                const parts = lastChild.nomor_akun.split('.');
                const lastNum = parseInt(parts[parts.length - 1]);
                if (!isNaN(lastNum)) {
                    nomor_akun = `${parent.nomor_akun}.${lastNum + 1}`;
                } else {
                    nomor_akun = `${parent.nomor_akun}.${Date.now()}`; // Fallback
                }
            } else {
                nomor_akun = `${parent.nomor_akun}.1`;
            }
        }
    } 
    
    // If still no nomor_akun (no parent or parent not found)
    if (!nomor_akun) {
        // Find last item of this level without parent (or global for this level if we treat orphans as roots)
        // Since we want to support orphans, we treat them as "roots" of their level
        const lastItem = await Estimation.findOne({ level })
             .sort({ nomor_akun: -1 })
             .collation({ locale: "en_US", numericOrdering: true });
        
        if (lastItem) {
             const val = parseInt(lastItem.nomor_akun.replace(/[^0-9]/g, ''));
             if (!isNaN(val)) {
                 nomor_akun = `${val + 1}`;
             } else {
                 nomor_akun = `${level}.${Date.now()}`;
             }
        } else {
             // Start at 1 for this level
             nomor_akun = level === 1 ? '1' : `${level}.1`;
        }
    }

    // Final check for uniqueness
    let exists = await Estimation.findOne({ nomor_akun });
    let counter = 1;
    while (exists) {
        nomor_akun = `${nomor_akun}.${counter}`; // Append suffix to ensure uniqueness
        exists = await Estimation.findOne({ nomor_akun });
        counter++;
    }
  }

  try {
    const newAccount = await Estimation.create({
      nomor_akun,
      nama,
      level,
      saldo_normal,
      induk_akun: induk_akun || undefined,
      ref_level_1: ref_level_1 || undefined,
      ref_level_2: ref_level_2 || undefined,
      ref_level_3: ref_level_3 || undefined,
      debet,
      kredit
    });
    
    // Create Journal Entry for Opening Balance if needed
    if (debet > 0 || kredit > 0) {
      let balancingAccount = await Estimation.findOne({ nomor_akun: '399' });
      
      if (!balancingAccount && nomor_akun !== '399') {
         balancingAccount = await Estimation.create({
            nomor_akun: '399',
            nama: 'Historical Balancing',
            level: 3,
            saldo_normal: 'kredit',
            debet: 0,
            kredit: 0
         });
      }
      
      if (nomor_akun !== '399' && balancingAccount) {
         const yyyy = new Date().getFullYear();
         const mm = String(new Date().getMonth() + 1).padStart(2, '0');
         const dd = String(new Date().getDate()).padStart(2, '0');
         const random = Math.floor(1000 + Math.random() * 9000);
         const nomor_transaksi = `SA-${yyyy}${mm}${dd}-${random}`;

         if (debet > 0) {
             await Journal.create({
                nomor_transaksi,
                tanggal: new Date(), 
                debit_account_id: newAccount._id,
                credit_account_id: balancingAccount._id,
                amount: debet,
                description: 'Saldo Awal Debet',
                reference: 'SALDO-AWAL',
            });
         }

         if (kredit > 0) {
             // Use a slightly different ID if both exist to avoid collision if nomor_transaksi is unique
             // But Journal doesn't force unique nomor_transaksi usually. 
             // If it does, we append suffix.
             await Journal.create({
                nomor_transaksi: debet > 0 ? `${nomor_transaksi}-K` : nomor_transaksi,
                tanggal: new Date(), 
                debit_account_id: balancingAccount._id,
                credit_account_id: newAccount._id,
                amount: kredit,
                description: 'Saldo Awal Kredit',
                reference: 'SALDO-AWAL',
            });
         }
      }
    }
    
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create estimation:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEstimation(id: string, formData: FormData) {
  await dbConnect();
  
  const nomor_akun = formData.get('nomor_akun') as string;
  const nama = formData.get('nama') as string;
  const level = parseInt(formData.get('level') as string);
  const saldo_normal = formData.get('saldo_normal') as string;
  const induk_akun = formData.get('induk_akun') as string;
  const ref_level_1 = formData.get('ref_level_1') as string;
  const ref_level_2 = formData.get('ref_level_2') as string;
  const ref_level_3 = formData.get('ref_level_3') as string;
  const debet = parseFloat(formData.get('debet') as string || '0');
  const kredit = parseFloat(formData.get('kredit') as string || '0');

  try {
    await Estimation.findByIdAndUpdate(id, {
      nomor_akun,
      nama,
      level,
      saldo_normal,
      induk_akun: induk_akun || undefined,
      ref_level_1: ref_level_1 || undefined,
      ref_level_2: ref_level_2 || undefined,
      ref_level_3: ref_level_3 || undefined,
      debet,
      kredit
    });
    
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update estimation:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEstimation(id: string) {
  await dbConnect();
  try {
    await Estimation.findByIdAndDelete(id);
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete estimation:', error);
    return { success: false, error: error.message };
  }
}
