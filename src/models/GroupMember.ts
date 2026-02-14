import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroupMember extends Document {
  group_id: mongoose.Types.ObjectId;
  no_anggota: string;
  nama: string;
  jabatan: string;
  jenis_kelamin: string;
  tanggal_lahir: Date;
  alamat: string;
  no_telp: string;
}

const GroupMemberSchema: Schema = new Schema({
  group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  no_anggota: { type: String, required: true },
  nama: { type: String, required: true },
  jabatan: { type: String, required: true },
  jenis_kelamin: { type: String, required: true },
  tanggal_lahir: { type: Date, required: true },
  alamat: { type: String, required: true },
  no_telp: { type: String, required: true },
}, { timestamps: true });

export const GroupMember: Model<IGroupMember> = mongoose.models.GroupMember || mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);
