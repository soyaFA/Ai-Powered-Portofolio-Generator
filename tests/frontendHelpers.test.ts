import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatCoreStack, formatRepoLanguages } from '../src/utils/portfolioHelpers.ts';
import { generateStandaloneHtml } from '../src/utils/exportHtml.ts';
import type { PortfolioDocument, TemplateId } from '../src/types/portfolio.ts';

function createSamplePortfolio(templateId: TemplateId = 'editorial'): PortfolioDocument {
  return {
    id: 'p1',
    userId: 'u1',
    username: 'juniordev',
    templateId,
    careerTrack: 'Full-Stack Web Engineering',
    accentColor: '#2563EB',
    profile: {
      login: 'juniordev',
      name: 'Omar <script>alert(1)</script>',
      avatarUrl: 'https://github.com/juniordev.png',
      bio: 'Builds Node.js & React applications',
      company: null,
      location: 'Cairo',
      blog: 'https://juniordev.dev',
      htmlUrl: 'https://github.com/juniordev',
      publicRepos: 8,
      followers: 25,
      following: 12,
      createdAt: '2022-05-01T00:00:00Z',
    },
    topRepos: [
      {
        id: 101,
        name: 'task-api',
        fullName: 'juniordev/task-api',
        description: 'Express REST API with MongoDB',
        htmlUrl: 'https://github.com/juniordev/task-api',
        homepage: 'https://task-api.example.com',
        language: 'TypeScript',
        repoLanguages: ['TypeScript', 'JavaScript'],
        topics: ['nodejs', 'mongodb'],
        stars: 14,
        forks: 3,
        watchers: 14,
        openIssues: 0,
        updatedAt: '2026-11-01T00:00:00Z',
        pushedAt: '2026-11-01T00:00:00Z',
        isFork: false,
        relevanceScore: 95,
      },
    ],
    languages: [
      { language: 'TypeScript', repoCount: 5, percentage: 60, color: '#3178C6' },
      { language: 'JavaScript', repoCount: 3, percentage: 40, color: '#EAB308' },
    ],
    activity: {
      recentEventsCount: 10,
      pushEventsCount: 8,
      prEventsCount: 2,
      activeDaysLast30: 6,
      totalStars: 14,
      totalForks: 3,
      primaryLanguage: 'TypeScript',
      topLanguages: ['TypeScript', 'JavaScript'],
      inferredFocus: 'Full-Stack Web Engineering',
      accountYears: 4.5,
    },
    aiContent: {
      headline: 'Full-Stack TypeScript & MongoDB Engineer',
      bio: 'Ships reliable REST APIs and React interfaces.',
      pitchSummary: 'Focused on clean schemas and tests.',
      highlightedSkills: ['TypeScript', 'Node.js', 'MongoDB', 'React'],
      projectNarratives: {
        'task-api': {
          repoName: 'task-api',
          technicalHighlight: 'Express + Mongoose + Docker',
          impactSummary: 'Built a typed task service with automated validation.',
        },
      },
      generatedAt: '2026-11-16T00:00:00Z',
      modelUsed: 'gemini-4-hydrogen',
    },
    customEmail: 'omar@example.com',
    availableForHire: true,
    createdAt: '2026-11-16T00:00:00Z',
    updatedAt: '2026-11-16T00:00:00Z',
  };
}

describe('frontend portfolioHelpers & exportHtml', () => {
  it('formats multi-language core stack and repo languages cleanly', () => {
    const doc = createSamplePortfolio();
    assert.equal(formatCoreStack(doc.activity, doc.languages), 'TypeScript · JavaScript');
    assert.equal(formatRepoLanguages(doc.topRepos[0]), 'TypeScript · JavaScript');

    const fallbackCore = formatCoreStack(
      { ...doc.activity, topLanguages: undefined, primaryLanguage: 'Python' },
      []
    );
    assert.equal(fallbackCore, 'Python');
  });

  it('escapes HTML injection and generates valid standalone HTML across all 12 templates', () => {
    const templates: TemplateId[] = [
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
    ];

    for (const tpl of templates) {
      const html = generateStandaloneHtml(createSamplePortfolio(tpl));
      assert.ok(html.startsWith('<!doctype html>'), `Expected doctype for ${tpl}`);
      assert.ok(html.includes('task-api'), `Expected repo name in ${tpl}`);
      assert.ok(html.includes('Full-Stack TypeScript &amp; MongoDB Engineer'));
      assert.equal(html.includes('<script>alert(1)</script>'), false, `XSS should be escaped in ${tpl}`);
      assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    }
  });
});
