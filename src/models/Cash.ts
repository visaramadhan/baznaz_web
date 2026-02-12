import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICash extends Document {
  tanggal: Date;
  type: 'in' | 'out';
  amount: number;
  description: string;
  reference?: string;
}

const CashSchema: Schema = new Schema({
  tanggal: { type: Date, default: Date.now },
  type: { type: String, enum: ['in', 'out'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String },
}, { timestamps: true });

export const Cash: Model<ICash> = mongoose.models.Cash || mongoose.model<ICash>('Cash', CashSchema);
