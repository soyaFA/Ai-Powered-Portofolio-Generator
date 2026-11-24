import type { ActivitySummary, AnalyzedRepo, LanguageBreakdown } from '../types/portfolio';

export function formatCoreStack(
  activity: ActivitySummary,
  languages: LanguageBreakdown[] = [],
  limit = 2
): string {
  if (activity.topLanguages && activity.topLanguages.length > 0) {
    return activity.topLanguages.slice(0, limit).join(' · ');
  }
  if (languages.length > 0) {
    return languages
      .slice(0, limit)
      .map((l) => l.language)
      .join(' · ');
  }
  return activity.primaryLanguage || 'General';
}

export function formatRepoLanguages(repo: AnalyzedRepo, limit = 2): string {
  if (repo.repoLanguages && repo.repoLanguages.length > 0) {
    return repo.repoLanguages.slice(0, limit).join(' · ');
  }
  return repo.language || 'Code';
}
