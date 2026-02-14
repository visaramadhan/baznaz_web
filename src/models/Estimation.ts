import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEstimation extends Document {
  nomor_akun: string;
  nama: string;
  level: number;
  induk_akun?: string | IEstimation;
  ref_level_1?: string | IEstimation;
  ref_level_2?: string | IEstimation;
  ref_level_3?: string | IEstimation;
  saldo_normal: 'debet' | 'kredit';
  debet: number;
  kredit: number;
}

const EstimationSchema: Schema = new Schema({
  nomor_akun: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  level: { type: Number, required: true },
  induk_akun: { type: Schema.Types.ObjectId, ref: 'Estimation' },
  ref_level_1: { type: Schema.Types.ObjectId, ref: 'Estimation' },
  ref_level_2: { type: Schema.Types.ObjectId, ref: 'Estimation' },
  ref_level_3: { type: Schema.Types.ObjectId, ref: 'Estimation' },
  saldo_normal: { type: String, enum: ['debet', 'kredit'], required: true },
  saldo_awal: { type: Number, default: 0 },
  debet: { type: Number, default: 0 },
  kredit: { type: Number, default: 0 },
}, { timestamps: true });

export const Estimation: Model<IEstimation> = mongoose.models.Estimation || mongoose.model<IEstimation>('Estimation', EstimationSchema);
