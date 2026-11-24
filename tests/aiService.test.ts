import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractReadableAIError,
  isAIConfigured,
  isTransientError,
  optimizePortfolioWithAI,
} from '../server/services/aiService.ts';

describe('aiService', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('detects AI configuration status properly', () => {
    delete process.env.GEMINI_API_KEY;
    assert.equal(isAIConfigured(), false);

    process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';
    assert.equal(isAIConfigured(), false);

    process.env.GEMINI_API_KEY = 'AIzaSyTestRealLookingKey123';
    assert.equal(isAIConfigured(), true);
  });

  it('identifies transient Gemini / network errors', () => {
    assert.equal(isTransientError(new Error('503 UNAVAILABLE')), true);
    assert.equal(isTransientError(new Error('429 RESOURCE_EXHAUSTED')), true);
    assert.equal(isTransientError(new Error('fetch failed')), true);
    assert.equal(isTransientError(new Error('400 Invalid argument')), false);
  });

  it('extracts friendly error messages from raw Gemini 503 JSON errors', () => {
    const rawJsonErr = new Error(
      'Got status: 503 {"error":{"code":503,"message":"This model is currently experiencing high demand.","status":"UNAVAILABLE"}}'
    );
    const parsed = extractReadableAIError(rawJsonErr);
    assert.ok(parsed.includes('temporary traffic spike'));
  });

  it('throws clear error when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    await assert.rejects(
      () =>
        optimizePortfolioWithAI({
          profile: {
            login: 'dev',
            name: 'Dev',
            avatarUrl: 'https://github.com/dev.png',
            bio: null,
            company: null,
            location: null,
            blog: null,
            htmlUrl: 'https://github.com/dev',
            publicRepos: 1,
            followers: 0,
            following: 0,
            createdAt: '2024-01-01T00:00:00Z',
          },
          topRepos: [],
          languages: [],
          activity: {
            recentEventsCount: 0,
            pushEventsCount: 0,
            prEventsCount: 0,
            activeDaysLast30: 0,
            totalStars: 0,
            totalForks: 0,
            primaryLanguage: 'TypeScript',
            inferredFocus: 'Software Engineering',
            accountYears: 1,
          },
        }),
      /GEMINI_API_KEY is not configured/
    );
  });
});
