export type TemplateId =
  | 'editorial'
  | 'terminal'
  | 'bento'
  | 'architect'
  | 'spotlight'
  | 'blueprint'
  | 'minimal'
  | 'matrix'
  | 'newspaper'
  | 'slate'
  | 'cards'
  | 'splitdark';

export type CareerTrack = string;

export interface GitHubProfile {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface AnalyzedRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  updatedAt: string;
  pushedAt: string;
  isFork: boolean;
  relevanceScore: number;
  repoLanguages?: string[];
  detectedStack?: string[];
  readmeExcerpt?: string;
}

export interface LanguageBreakdown {
  language: string;
  repoCount: number;
  percentage: number;
  color: string;
}

export interface ActivitySummary {
  recentEventsCount: number;
  pushEventsCount: number;
  prEventsCount: number;
  activeDaysLast30: number;
  totalStars: number;
  totalForks: number;
  primaryLanguage: string;
  topLanguages?: string[];
  inferredFocus: string;
  accountYears: number;
  originalReposCount?: number;
  detectedTechnologies?: string[];
}

export interface GitHubAnalysisResult {
  profile: GitHubProfile;
  topRepos: AnalyzedRepo[];
  languages: LanguageBreakdown[];
  activity: ActivitySummary;
  profileReadmeExcerpt?: string;
  analyzedAt: string;
}

export interface ProjectNarrative {
  repoName: string;
  impactSummary: string;
  technicalHighlight: string;
}

export interface AIOptimizedContent {
  headline: string;
  bio: string;
  pitchSummary: string;
  highlightedSkills: string[];
  projectNarratives: Record<string, ProjectNarrative>;
  generatedAt: string;
  modelUsed: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PortfolioDocument {
  id: string;
  userId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface HealthStatus {
  status: 'ok';
  database: 'mongodb' | 'local-store';
  aiConfigured: boolean;
  timestamp: string;
}
