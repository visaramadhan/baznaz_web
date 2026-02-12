import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoan extends Document {
  nomor_transaksi: string;
  group_id: mongoose.Types.ObjectId;
  fund_source_id: mongoose.Types.ObjectId;
  jumlah: number;
  jangka_waktu: number; // In weeks or months
  margin: number;
  status: 'pending' | 'active' | 'paid' | 'bad';
  tanggal_akad: Date;
}

const LoanSchema: Schema = new Schema({
  nomor_transaksi: { type: String, required: true, unique: true },
  group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  fund_source_id: { type: Schema.Types.ObjectId, ref: 'FundSource', required: true },
  jumlah: { type: Number, required: true },
  jangka_waktu: { type: Number, required: true },
  margin: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'paid', 'bad'], default: 'pending' },
  tanggal_akad: { type: Date, default: Date.now },
}, { timestamps: true });

export const Loan: Model<ILoan> = mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);
