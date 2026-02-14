import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoan extends Document {
  nomor_transaksi: string;
  group_id: mongoose.Types.ObjectId;
  sumber_dana: 'Baznas RI' | 'Dana Bergulir';
  jumlah: number;
  jumlah_per_anggota: number;
  jangka_waktu: number;
  angsuran_per_minggu: number;
  status: 'pending' | 'active' | 'paid' | 'bad';
  tanggal_akad: Date;
}

const LoanSchema: Schema = new Schema({
  nomor_transaksi: { type: String, required: true, unique: true },
  group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sumber_dana: { type: String, enum: ['Baznas RI', 'Dana Bergulir'], required: true },
  jumlah: { type: Number, required: true }, // Total Loan Amount
  jumlah_per_anggota: { type: Number, required: true }, // 3jt or 6jt
  jangka_waktu: { type: Number, required: true }, // 40 or 50 weeks
  angsuran_per_minggu: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'paid', 'bad'], default: 'pending' },
  tanggal_akad: { type: Date, default: Date.now },
}, { timestamps: true });

export const Loan: Model<ILoan> = mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);
