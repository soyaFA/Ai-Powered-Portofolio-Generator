import fs from 'fs';
import path from 'path';
import type {
  ActivitySummary,
  AnalyzedRepo,
  GitHubAnalysisResult,
  GitHubProfile,
  LanguageBreakdown,
} from '../../src/types/portfolio.ts';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#EAB308',
  Python: '#3572A5',
  HTML: '#E34C26',
  CSS: '#563D7C',
  SCSS: '#C6538C',
  Java: '#B07219',
  'C#': '#178600',
  'C++': '#F34B7D',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#DEA584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89E051',
  Vue: '#41B883',
  Svelte: '#FF3E00',
  Dockerfile: '#384D54',
  'Jupyter Notebook': '#DA5B0B',
  Blade: '#F7523F',
};

const NON_PROGRAMMING_LANGUAGES = new Set([
  'HTML',
  'CSS',
  'SCSS',
  'Less',
  'Sass',
  'Shell',
  'PowerShell',
  'Batchfile',
  'Dockerfile',
  'Makefile',
  'CMake',
  'Procfile',
  'Markdown',
  'TeX',
  'Rich Text Format',
]);

const TECH_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'React', regex: /\breact(\.js|js)?\b/i },
  { name: 'Next.js', regex: /\bnext(\.js|js)\b/i },
  { name: 'Vue', regex: /\bvue(\.js|js)?\b/i },
  { name: 'Angular', regex: /\bangular\b/i },
  { name: 'Svelte', regex: /\bsvelte(kit)?\b/i },
  { name: 'Node.js', regex: /\bnode(\.js|js)\b/i },
  { name: 'Express', regex: /\bexpress(\.js|js)?\b/i },
  { name: 'NestJS', regex: /\bnest(\.js|js)\b/i },
  { name: 'MongoDB', regex: /\bmongo(db)?\b/i },
  { name: 'Mongoose', regex: /\bmongoose\b/i },
  { name: 'PostgreSQL', regex: /\bpostgres(ql)?\b/i },
  { name: 'MySQL', regex: /\bmysql\b/i },
  { name: 'Redis', regex: /\bredis\b/i },
  { name: 'Docker', regex: /\bdocker(-compose)?\b/i },
  { name: 'Tailwind CSS', regex: /\btailwind(css)?\b/i },
  { name: 'Bootstrap', regex: /\bbootstrap\b/i },
  { name: 'TypeScript', regex: /\btypescript\b/i },
  { name: 'JavaScript', regex: /\bjavascript\b/i },
  { name: 'GraphQL', regex: /\bgraphql\b/i },
  { name: 'REST API', regex: /\brest(ful)?\s*api\b/i },
  { name: 'JWT Auth', regex: /\bjwt\b/i },
  { name: 'Socket.IO', regex: /\bsocket\.?io\b/i },
  { name: 'Prisma', regex: /\bprisma\b/i },
  { name: 'Vite', regex: /\bvite\b/i },
  { name: 'Django', regex: /\bdjango\b/i },
  { name: 'FastAPI', regex: /\bfastapi\b/i },
  { name: 'Flask', regex: /\bflask\b/i },
  { name: 'Spring Boot', regex: /\bspring\s*boot\b/i },
  { name: 'Laravel', regex: /\blaravel\b/i },
  { name: '.NET', regex: /\b(asp\.net|\.net\s*core)\b/i },
  { name: 'Flutter', regex: /\bflutter\b/i },
  { name: 'Firebase', regex: /\bfirebase\b/i },
  { name: 'Redux', regex: /\bredux\b/i },
  { name: 'Jest / Vitest', regex: /\b(jest|vitest)\b/i },
  { name: 'GitHub Actions', regex: /\bgithub\s*actions\b/i },
];

export interface RawGitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface RawGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export interface RawGitHubEvent {
  type: string;
  created_at: string;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&nbsp;', ' ');
}

export function parseCompactCount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, '').trim().toLowerCase();
  if (!cleaned) return 0;
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num)) return 0;
  if (cleaned.endsWith('k')) return Math.round(num * 1000);
  if (cleaned.endsWith('m')) return Math.round(num * 1_000_000);
  return Math.round(num);
}

export function computeRecencyMultiplier(
  pushedAt: string | undefined,
  updatedAt: string,
  archived: boolean
): number {
  const refDate = pushedAt || updatedAt;
  const daysSince = Math.max(0, (Date.now() - new Date(refDate).getTime()) / (1000 * 60 * 60 * 24));
  let weight = 0.5;
  if (daysSince <= 90) weight = 1.75;
  else if (daysSince <= 365) weight = 1.25;
  else if (daysSince <= 730) weight = 0.85;
  return archived ? weight * 0.5 : weight;
}

function getGitHubHeaders(rawAccept = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: rawAccept ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
    'User-Agent': 'Repo2Folio-App',
  };
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  }
  return headers;
}

export function cleanReadmeText(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`~_-]{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 850);
}

export function extractTechStack(textSources: string[], languages: string[]): string[] {
  const combined = textSources.join(' ');
  const found = new Set<string>();
  for (const lang of languages) {
    if (lang && lang !== 'Dockerfile') {
      found.add(lang);
    }
  }
  for (const pattern of TECH_PATTERNS) {
    if (pattern.regex.test(combined)) {
      found.add(pattern.name);
    }
  }
  return Array.from(found).slice(0, 10);
}

export function computeRepoRelevance(repo: RawGitHubRepo, usernameLower: string): number {
  const isProfileReadme = repo.name.toLowerCase() === usernameLower;
  if (isProfileReadme) return -500;

  const daysSincePush = Math.max(
    0,
    (Date.now() - new Date(repo.pushed_at || repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyBonus = Math.max(0, 42 - Math.min(42, daysSincePush / 8));
  const starWeight = Math.min(
    60,
    Math.log10(repo.stargazers_count + 1) * 28 + repo.stargazers_count * 1.5
  );
  const forkWeight = Math.min(24, Math.log10(repo.forks_count + 1) * 14);
  const sizeBonus = repo.size > 20 ? 8 : 0;
  const docsBonus =
    (repo.description && repo.description.trim().length > 10 ? 14 : 0) +
    (repo.homepage ? 12 : 0) +
    (repo.topics && repo.topics.length > 0 ? 10 : 0);
  const forkPenalty = repo.fork ? -45 : 20;
  const archivePenalty = repo.archived ? -25 : 0;

  return Math.round(
    recencyBonus + starWeight + forkWeight + sizeBonus + docsBonus + forkPenalty + archivePenalty
  );
}

export function inferEngineeringFocus(
  languages: LanguageBreakdown[],
  detectedTech: string[],
  repos: AnalyzedRepo[]
): string {
  const langShare = new Map<string, number>();
  for (const item of languages) {
    langShare.set(item.language.toLowerCase(), item.percentage);
  }

  const techSet = new Set([
    ...languages.map((l) => l.language.toLowerCase()),
    ...detectedTech.map((t) => t.toLowerCase()),
  ]);

  const corpus = repos
    .map((r) => `${r.name} ${r.description} ${r.readmeExcerpt ?? ''} ${r.topics.join(' ')}`.toLowerCase())
    .join(' ');

  let frontendScore = 0;
  let backendScore = 0;
  let mobileScore = 0;
  let dataAiScore = 0;
  let systemsScore = 0;

  frontendScore +=
    (langShare.get('html') ?? 0) * 1.2 +
    (langShare.get('css') ?? 0) * 1.2 +
    (langShare.get('scss') ?? 0) * 1.2;
  frontendScore += (langShare.get('vue') ?? 0) * 1.5 + (langShare.get('svelte') ?? 0) * 1.5;

  const jsTsShare = (langShare.get('javascript') ?? 0) + (langShare.get('typescript') ?? 0);
  if (
    techSet.has('react') ||
    techSet.has('next.js') ||
    techSet.has('vue') ||
    techSet.has('angular') ||
    techSet.has('redux') ||
    techSet.has('tailwind css') ||
    techSet.has('bootstrap')
  ) {
    frontendScore += jsTsShare * 0.8 + 25;
  } else {
    frontendScore += jsTsShare * 0.4;
  }

  const backendLangShare =
    (langShare.get('go') ?? 0) * 0.7 +
    (langShare.get('java') ?? 0) * 0.7 +
    (langShare.get('c#') ?? 0) * 0.7 +
    (langShare.get('php') ?? 0) * 0.8 +
    (langShare.get('ruby') ?? 0) * 0.8;
  backendScore += backendLangShare;

  const backendTechs = [
    'express',
    'node.js',
    'nestjs',
    'mongodb',
    'mongoose',
    'postgresql',
    'mysql',
    'redis',
    'django',
    'fastapi',
    'flask',
    'spring boot',
    'docker',
    'prisma',
    'graphql',
    'rest api',
  ];
  for (const t of backendTechs) {
    if (techSet.has(t)) backendScore += 18;
  }
  if (corpus.includes('rest api') || corpus.includes('backend') || corpus.includes('microservice')) {
    backendScore += 15;
  }

  const mobileLangShare =
    (langShare.get('dart') ?? 0) * 1.5 +
    (langShare.get('swift') ?? 0) * 1.1 +
    (langShare.get('kotlin') ?? 0) * 1.1;
  if (mobileLangShare >= 20) {
    mobileScore += mobileLangShare;
  }
  if (techSet.has('flutter')) mobileScore += 35;
  if (corpus.includes('react native') || corpus.includes('android') || corpus.includes('ios app')) {
    mobileScore += 25;
  }

  const pyShare = langShare.get('python') ?? 0;
  if (
    pyShare >= 20 &&
    (corpus.includes('machine learning') ||
      corpus.includes('pandas') ||
      corpus.includes('pytorch') ||
      corpus.includes('tensorflow') ||
      corpus.includes('data analysis') ||
      corpus.includes('scikit'))
  ) {
    dataAiScore += pyShare + 30;
  }

  const sysShare = (langShare.get('rust') ?? 0) + (langShare.get('c++') ?? 0) + (langShare.get('c') ?? 0);
  if (sysShare >= 25) {
    systemsScore += sysShare;
  }

  if (frontendScore >= 25 && backendScore >= 25) {
    return 'Full-Stack Web Engineering';
  }

  const ranked = [
    { label: 'Frontend & UI Engineering', score: frontendScore },
    { label: 'Backend & API Engineering', score: backendScore },
    { label: 'Mobile App Engineering', score: mobileScore },
    { label: 'Python & Data / AI Engineering', score: dataAiScore },
    { label: 'Systems & CLI Engineering', score: systemsScore },
  ].sort((a, b) => b.score - a.score);

  return ranked[0].score >= 15 ? ranked[0].label : 'Software Engineering';
}

async function fetchRawReadme(fullName: string): Promise<string> {
  const candidates = [
    `https://raw.githubusercontent.com/${fullName}/HEAD/README.md`,
    `https://raw.githubusercontent.com/${fullName}/HEAD/readme.md`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Repo2Folio-App' } });
      if (res.ok) {
        const text = await res.text();
        if (text.trim().length > 0) {
          return cleanReadmeText(text);
        }
      }
    } catch {
    }
  }
  return '';
}

async function fetchRepoEnrichment(
  fullName: string,
  allowApiLanguages: boolean
): Promise<{ repoLanguages: Record<string, number>; readmeExcerpt: string; topics?: string[] }> {
  try {
    const readmePromise = fetchRawReadme(fullName);
    const langPromise = allowApiLanguages
      ? fetch(`https://api.github.com/repos/${fullName}/languages`, {
          headers: getGitHubHeaders(false),
        })
          .then(async (res) => (res.ok ? ((await res.json()) as Record<string, number>) : {}))
          .catch(() => ({}))
      : Promise.resolve({});

    const [readmeFromRaw, repoLanguages] = await Promise.all([readmePromise, langPromise]);
    if (readmeFromRaw) {
      return { repoLanguages, readmeExcerpt: readmeFromRaw };
    }

    const pageRes = await fetch(`https://github.com/${fullName}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FolioForge/1.0)' },
    }).catch(() => null);
    if (!pageRes || !pageRes.ok) {
      return { repoLanguages, readmeExcerpt: '' };
    }
    const html = await pageRes.text();
    const topics = Array.from(
      new Set(
        [...html.matchAll(/href="\/topics\/([^"?#/]+)"/g)].map((m) => decodeHtmlEntities(m[1]))
      )
    ).slice(0, 6);
    const mdMatch = html.match(/<article[^>]*class="[^"]*markdown-body[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
    const readmeExcerpt = mdMatch ? cleanReadmeText(decodeHtmlEntities(mdMatch[1])) : '';
    return { repoLanguages, readmeExcerpt, topics };
  } catch {
    return { repoLanguages: {}, readmeExcerpt: '' };
  }
}

export function parseGitHubPublicHtml(
  html: string,
  username: string
): { rawUser: RawGitHubUser; rawRepos: RawGitHubRepo[] } {
  const nameMatch = html.match(/itemprop="name"[^>]*>([\s\S]*?)<\/span>/);
  const bioMatch = html.match(/data-bio-text[^>]*>([\s\S]*?)<\/div>/);
  const avatarMatch = html.match(/https:\/\/avatars\.githubusercontent\.com\/u\/\d+[^"'\s]*/);
  const locationMatch = html.match(/itemprop="homeLocation"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
  const followersMatch = html.match(/tab=followers[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
  const followingMatch = html.match(/tab=following[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
  const reposCountMatch = html.match(/tab=repositories[\s\S]*?<span[^>]*Counter[^>]*>([\s\S]*?)<\/span>/);

  const cleanBio = bioMatch
    ? decodeHtmlEntities(bioMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    : null;
  const cleanName = nameMatch ? decodeHtmlEntities(nameMatch[1].trim()) : username;

  const repoBlocks = html.split(/<li[^>]*itemprop="owns"/).slice(1);
  const rawRepos: RawGitHubRepo[] = [];

  for (let i = 0; i < repoBlocks.length; i += 1) {
    const block = repoBlocks[i];
    const repoName = block.match(/itemprop="name codeRepository"[^>]*>([\s\S]*?)<\/a>/)?.[1]?.trim();
    if (!repoName) continue;
    const descRaw = block.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/)?.[1];
    const description = descRaw
      ? decodeHtmlEntities(descRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      : null;
    const language = block.match(/itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim() || null;
    const stars = parseCompactCount(
      block.match(/\/stargazers"[\s\S]*?<\/svg>([\s\S]*?)<\/a>/)?.[1]
    );
    const forks = parseCompactCount(
      block.match(/\/forks"[\s\S]*?<\/svg>([\s\S]*?)<\/a>/)?.[1]
    );
    const updatedAt =
      block.match(/relative-time[^>]*datetime="([^"]+)"/)?.[1] || new Date().toISOString();
    const isFork = block.includes('Forked from');
    const topics = Array.from(
      new Set([...block.matchAll(/href="\/topics\/([^"?#/]+)"/g)].map((m) => decodeHtmlEntities(m[1])))
    ).slice(0, 6);

    rawRepos.push({
      id: 100000 + i,
      name: decodeHtmlEntities(repoName),
      full_name: `${username}/${decodeHtmlEntities(repoName)}`,
      description,
      html_url: `https://github.com/${username}/${encodeURIComponent(repoName)}`,
      homepage: null,
      language,
      topics,
      stargazers_count: stars,
      forks_count: forks,
      watchers_count: stars,
      open_issues_count: 0,
      size: 120,
      updated_at: updatedAt,
      pushed_at: updatedAt,
      fork: isFork,
      archived: block.includes('Archived'),
    });
  }

  const publicRepos = Math.max(
    parseCompactCount(reposCountMatch?.[1]),
    rawRepos.length
  );

  return {
    rawUser: {
      login: username,
      name: cleanName || username,
      avatar_url: avatarMatch?.[0] || `https://github.com/${username}.png`,
      bio: cleanBio || null,
      company: null,
      location: locationMatch ? decodeHtmlEntities(locationMatch[1].trim()) : null,
      blog: null,
      html_url: `https://github.com/${username}`,
      public_repos: publicRepos,
      followers: parseCompactCount(followersMatch?.[1]),
      following: parseCompactCount(followingMatch?.[1]),
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    rawRepos,
  };
}

function parseAtomActivity(atomXml: string): RawGitHubEvent[] {
  const events: RawGitHubEvent[] = [];
  const entries = atomXml.split('<entry>').slice(1, 31);
  for (const entry of entries) {
    const published =
      entry.match(/<published>([^<]+)<\/published>/)?.[1] ||
      entry.match(/<updated>([^<]+)<\/updated>/)?.[1] ||
      new Date().toISOString();
    const isPr = /PullRequestEvent|pull request/i.test(entry);
    events.push({
      type: isPr ? 'PullRequestEvent' : 'PushEvent',
      created_at: published,
    });
  }
  return events;
}

const ANALYSIS_CACHE_TTL_MS = 60 * 60 * 1000; 
let cacheDir = path.resolve(process.cwd(), 'data');
const analysisCache = new Map<string, { result: GitHubAnalysisResult; expiresAt: number }>();

export function setGitHubCacheDir(dir: string): void {
  cacheDir = dir;
}

export function clearGitHubCache(): void {
  analysisCache.clear();
}

function getCacheFilePath(): string {
  return path.join(cacheDir, 'github-cache.json');
}

function readDiskCacheEntry(
  cacheKey: string,
  allowStale = false
): GitHubAnalysisResult | null {
  try {
    const file = getCacheFilePath();
    if (!fs.existsSync(file)) return null;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<
      string,
      { result: GitHubAnalysisResult; expiresAt: number }
    >;
    const entry = parsed[cacheKey];
    if (!entry) return null;
    if (allowStale || entry.expiresAt > Date.now()) {
      return entry.result;
    }
    return null;
  } catch {
    return null;
  }
}

function writeDiskCacheEntry(cacheKey: string, result: GitHubAnalysisResult, expiresAt: number): void {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const file = getCacheFilePath();
    let store: Record<string, { result: GitHubAnalysisResult; expiresAt: number }> = {};
    if (fs.existsSync(file)) {
      try {
        store = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch {
        store = {};
      }
    }
    store[cacheKey] = { result, expiresAt };
    fs.writeFileSync(file, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
   
  }
}

async function buildAnalysisResult(params: {
  rawUser: RawGitHubUser;
  rawRepos: RawGitHubRepo[];
  rawEvents: RawGitHubEvent[];
  profileReadmeExcerpt?: string;
  allowApiLanguages: boolean;
}): Promise<GitHubAnalysisResult> {
  const { rawUser, rawRepos, rawEvents, profileReadmeExcerpt, allowApiLanguages } = params;

  const profile: GitHubProfile = {
    login: rawUser.login,
    name: rawUser.name || rawUser.login,
    avatarUrl: rawUser.avatar_url,
    bio: rawUser.bio,
    company: rawUser.company,
    location: rawUser.location,
    blog: rawUser.blog,
    htmlUrl: rawUser.html_url,
    publicRepos: rawUser.public_repos,
    followers: rawUser.followers,
    following: rawUser.following,
    createdAt: rawUser.created_at,
  };

  const usernameLower = rawUser.login.toLowerCase();
  const nonProfileRepos = rawRepos.filter((r) => r.name.toLowerCase() !== usernameLower);
  const originalRepos = nonProfileRepos.filter((r) => !r.fork);
  const pool =
    originalRepos.length >= 2
      ? originalRepos
      : nonProfileRepos.length > 0
        ? nonProfileRepos
        : rawRepos;

  const rankedRawRepos = [...pool]
    .sort((a, b) => computeRepoRelevance(b, usernameLower) - computeRepoRelevance(a, usernameLower))
    .slice(0, 6);

  const enrichLimit = 4;
  const emptyEnrichment = (): {
    repoLanguages: Record<string, number>;
    readmeExcerpt: string;
    topics?: string[];
  } => ({
    repoLanguages: {},
    readmeExcerpt: '',
  });

  const enrichments = await Promise.all(
    rankedRawRepos.map((repo, idx) =>
      idx < enrichLimit
        ? fetchRepoEnrichment(repo.full_name, allowApiLanguages)
        : Promise.resolve(emptyEnrichment())
    )
  );

  const normalizedLangWeights = new Map<string, number>();
  const programmingLangWeights = new Map<string, number>();
  const globalRepoCounts = new Map<string, number>();
  const recencyRepoCounts = new Map<string, number>();

  for (const repo of pool) {
    if (repo.language) {
      globalRepoCounts.set(repo.language, (globalRepoCounts.get(repo.language) ?? 0) + 1);
      const recency = computeRecencyMultiplier(repo.pushed_at, repo.updated_at, repo.archived);
      recencyRepoCounts.set(repo.language, (recencyRepoCounts.get(repo.language) ?? 0) + recency);
    }
  }

  const allDetectedTech = new Set<string>();

  const topRepos: AnalyzedRepo[] = rankedRawRepos.map((repo, index) => {
    const enrichment = enrichments[index];
    const recency = computeRecencyMultiplier(repo.pushed_at, repo.updated_at, repo.archived);
    const repoLangEntries = Object.entries(enrichment.repoLanguages).sort((a, b) => b[1] - a[1]);
    const repoTotalBytes = repoLangEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

    const progEntries = repoLangEntries.filter(([lang]) => !NON_PROGRAMMING_LANGUAGES.has(lang));
    const progTotalBytes = progEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

    if (repoTotalBytes > 0) {
      for (const [lang, bytes] of repoLangEntries) {
        const share = bytes / repoTotalBytes;
        normalizedLangWeights.set(lang, (normalizedLangWeights.get(lang) ?? 0) + share * recency);
      }
      if (progTotalBytes > 0) {
        for (const [lang, bytes] of progEntries) {
          const progShare = bytes / progTotalBytes;
          programmingLangWeights.set(
            lang,
            (programmingLangWeights.get(lang) ?? 0) + progShare * recency
          );
        }
      }
    } else if (repo.language) {
      normalizedLangWeights.set(
        repo.language,
        (normalizedLangWeights.get(repo.language) ?? 0) + recency
      );
      if (!NON_PROGRAMMING_LANGUAGES.has(repo.language)) {
        programmingLangWeights.set(
          repo.language,
          (programmingLangWeights.get(repo.language) ?? 0) + recency
        );
      }
    }

    const repoLanguages = repoLangEntries.map(([lang]) => lang).slice(0, 4);
    const mergedTopics =
      Array.isArray(repo.topics) && repo.topics.length > 0
        ? repo.topics.slice(0, 6)
        : (enrichment.topics ?? []).slice(0, 6);

    const detectedStack = extractTechStack(
      [repo.name, repo.description ?? '', enrichment.readmeExcerpt, mergedTopics.join(' ')],
      repoLanguages.length > 0 ? repoLanguages : repo.language ? [repo.language] : []
    );

    for (const tech of detectedStack) {
      allDetectedTech.add(tech);
    }

    const firstProgrammingLang = repoLanguages.find((l) => !NON_PROGRAMMING_LANGUAGES.has(l));
    const displayLanguage =
      repo.language && !NON_PROGRAMMING_LANGUAGES.has(repo.language)
        ? repo.language
        : firstProgrammingLang || repo.language || repoLanguages[0] || null;

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description:
        repo.description?.trim() ||
        (enrichment.readmeExcerpt
          ? enrichment.readmeExcerpt.slice(0, 160)
          : `Software project built with ${displayLanguage || 'modern tooling'} and hosted on GitHub.`),
      htmlUrl: repo.html_url,
      homepage: repo.homepage && repo.homepage.trim().length > 0 ? repo.homepage : null,
      language: displayLanguage,
      topics: mergedTopics,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      isFork: repo.fork,
      relevanceScore: computeRepoRelevance(repo, usernameLower),
      repoLanguages:
        repoLanguages.length > 0 ? repoLanguages : displayLanguage ? [displayLanguage] : [],
      detectedStack,
      readmeExcerpt: enrichment.readmeExcerpt || undefined,
    };
  });

  const blendedScores = new Map<string, number>();
  for (const [lang, weight] of normalizedLangWeights.entries()) {
    blendedScores.set(lang, (blendedScores.get(lang) ?? 0) + weight * 2.2);
  }
  for (const [lang, recencyCount] of recencyRepoCounts.entries()) {
    blendedScores.set(lang, (blendedScores.get(lang) ?? 0) + recencyCount * 0.75);
  }

  const topSix = Array.from(blendedScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const topSixTotal = topSix.reduce((sum, [, s]) => sum + s, 0);

  const languages: LanguageBreakdown[] = topSix.map(([language, score]) => ({
    language,
    repoCount: globalRepoCounts.get(language) ?? 1,
    percentage: topSixTotal > 0 ? Math.max(1, Math.round((score / topSixTotal) * 100)) : 0,
    color: LANGUAGE_COLORS[language] || '#64748B',
  }));

  const progBlendedScores = new Map<string, number>();
  for (const [lang, weight] of programmingLangWeights.entries()) {
    progBlendedScores.set(lang, (progBlendedScores.get(lang) ?? 0) + weight * 2.2);
  }
  for (const [lang, recencyCount] of recencyRepoCounts.entries()) {
    if (!NON_PROGRAMMING_LANGUAGES.has(lang)) {
      progBlendedScores.set(lang, (progBlendedScores.get(lang) ?? 0) + recencyCount * 0.85);
    }
  }

  const rankedProgrammingLangs = Array.from(progBlendedScores.entries()).sort((a, b) => b[1] - a[1]);
  const topProgScore = rankedProgrammingLangs[0]?.[1] ?? 0;

  let topLanguages: string[] = [];
  if (rankedProgrammingLangs.length > 0 && topProgScore > 0) {
    topLanguages = rankedProgrammingLangs
      .filter(([, score], idx) => idx === 0 || (idx <= 2 && score >= topProgScore * 0.28))
      .map(([lang]) => lang);
  } else if (languages.length > 0) {
    topLanguages = languages.slice(0, 2).map((l) => l.language);
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentActiveDays = new Set<string>();
  let pushEventsCount = 0;
  let prEventsCount = 0;

  for (const ev of rawEvents) {
    if (ev.type === 'PushEvent') pushEventsCount += 1;
    if (ev.type === 'PullRequestEvent') prEventsCount += 1;
    const ts = new Date(ev.created_at).getTime();
    if (ts >= thirtyDaysAgo) {
      recentActiveDays.add(ev.created_at.slice(0, 10));
    }
  }

  const totalStars = rawRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = rawRepos.reduce((sum, r) => sum + r.forks_count, 0);
  const accountYears = Math.max(
    1,
    Math.round(
      ((Date.now() - new Date(rawUser.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)) * 10
    ) / 10
  );

  if (profileReadmeExcerpt) {
    for (const tech of extractTechStack([profileReadmeExcerpt], [])) {
      allDetectedTech.add(tech);
    }
  }

  const detectedTechnologies = Array.from(allDetectedTech).slice(0, 12);

  const activity: ActivitySummary = {
    recentEventsCount: rawEvents.length,
    pushEventsCount,
    prEventsCount,
    activeDaysLast30: recentActiveDays.size,
    totalStars,
    totalForks,
    primaryLanguage: topLanguages[0] || languages[0]?.language || 'General',
    topLanguages,
    inferredFocus: inferEngineeringFocus(languages, detectedTechnologies, topRepos),
    accountYears,
    originalReposCount: originalRepos.length,
    detectedTechnologies,
  };

  return {
    profile,
    topRepos,
    languages,
    activity,
    profileReadmeExcerpt,
    analyzedAt: new Date().toISOString(),
  };
}

async function analyzeGitHubFromPublicWeb(cleanUser: string): Promise<GitHubAnalysisResult> {
  const webHeaders = {
    'User-Agent': 'Mozilla/5.0 (compatible; FolioForge/1.0)',
    Accept: 'text/html,application/xhtml+xml',
  };

  const [sourcePageRes, atomRes, profileReadmeText] = await Promise.all([
    fetch(`https://github.com/${encodeURIComponent(cleanUser)}?tab=repositories&type=source`, {
      headers: webHeaders,
    }),
    fetch(`https://github.com/${encodeURIComponent(cleanUser)}.atom`, {
      headers: { 'User-Agent': 'Repo2Folio-App' },
    }).catch(() => null),
    fetchRawReadme(`${cleanUser}/${cleanUser}`),
  ]);

  if (sourcePageRes.status === 404) {
    throw new Error(`GitHub user "${cleanUser}" was not found.`);
  }
  if (!sourcePageRes.ok) {
    throw new Error(`Unable to load GitHub profile (${sourcePageRes.status}).`);
  }

  const sourceHtml = await sourcePageRes.text();
  let parsed = parseGitHubPublicHtml(sourceHtml, cleanUser);

  if (parsed.rawRepos.length < 2) {
    const allPageRes = await fetch(
      `https://github.com/${encodeURIComponent(cleanUser)}?tab=repositories`,
      { headers: webHeaders }
    ).catch(() => null);
    if (allPageRes && allPageRes.ok) {
      const allParsed = parseGitHubPublicHtml(await allPageRes.text(), cleanUser);
      if (allParsed.rawRepos.length > parsed.rawRepos.length) {
        parsed = allParsed;
      }
    }
  }

  const atomXml = atomRes && atomRes.ok ? await atomRes.text() : '';
  const rawEvents = atomXml ? parseAtomActivity(atomXml) : [];

  return buildAnalysisResult({
    rawUser: parsed.rawUser,
    rawRepos: parsed.rawRepos,
    rawEvents,
    profileReadmeExcerpt: profileReadmeText || undefined,
    allowApiLanguages: false,
  });
}

export async function analyzeGitHubUser(username: string): Promise<GitHubAnalysisResult> {
  const cleanUser = username.trim().replace(/^@/, '');
  if (!cleanUser || !/^[a-zA-Z0-9-]+$/.test(cleanUser)) {
    throw new Error('Please enter a valid GitHub username (letters, numbers, and hyphens only).');
  }

  const cacheKey = cleanUser.toLowerCase();
  const memCached = analysisCache.get(cacheKey);
  if (memCached && memCached.expiresAt > Date.now()) {
    return memCached.result;
  }

  const diskCached = readDiskCacheEntry(cacheKey, false);
  if (diskCached) {
    analysisCache.set(cacheKey, {
      result: diskCached,
      expiresAt: Date.now() + ANALYSIS_CACHE_TTL_MS,
    });
    return diskCached;
  }

  const headers = getGitHubHeaders(false);

  try {
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
      headers,
    });

    if (userRes.status === 404) {
      throw new Error(`GitHub user "${cleanUser}" was not found.`);
    }

    let result: GitHubAnalysisResult;

    if (userRes.status === 403 || userRes.status === 429) {
      result = await analyzeGitHubFromPublicWeb(cleanUser);
    } else {
      if (!userRes.ok) {
        throw new Error(`GitHub API error (${userRes.status}) while loading profile.`);
      }

      const remainingHeader = userRes.headers.get('x-ratelimit-remaining');
      const rateLimitRemaining =
        remainingHeader !== null ? Number.parseInt(remainingHeader, 10) : 60;
      const allowApiLanguages = Number.isNaN(rateLimitRemaining) || rateLimitRemaining >= 10;

      const rawUser = (await userRes.json()) as RawGitHubUser;

      const [reposRes, eventsRes, rawProfileReadme] = await Promise.all([
        fetch(
          `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=pushed`,
          { headers }
        ),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(cleanUser)}/events/public?per_page=30`,
          { headers }
        ),
        fetchRawReadme(`${cleanUser}/${cleanUser}`),
      ]);

      if (reposRes.status === 403 || reposRes.status === 429) {
        result = await analyzeGitHubFromPublicWeb(cleanUser);
      } else {
        const rawRepos: RawGitHubRepo[] = reposRes.ok
          ? ((await reposRes.json()) as RawGitHubRepo[])
          : [];
        const rawEvents: RawGitHubEvent[] = eventsRes.ok
          ? ((await eventsRes.json()) as RawGitHubEvent[])
          : [];

        result = await buildAnalysisResult({
          rawUser,
          rawRepos,
          rawEvents,
          profileReadmeExcerpt: rawProfileReadme || undefined,
          allowApiLanguages,
        });
      }
    }

    const expiresAt = Date.now() + ANALYSIS_CACHE_TTL_MS;
    analysisCache.set(cacheKey, { result, expiresAt });
    writeDiskCacheEntry(cacheKey, result, expiresAt);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('was not found') && !msg.includes('valid GitHub username')) {
      const stale = readDiskCacheEntry(cacheKey, true);
      if (stale) return stale;
    }
    throw err;
  }
}
