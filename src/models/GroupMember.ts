import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroupMember extends Document {
  group_id: mongoose.Types.ObjectId;
  nama: string;
  ktp: string;
  jabatan_di_kelompok: string;
}

const GroupMemberSchema: Schema = new Schema({
  group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  nama: { type: String, required: true },
  ktp: { type: String, required: true },
  jabatan_di_kelompok: { type: String, required: true },
}, { timestamps: true });

export const GroupMember: Model<IGroupMember> = mongoose.models.GroupMember || mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);
