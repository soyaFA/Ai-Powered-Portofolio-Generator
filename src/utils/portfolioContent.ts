import type {
  AIOptimizedContent,
  GitHubAnalysisResult,
  ProjectNarrative,
  TemplateId,
} from '../types/portfolio';


export function buildGitHubBaselineContent(
  analysis: GitHubAnalysisResult
): AIOptimizedContent {
  const topLangs = analysis.languages.map((l) => l.language);
  const coreStack =
    analysis.activity.topLanguages && analysis.activity.topLanguages.length > 0
      ? analysis.activity.topLanguages.slice(0, 2).join(' & ')
      : analysis.activity.primaryLanguage;

  const projectNarratives: Record<string, ProjectNarrative> = {};
  for (const repo of analysis.topRepos) {
    const repoStack =
      repo.detectedStack && repo.detectedStack.length > 0
        ? repo.detectedStack.slice(0, 3).join(' · ')
        : repo.repoLanguages && repo.repoLanguages.length > 0
          ? repo.repoLanguages.slice(0, 3).join(' · ')
          : repo.language;

    projectNarratives[repo.name] = {
      repoName: repo.name,
      technicalHighlight: repoStack
        ? `Built with ${repoStack}${repo.topics[0] ? ` · ${repo.topics[0]}` : ''}`
        : 'Open-source repository',
      impactSummary: repo.description,
    };
  }

  const detectedSkills = Array.from(
    new Set([
      ...(analysis.activity.detectedTechnologies ?? []),
      ...topLangs,
      'Git & GitHub',
    ])
  );

  return {
    headline: `${analysis.activity.inferredFocus} with ${coreStack}`,
    bio:
      analysis.profile.bio ||
      `${analysis.profile.name} has shipped ${analysis.activity.originalReposCount ?? analysis.profile.publicRepos} original repositories on GitHub with a focus on ${analysis.activity.inferredFocus}.`,
    pitchSummary: `Focused on ${analysis.activity.inferredFocus} across ${topLangs.slice(0, 3).join(', ') || coreStack}.`,
    highlightedSkills:
      detectedSkills.length > 0
        ? detectedSkills.slice(0, 8)
        : ['Software Engineering', 'Git & GitHub', 'Documentation'],
    projectNarratives,
    generatedAt: new Date().toISOString(),
    modelUsed: 'github-metadata',
  };
}


export function defaultAccentForTemplate(templateId: TemplateId): string {
  if (
    templateId === 'bento' ||
    templateId === 'architect' ||
    templateId === 'blueprint' ||
    templateId === 'cards'
  ) {
    return '#2563EB';
  }
  if (templateId === 'spotlight') return '#D97706';
  if (templateId === 'matrix') return '#10B981';
  if (templateId === 'slate' || templateId === 'splitdark') return '#0284C7';
  return '#0F172A';
}