import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  nip: string;
  name: string;
  jabatan: string;
  mulai_bekerja: Date;
  email?: string;
  tanggal_lahir?: Date;
  pendidikan?: string;
  alamat?: string;
  no_hp?: string;
}

const EmployeeSchema: Schema = new Schema({
  nip: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  jabatan: { type: String, required: true },
  mulai_bekerja: { type: Date, required: true },
  email: { type: String },
  tanggal_lahir: { type: Date },
  pendidikan: { type: String },
  alamat: { type: String },
  no_hp: { type: String },
}, { timestamps: true });

export const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
