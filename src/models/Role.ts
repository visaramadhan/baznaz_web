import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[]; // List of allowed paths or feature keys
  isSystem?: boolean; // If true, cannot be deleted (e.g. Admin)
}

const RoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

export const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
