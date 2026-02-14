import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionSetting extends Document {
  type: string; // 'penyaluran_baznas', 'penyaluran_bergulir', 'pembayaran_tunai', 'pembayaran_transfer'
  debit_account_id: mongoose.Types.ObjectId; // Ref to Estimation
  credit_account_id: mongoose.Types.ObjectId; // Ref to Estimation
}

const TransactionSettingSchema: Schema = new Schema({
  type: { type: String, required: true, unique: true },
  debit_account_id: { type: Schema.Types.ObjectId, ref: 'Estimation', required: true },
  credit_account_id: { type: Schema.Types.ObjectId, ref: 'Estimation', required: true },
}, { timestamps: true });

export const TransactionSetting: Model<ITransactionSetting> = mongoose.models.TransactionSetting || mongoose.model<ITransactionSetting>('TransactionSetting', TransactionSettingSchema);
