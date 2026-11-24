import mongoose, { Schema, Document } from 'mongoose';
import type {
  TemplateId,
  CareerTrack,
  GitHubProfile,
  AnalyzedRepo,
  LanguageBreakdown,
  ActivitySummary,
  AIOptimizedContent,
} from '../../src/types/portfolio.ts';

export interface PortfolioMongooseDoc extends Document {
  userId: string;
  username: string;
  templateId: TemplateId;
  careerTrack: CareerTrack;
  accentColor: string;
  profile: GitHubProfile;
  topRepos: AnalyzedRepo[];
  languages: LanguageBreakdown[];
  activity: ActivitySummary;
  aiContent: AIOptimizedContent;
  customEmail: string;
  availableForHire: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<PortfolioMongooseDoc>(
  {
    userId: { type: String, required: true, index: true, trim: true },
    username: { type: String, required: true, index: true, trim: true },
    templateId: {
      type: String,
      enum: [
        'editorial',
        'terminal',
        'bento',
        'architect',
        'spotlight',
        'blueprint',
        'minimal',
        'matrix',
        'newspaper',
        'slate',
        'cards',
        'splitdark',
      ],
      required: true,
      default: 'editorial',
    },
    careerTrack: {
      type: String,
      required: true,
      default: 'Software Engineering',
    },
    accentColor: { type: String, default: '#2563EB' },
    profile: { type: Schema.Types.Mixed, required: true },
    topRepos: { type: [Schema.Types.Mixed] as unknown as AnalyzedRepo[], default: [] },
    languages: {
      type: [Schema.Types.Mixed] as unknown as LanguageBreakdown[],
      default: [],
    },
    activity: { type: Schema.Types.Mixed, required: true },
    aiContent: { type: Schema.Types.Mixed, required: true },
    customEmail: { type: String, default: '' },
    availableForHire: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PortfolioModel =
  mongoose.models.Portfolio ||
  mongoose.model<PortfolioMongooseDoc>('Portfolio', PortfolioSchema);
