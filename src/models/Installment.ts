import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstallment extends Document {
  nomor_transaksi: string;
  loan_id: mongoose.Types.ObjectId;
  jumlah_bayar: number;
  tanggal_bayar: Date;
  keterangan?: string;
}

const InstallmentSchema: Schema = new Schema({
  nomor_transaksi: { type: String, required: true, unique: true },
  loan_id: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
  jumlah_bayar: { type: Number, required: true },
  tanggal_bayar: { type: Date, default: Date.now },
  keterangan: { type: String },
}, { timestamps: true });

export const Installment: Model<IInstallment> = mongoose.models.Installment || mongoose.model<IInstallment>('Installment', InstallmentSchema);
