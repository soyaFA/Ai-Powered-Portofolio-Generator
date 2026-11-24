import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  analyzeGitHubUser,
  cleanReadmeText,
  clearGitHubCache,
  computeRecencyMultiplier,
  computeRepoRelevance,
  decodeHtmlEntities,
  extractTechStack,
  inferEngineeringFocus,
  parseCompactCount,
  parseGitHubPublicHtml,
  setGitHubCacheDir,
  type RawGitHubRepo,
} from '../server/services/githubService.ts';

describe('githubService helpers & analyzer', () => {
  let tmpCacheDir: string;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    tmpCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folioforge-gh-test-'));
    setGitHubCacheDir(tmpCacheDir);
    clearGitHubCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    fs.rmSync(tmpCacheDir, { recursive: true, force: true });
  });

  it('decodes HTML entities and parses compact GitHub counters', () => {
    assert.equal(decodeHtmlEntities('React &amp; Node.js &lt;TS&gt;'), 'React & Node.js <TS>');
    assert.equal(parseCompactCount('85.7k'), 85700);
    assert.equal(parseCompactCount('1.1k'), 1100);
    assert.equal(parseCompactCount('5,290'), 5290);
    assert.equal(parseCompactCount(''), 0);
  });

  it('computes recency multipliers accurately and halves archived repos', () => {
    const now = new Date().toISOString();
    const twoHundredDaysAgo = new Date(Date.now() - 200 * 86400000).toISOString();
    const threeYearsAgo = new Date(Date.now() - 1100 * 86400000).toISOString();

    assert.equal(computeRecencyMultiplier(now, now, false), 1.75);
    assert.equal(computeRecencyMultiplier(twoHundredDaysAgo, twoHundredDaysAgo, false), 1.25);
    assert.equal(computeRecencyMultiplier(threeYearsAgo, threeYearsAgo, false), 0.5);
    assert.equal(computeRecencyMultiplier(now, now, true), 0.875);
  });

  it('cleans markdown badges/code blocks and extracts tech stack tokens', () => {
    const raw = `
# Project Title
![build](https://img.shields.io/badge/build-passing-green)
Built with **React**, **Express**, and **MongoDB** inside [Docker](https://docker.com).
\`\`\`ts
console.log('ignored');
\`\`\`
`;
    const cleaned = cleanReadmeText(raw);
    assert.ok(cleaned.includes('React'));
    assert.equal(cleaned.includes('console.log'), false);
    assert.equal(cleaned.includes('img.shields.io'), false);

    const stack = extractTechStack([cleaned], ['TypeScript']);
    assert.ok(stack.includes('TypeScript'));
    assert.ok(stack.includes('React'));
    assert.ok(stack.includes('Express'));
    assert.ok(stack.includes('MongoDB'));
    assert.ok(stack.includes('Docker'));
  });

  it('excludes username/username profile README repo and ranks original builds above forks', () => {
    const now = new Date().toISOString();
    const base: Omit<RawGitHubRepo, 'id' | 'name' | 'full_name' | 'fork' | 'stargazers_count'> = {
      description: 'Full-stack task manager with Express and MongoDB',
      html_url: 'https://github.com/dev/repo',
      homepage: 'https://demo.dev',
      language: 'TypeScript',
      topics: ['express', 'mongodb'],
      forks_count: 2,
      watchers_count: 5,
      open_issues_count: 0,
      size: 200,
      updated_at: now,
      pushed_at: now,
      archived: false,
    };

    const profileRepo: RawGitHubRepo = { ...base, id: 1, name: 'dev', full_name: 'dev/dev', fork: false, stargazers_count: 50 };
    const originalRepo: RawGitHubRepo = { ...base, id: 2, name: 'task-api', full_name: 'dev/task-api', fork: false, stargazers_count: 10 };
    const forkedRepo: RawGitHubRepo = { ...base, id: 3, name: 'forked-lib', full_name: 'dev/forked-lib', fork: true, stargazers_count: 10 };

    assert.equal(computeRepoRelevance(profileRepo, 'dev'), -500);
    assert.ok(computeRepoRelevance(originalRepo, 'dev') > computeRepoRelevance(forkedRepo, 'dev'));
  });

  it('infers Full-Stack, Frontend, and Python Data/AI focus accurately', () => {
    const fullStack = inferEngineeringFocus(
      [
        { language: 'TypeScript', repoCount: 4, percentage: 55, color: '#3178C6' },
        { language: 'HTML', repoCount: 3, percentage: 25, color: '#E34C26' },
        { language: 'CSS', repoCount: 3, percentage: 20, color: '#563D7C' },
      ],
      ['React', 'Express', 'MongoDB'],
      []
    );
    assert.equal(fullStack, 'Full-Stack Web Engineering');

    const frontendOnly = inferEngineeringFocus(
      [
        { language: 'JavaScript', repoCount: 4, percentage: 60, color: '#EAB308' },
        { language: 'CSS', repoCount: 4, percentage: 40, color: '#563D7C' },
      ],
      ['React', 'Tailwind CSS'],
      []
    );
    assert.equal(frontendOnly, 'Frontend & UI Engineering');
  });

  it('rejects invalid GitHub usernames', async () => {
    await assert.rejects(() => analyzeGitHubUser('invalid user!'), /valid GitHub username/i);
    await assert.rejects(() => analyzeGitHubUser('   '), /valid GitHub username/i);
  });

  it('falls back seamlessly to public GitHub HTML + Atom feed when api.github.com returns 403 rate limit', async () => {
    const sampleHtml = `
      <html>
        <body>
          <span itemprop="name">Jane Junior</span>
          <div data-bio-text>Building web apps with JavaScript &amp; MongoDB</div>
          <img src="https://avatars.githubusercontent.com/u/99999?v=4" />
          <a href="/jane?tab=followers"><span>120</span> followers</a>
          <a href="/jane?tab=repositories"><span class="Counter">4</span></a>
          <ul>
            <li itemprop="owns">
              <a itemprop="name codeRepository">mern-tracker</a>
              <p itemprop="description">REST API with Express &amp; React</p>
              <span itemprop="programmingLanguage">JavaScript</span>
              <a href="/jane/mern-tracker/stargazers"><svg></svg>14</a>
              <a href="/jane/mern-tracker/forks"><svg></svg>3</a>
              <relative-time datetime="2026-11-10T10:00:00Z"></relative-time>
            </li>
            <li itemprop="owns">
              <a itemprop="name codeRepository">portfolio-ui</a>
              <p itemprop="description">Responsive portfolio layout</p>
              <span itemprop="programmingLanguage">TypeScript</span>
              <a href="/jane/portfolio-ui/stargazers"><svg></svg>5</a>
              <relative-time datetime="2026-11-01T10:00:00Z"></relative-time>
            </li>
          </ul>
        </body>
      </html>
    `;

    const parsed = parseGitHubPublicHtml(sampleHtml, 'jane');
    assert.equal(parsed.rawUser.name, 'Jane Junior');
    assert.equal(parsed.rawUser.followers, 120);
    assert.equal(parsed.rawRepos.length, 2);
    assert.equal(parsed.rawRepos[0].name, 'mern-tracker');
    assert.equal(parsed.rawRepos[0].language, 'JavaScript');

    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.startsWith('https://api.github.com/')) {
        return new Response(JSON.stringify({ message: 'API rate limit exceeded' }), {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1799999999' },
        });
      }
      if (url.includes('github.com/jane?tab=repositories')) {
        return new Response(sampleHtml, { status: 200 });
      }
      if (url.includes('github.com/jane.atom')) {
        return new Response(
          '<feed><entry><published>2026-11-15T12:00:00Z</published><title>pushed to main</title></entry></feed>',
          { status: 200 }
        );
      }
      if (url.includes('raw.githubusercontent.com/jane/mern-tracker/HEAD/README.md')) {
        return new Response('# MERN Tracker\nBuilt with React, Node.js, Express, and MongoDB.', {
          status: 200,
        });
      }
      return new Response('Not Found', { status: 404 });
    }) as typeof fetch;

    const analysis = await analyzeGitHubUser('jane');
    assert.equal(analysis.profile.login, 'jane');
    assert.equal(analysis.profile.name, 'Jane Junior');
    assert.equal(analysis.topRepos.length, 2);
    assert.ok(analysis.activity.detectedTechnologies?.includes('MongoDB'));
    assert.equal(analysis.activity.pushEventsCount, 1);
  });
});
