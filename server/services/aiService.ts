import { GoogleGenAI, Type } from '@google/genai';
import type {
  AIOptimizedContent,
  ActivitySummary,
  AnalyzedRepo,
  CareerTrack,
  GitHubProfile,
  LanguageBreakdown,
  ProjectNarrative,
} from '../../src/types/portfolio.ts';

const GEMINI_TEXT_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;

const REGENERATION_ANGLES = [
  'Emphasize concrete technical problem-solving, software architecture, and tools directly used in each repository.',
  'Emphasize user-facing product outcomes, reliability, and clear engineering execution for junior hiring managers.',
  'Emphasize code quality, API/data modeling, testing/deployment readiness, and real-world engineering impact.',
];

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your Gemini API key in Settings > Secrets to run AI content optimization.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isAIConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('fetch failed')
  );
}

export function extractReadableAIError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(raw.slice(jsonStart)) as {
        error?: { code?: number; message?: string; status?: string };
      };
      if (parsed.error?.code === 503 || parsed.error?.status === 'UNAVAILABLE') {
        return 'Gemini is experiencing a temporary traffic spike. Please wait a few seconds and click Retry AI.';
      }
      if (parsed.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return 'Gemini is experiencing a temporary traffic spike. Please wait a few seconds and click Retry AI.';
  }
  return raw;
}

export async function optimizePortfolioWithAI(params: {
  profile: GitHubProfile;
  topRepos: AnalyzedRepo[];
  languages: LanguageBreakdown[];
  activity: ActivitySummary;
  careerTrack?: CareerTrack;
  profileReadmeExcerpt?: string;
  variationIndex?: number;
}): Promise<AIOptimizedContent> {
  const ai = getAIClient();
  const {
    profile,
    topRepos,
    languages,
    activity,
    careerTrack,
    profileReadmeExcerpt,
    variationIndex = 0,
  } = params;

  const focusRole = careerTrack || activity.inferredFocus || 'Software Engineer';
  const angleInstruction =
    REGENERATION_ANGLES[variationIndex % REGENERATION_ANGLES.length];

  const coreLangsLabel =
    activity.topLanguages && activity.topLanguages.length > 0
      ? activity.topLanguages.join(', ')
      : activity.primaryLanguage;

  const repoContext = topRepos.map((repo) => ({
    name: repo.name,
    languagesUsed:
      repo.repoLanguages && repo.repoLanguages.length > 0
        ? repo.repoLanguages
        : repo.language
          ? [repo.language]
          : ['General'],
    detectedStack: repo.detectedStack ?? [],
    topics: repo.topics,
    stars: repo.stars,
    forks: repo.forks,
    lastPushed: repo.pushedAt,
    hasLiveDemo: Boolean(repo.homepage),
    description: repo.description,
    readmeExcerpt: repo.readmeExcerpt || 'No README excerpt available.',
  }));

  const prompt = `You are writing portfolio copy specifically for GitHub developer "${profile.name}" (@${profile.login}).

STRICT ACCURACY & GROUNDING RULES:
- Every claim, language, framework, and project summary MUST come strictly from the verified GitHub data below (their repositories, README excerpts, byte-weighted language distribution, topics, and bio).
- Respect the developer's full active stack. If they build across multiple languages (e.g., JavaScript alongside HTML/CSS, TypeScript alongside Python, or JavaScript alongside Java), reflect their actual stack accurately—do NOT reduce them to a single language if they use several, and NEVER confuse Java with JavaScript.
- Do NOT invent technologies, work history, companies, degrees, or user counts that do not appear in the GitHub data.
- Reference the developer's actual repository names and real stack naturally so the portfolio feels unmistakably tailored to @${profile.login}.
- Narrative Angle (${variationIndex > 0 ? `Regeneration pass #${variationIndex + 1}` : 'Initial pass'}): ${angleInstruction}

Verified GitHub Developer Profile:
- Name: ${profile.name} (@${profile.login})
- GitHub Bio: ${profile.bio || 'Not specified'}
- Profile README Excerpt: ${profileReadmeExcerpt || 'Not provided'}
- Location: ${profile.location || 'Remote'}
- Public Repos: ${profile.publicRepos} (Original non-fork repos: ${activity.originalReposCount ?? profile.publicRepos}), Total Stars: ${activity.totalStars}, Account Age: ${activity.accountYears} years
- Core Programming Languages (recency-weighted): ${coreLangsLabel}
- Full Language Distribution: ${languages.map((l) => `${l.language} (${l.percentage}%)`).join(', ')}
- Detected Technologies & Frameworks: ${(activity.detectedTechnologies ?? []).join(', ') || coreLangsLabel}
- Target Engineering Focus: ${focusRole}

Verified Top Repositories (with README excerpts & stack):
${JSON.stringify(repoContext, null, 2)}

Output Requirements:
1. headline: Specific, credible 6-11 word hero headline reflecting "${focusRole}" and their real core stack (${coreLangsLabel}). No clichés like "rockstar" or "passionate ninja".
2. bio: Concise 2-sentence professional bio grounded strictly in @${profile.login}'s verified repositories, languages, and focus.
3. pitchSummary: 1 clear sentence describing their engineering approach evidenced by their repositories.
4. highlightedSkills: Exactly 8 concrete technical skills verified in their languages, topics, or READMEs.
5. projects: For every repository in the list above, provide:
   - repoName: exact repository name
   - technicalHighlight: 4-8 word technical summary naming the real stack/pattern used in that repo (from its languages/README/topics)
   - impactSummary: 1-2 accurate sentences explaining what the repository actually builds or solves based on its description and README excerpt.`;

  let lastError: unknown = null;
  let selectedModel: string = GEMINI_TEXT_MODELS[0];
  let responseText = '';

  for (const model of GEMINI_TEXT_MODELS) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a precise technical portfolio editor. Summarize and elevate a developer’s real GitHub work using ONLY facts present in their GitHub profile, repository metadata, language breakdown, and README excerpts. Never hallucinate tools, features, or experience.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                bio: { type: Type.STRING },
                pitchSummary: { type: Type.STRING },
                highlightedSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      repoName: { type: Type.STRING },
                      impactSummary: { type: Type.STRING },
                      technicalHighlight: { type: Type.STRING },
                    },
                    required: ['repoName', 'impactSummary', 'technicalHighlight'],
                  },
                },
              },
              required: ['headline', 'bio', 'pitchSummary', 'highlightedSkills', 'projects'],
            },
          },
        });

        responseText = (response.text ?? '{}').trim();
        selectedModel = model;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (isTransientError(err) && attempt < maxAttempts) {
          await sleep(700 * attempt);
          continue;
        }
        break;
      }
    }

    if (!lastError) {
      break;
    }
    if (!isTransientError(lastError)) {
      break;
    }
  }

  if (lastError) {
    throw new Error(extractReadableAIError(lastError));
  }

  const parsed = JSON.parse(responseText) as {
    headline?: string;
    bio?: string;
    pitchSummary?: string;
    highlightedSkills?: string[];
    projects?: ProjectNarrative[];
  };

  const projectNarratives: Record<string, ProjectNarrative> = {};
  for (const item of parsed.projects ?? []) {
    if (item.repoName) {
      projectNarratives[item.repoName] = {
        repoName: item.repoName,
        impactSummary: item.impactSummary,
        technicalHighlight: item.technicalHighlight,
      };
    }
  }

  return {
    headline:
      parsed.headline ||
      `${focusRole} building with ${
        activity.topLanguages?.slice(0, 2).join(' & ') || activity.primaryLanguage
      }`,
    bio:
      parsed.bio ||
      `${profile.name} builds software across ${languages
        .slice(0, 3)
        .map((l) => l.language)
        .join(', ')} with ${profile.publicRepos} public repositories on GitHub.`,
    pitchSummary:
      parsed.pitchSummary ||
      'Focused on readable architecture, clean documentation, and shipping user-facing features.',
    highlightedSkills: (parsed.highlightedSkills ?? []).slice(0, 8),
    projectNarratives,
    generatedAt: new Date().toISOString(),
    modelUsed: selectedModel,
  };
}
