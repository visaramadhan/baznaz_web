import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFundSource extends Document {
  name: string;
  description?: string;
}

const FundSourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

export const FundSource: Model<IFundSource> = mongoose.models.FundSource || mongoose.model<IFundSource>('FundSource', FundSourceSchema);
