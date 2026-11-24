import mongoose, { Schema, Document } from 'mongoose';

export interface UserMongooseDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  githubUsername?: string;
  resetOtpHash?: string | null;
  resetOtpExpires?: Date | null;
  resetOtpAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserMongooseDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    githubUsername: { type: String, default: '', trim: true },
    resetOtpHash: { type: String, default: null, index: true },
    resetOtpExpires: { type: Date, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel =
  mongoose.models.User || mongoose.model<UserMongooseDoc>('User', UserSchema);
