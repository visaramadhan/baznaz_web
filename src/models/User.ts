import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: string; // Changed to string to store Role Name or ID, but let's use Role Name for simplicity in display, or ID for reference. 
  // Ideally, use ObjectId reference, but for backward compat with 'admin'/'staff' strings, we might need a migration.
  // Let's use String but it should match a Role.name.
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  role: { type: String, required: true, default: 'Staff' }, // Default to 'Staff' role
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
