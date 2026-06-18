import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
  nomor: string;
  nama: string;
  alamat: string;
  no_telp: string;
  saldo_awal: number;
}

const GroupSchema: Schema = new Schema({
  nomor: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  alamat: { type: String, required: true },
  no_telp: { type: String, required: true },
  saldo_awal: { type: Number, default: 0 },
}, { timestamps: true });

export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
