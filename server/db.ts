import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { PortfolioModel } from './models/Portfolio.ts';
import { UserModel } from './models/User.ts';
import type { AuthUser, PortfolioDocument } from '../src/types/portfolio.ts';

let usingMongo = false;
let dataDir = path.resolve(process.cwd(), 'data');

export function setDataDirForTesting(customDir: string): void {
  dataDir = customDir;
  usingMongo = false;
}

function getDataFile(): string {
  return path.join(dataDir, 'portfolios.json');
}

function getUsersFile(): string {
  return path.join(dataDir, 'users.json');
}

export interface UserRecord extends AuthUser {
  passwordHash: string;
  updatedAt: string;
  resetOtpHash?: string | null;
  resetOtpExpires?: string | null;
  resetOtpAttempts?: number;
}

export function toPublicUser(record: UserRecord): AuthUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    githubUsername: record.githubUsername || undefined,
    createdAt: record.createdAt,
  };
}

export async function connectDB(): Promise<'mongodb' | 'local-store'> {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim().length > 0 && !uri.includes('MY_')) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      usingMongo = true;
      console.log('Connected to MongoDB via Mongoose');
      return 'mongodb';
    } catch (err) {
      console.warn(
        'MongoDB unavailable in current environment; using persistent local store:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  ensureLocalStore();
  usingMongo = false;
  return 'local-store';
}

export function getDatabaseMode(): 'mongodb' | 'local-store' {
  return usingMongo ? 'mongodb' : 'local-store';
}

function ensureLocalStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dataFile = getDataFile();
  const usersFile = getUsersFile();
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLocalPortfolios(): PortfolioDocument[] {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(getDataFile(), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalPortfolios(items: PortfolioDocument[]): void {
  ensureLocalStore();
  fs.writeFileSync(getDataFile(), JSON.stringify(items, null, 2), 'utf-8');
}

function readLocalUsers(): UserRecord[] {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(getUsersFile(), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: UserRecord[]): void {
  ensureLocalStore();
  fs.writeFileSync(getUsersFile(), JSON.stringify(users, null, 2), 'utf-8');
}

function mapMongoUser(doc: Record<string, unknown>): UserRecord {
  return {
    id: String(doc._id),
    name: String(doc.name),
    email: String(doc.email),
    passwordHash: String(doc.passwordHash),
    githubUsername: doc.githubUsername ? String(doc.githubUsername) : undefined,
    resetOtpHash:
      typeof doc.resetOtpHash === 'string' && doc.resetOtpHash
        ? doc.resetOtpHash
        : null,
    resetOtpExpires: doc.resetOtpExpires
      ? new Date(doc.resetOtpExpires as Date).toISOString()
      : null,
    resetOtpAttempts:
      typeof doc.resetOtpAttempts === 'number' ? doc.resetOtpAttempts : 0,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}

function mapMongoDoc(doc: Record<string, unknown>): PortfolioDocument {
  return {
    id: String(doc._id),
    userId: doc.userId ? String(doc.userId) : undefined,
    username: String(doc.username),
    templateId: doc.templateId as PortfolioDocument['templateId'],
    careerTrack: doc.careerTrack as PortfolioDocument['careerTrack'],
    accentColor: String(doc.accentColor ?? '#2563EB'),
    profile: doc.profile as PortfolioDocument['profile'],
    topRepos: (doc.topRepos ?? []) as PortfolioDocument['topRepos'],
    languages: (doc.languages ?? []) as PortfolioDocument['languages'],
    activity: doc.activity as PortfolioDocument['activity'],
    aiContent: doc.aiContent as PortfolioDocument['aiContent'],
    customEmail: String(doc.customEmail ?? ''),
    availableForHire: Boolean(doc.availableForHire ?? true),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    if (usingMongo) {
      const doc = await UserModel.findOne({ email: normalized }).lean();
      return doc ? mapMongoUser(doc as unknown as Record<string, unknown>) : null;
    }
    const users = readLocalUsers();
    return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
  },

  async findById(id: string): Promise<UserRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await UserModel.findById(id).lean();
      return doc ? mapMongoUser(doc as unknown as Record<string, unknown>) : null;
    }
    const users = readLocalUsers();
    return users.find((u) => u.id === id) ?? null;
  },

  async create(payload: {
    name: string;
    email: string;
    passwordHash: string;
    githubUsername?: string;
  }): Promise<UserRecord> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (usingMongo) {
      const created = await UserModel.create({
        name: payload.name.trim(),
        email: normalizedEmail,
        passwordHash: payload.passwordHash,
        githubUsername: payload.githubUsername?.trim() || '',
      });
      return mapMongoUser(created.toObject() as unknown as Record<string, unknown>);
    }
    const now = new Date().toISOString();
    const user: UserRecord = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      email: normalizedEmail,
      passwordHash: payload.passwordHash,
      githubUsername: payload.githubUsername?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const users = readLocalUsers();
    users.push(user);
    writeLocalUsers(users);
    return user;
  },

  async setPasswordResetOtp(
    email: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    if (usingMongo) {
      const updated = await UserModel.findOneAndUpdate(
        { email: normalized },
        {
          $set: {
            resetOtpHash: otpHash,
            resetOtpExpires: expiresAt,
            resetOtpAttempts: 0,
          },
        },
        { new: true }
      ).lean();
      return updated
        ? mapMongoUser(updated as unknown as Record<string, unknown>)
        : null;
    }
    const users = readLocalUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      resetOtpHash: otpHash,
      resetOtpExpires: expiresAt.toISOString(),
      resetOtpAttempts: 0,
    };
    writeLocalUsers(users);
    return users[index];
  },

  async incrementResetOtpAttempts(id: string): Promise<UserRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { $inc: { resetOtpAttempts: 1 } },
        { new: true }
      ).lean();
      return updated
        ? mapMongoUser(updated as unknown as Record<string, unknown>)
        : null;
    }
    const users = readLocalUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      resetOtpAttempts: (users[index].resetOtpAttempts ?? 0) + 1,
    };
    writeLocalUsers(users);
    return users[index];
  },

  async findByResetOtpHash(otpHash: string): Promise<UserRecord | null> {
    if (usingMongo) {
      const doc = await UserModel.findOne({
        resetOtpHash: otpHash,
      }).lean();
      return doc ? mapMongoUser(doc as unknown as Record<string, unknown>) : null;
    }
    const users = readLocalUsers();
    return users.find((u) => u.resetOtpHash === otpHash) ?? null;
  },

  async updatePasswordAndClearResetOtp(
    id: string,
    passwordHash: string
  ): Promise<UserRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: { passwordHash },
          $unset: {
            resetOtpHash: 1,
            resetOtpExpires: 1,
            resetOtpAttempts: 1,
          },
        },
        { new: true }
      ).lean();
      return updated
        ? mapMongoUser(updated as unknown as Record<string, unknown>)
        : null;
    }
    const users = readLocalUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      passwordHash,
      resetOtpHash: null,
      resetOtpExpires: null,
      resetOtpAttempts: 0,
    };
    writeLocalUsers(users);
    return users[index];
  },
};

export type OwnedPortfolioResult =
  | { status: 'ok'; doc: PortfolioDocument }
  | { status: 'not_found' }
  | { status: 'forbidden' };

export const portfolioRepository = {
  async findAllByUser(userId: string): Promise<PortfolioDocument[]> {
    if (usingMongo) {
      const docs = await PortfolioModel.find({ userId }).sort({ updatedAt: -1 }).lean();
      return docs.map((d) => mapMongoDoc(d as unknown as Record<string, unknown>));
    }
    const items = readLocalPortfolios().filter((item) => item.userId === userId);
    return items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async findByIdForUser(id: string, userId: string): Promise<OwnedPortfolioResult> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return { status: 'not_found' };
      const raw = await PortfolioModel.findById(id).lean();
      if (!raw) return { status: 'not_found' };
      const mapped = mapMongoDoc(raw as unknown as Record<string, unknown>);
      if (mapped.userId !== userId) return { status: 'forbidden' };
      return { status: 'ok', doc: mapped };
    }
    const items = readLocalPortfolios();
    const found = items.find((item) => item.id === id);
    if (!found) return { status: 'not_found' };
    if (found.userId !== userId) return { status: 'forbidden' };
    return { status: 'ok', doc: found };
  },

  async create(
    payload: Omit<PortfolioDocument, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }
  ): Promise<PortfolioDocument> {
    if (usingMongo) {
      const created = await PortfolioModel.create(payload);
      return mapMongoDoc(created.toObject() as unknown as Record<string, unknown>);
    }
    const now = new Date().toISOString();
    const doc: PortfolioDocument = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const items = readLocalPortfolios();
    items.unshift(doc);
    writeLocalPortfolios(items);
    return doc;
  },

  async updateForUser(
    id: string,
    userId: string,
    updates: Partial<Omit<PortfolioDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<OwnedPortfolioResult> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return { status: 'not_found' };
      const existing = await PortfolioModel.findById(id).lean();
      if (!existing) return { status: 'not_found' };
      if (String((existing as Record<string, unknown>).userId) !== userId) {
        return { status: 'forbidden' };
      }
      const updated = await PortfolioModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();
      if (!updated) return { status: 'not_found' };
      return {
        status: 'ok',
        doc: mapMongoDoc(updated as unknown as Record<string, unknown>),
      };
    }
    const items = readLocalPortfolios();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return { status: 'not_found' };
    if (items[index].userId !== userId) return { status: 'forbidden' };
    const updated: PortfolioDocument = {
      ...items[index],
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    writeLocalPortfolios(items);
    return { status: 'ok', doc: updated };
  },

  async removeForUser(
    id: string,
    userId: string
  ): Promise<'ok' | 'not_found' | 'forbidden'> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return 'not_found';
      const existing = await PortfolioModel.findById(id).lean();
      if (!existing) return 'not_found';
      if (String((existing as Record<string, unknown>).userId) !== userId) {
        return 'forbidden';
      }
      await PortfolioModel.findByIdAndDelete(id);
      return 'ok';
    }
    const items = readLocalPortfolios();
    const existing = items.find((item) => item.id === id);
    if (!existing) return 'not_found';
    if (existing.userId !== userId) return 'forbidden';
    const next = items.filter((item) => item.id !== id);
    writeLocalPortfolios(next);
    return 'ok';
  },
};
