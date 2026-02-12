import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEstimation extends Document {
  nomor_akun: string;
  nama: string;
  level: number;
  saldo_normal: 'debet' | 'kredit';
  induk_akun?: string; // Parent account number
}

const EstimationSchema: Schema = new Schema({
  nomor_akun: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  level: { type: Number, required: true },
  saldo_normal: { type: String, enum: ['debet', 'kredit'], required: true },
  induk_akun: { type: String },
}, { timestamps: true });

export const Estimation: Model<IEstimation> = mongoose.models.Estimation || mongoose.model<IEstimation>('Estimation', EstimationSchema);
