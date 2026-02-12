import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  nama: string;
  alamat: string;
  telp: string;
  logo?: string; // URL or base64 string
}

const ProfileSchema: Schema = new Schema({
  nama: { type: String, required: true, default: 'BAZNAS Microfinance Desa' },
  alamat: { type: String, required: true, default: 'Kota Bukittinggi' },
  telp: { type: String, default: '' },
  logo: { type: String, default: '' },
}, { timestamps: true });

export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
