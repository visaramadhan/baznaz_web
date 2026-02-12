import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJournal extends Document {
  nomor_transaksi: string;
  tanggal: Date;
  debit_account_id: mongoose.Types.ObjectId; // Ref to Estimation
  credit_account_id: mongoose.Types.ObjectId; // Ref to Estimation
  amount: number;
  description: string;
  reference: string;
}

const JournalSchema: Schema = new Schema({
  nomor_transaksi: { type: String, required: true, unique: true },
  tanggal: { type: Date, default: Date.now },
  debit_account_id: { type: Schema.Types.ObjectId, ref: 'Estimation', required: true },
  credit_account_id: { type: Schema.Types.ObjectId, ref: 'Estimation', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String },
}, { timestamps: true });

export const Journal: Model<IJournal> = mongoose.models.Journal || mongoose.model<IJournal>('Journal', JournalSchema);
