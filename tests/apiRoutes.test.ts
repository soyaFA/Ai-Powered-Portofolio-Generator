import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import express from 'express';
import { apiRouter } from '../server/routes/api.ts';
import { setDataDirForTesting } from '../server/db.ts';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folioforge-api-test-'));

describe('Express API routes integration', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    setDataDirForTesting(tmpDir);
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}/api`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('serves /api/health publicly and blocks protected routes without auth', async () => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    const body = (await health.json()) as { status: string; database: string };
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'local-store');

    const unauthPortfolios = await fetch(`${baseUrl}/portfolios`);
    assert.equal(unauthPortfolios.status, 401);

    const unauthAnalyze = await fetch(`${baseUrl}/github/analyze/gaearon`);
    assert.equal(unauthAnalyze.status, 401);
  });

  it('validates registration, prevents duplicates, and supports login + /auth/me + CRUD ownership', async () => {
    
    const badReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'bad-email', password: '123' }),
    });
    assert.equal(badReg.status, 400);

    
    const regA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Developer A',
        email: 'deva@example.com',
        password: 'password123',
        githubUsername: 'gaearon',
      }),
    });
    assert.equal(regA.status, 201);
    const authA = (await regA.json()) as { token: string; user: { id: string; email: string } };
    assert.ok(authA.token);

  
    const dupReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Developer A2',
        email: 'deva@example.com',
        password: 'password123',
      }),
    });
    assert.equal(dupReg.status, 409);

   
    const badLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deva@example.com', password: 'wrong' }),
    });
    assert.equal(badLogin.status, 401);

    
    const goodLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deva@example.com', password: 'password123' }),
    });
    assert.equal(goodLogin.status, 200);

    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert.equal(meRes.status, 200);

   
    const regB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Developer B',
        email: 'devb@example.com',
        password: 'password123',
      }),
    });
    const authB = (await regB.json()) as { token: string };

   
    const createRes = await fetch(`${baseUrl}/portfolios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        username: 'gaearon',
        templateId: 'editorial',
        careerTrack: 'Frontend Engineering',
        accentColor: '#2563EB',
        profile: {
          login: 'gaearon',
          name: 'Dan Abramov',
          avatarUrl: 'https://github.com/gaearon.png',
          bio: null,
          company: null,
          location: null,
          blog: null,
          htmlUrl: 'https://github.com/gaearon',
          publicRepos: 10,
          followers: 100,
          following: 0,
          createdAt: '2015-01-01T00:00:00Z',
        },
        topRepos: [],
        languages: [],
        activity: {
          recentEventsCount: 1,
          pushEventsCount: 1,
          prEventsCount: 0,
          activeDaysLast30: 1,
          totalStars: 50,
          totalForks: 5,
          primaryLanguage: 'JavaScript',
          inferredFocus: 'Frontend Engineering',
          accountYears: 9,
        },
        aiContent: {
          headline: 'Frontend Engineer',
          bio: 'React tools',
          pitchSummary: 'UI engineering',
          highlightedSkills: ['JavaScript', 'React'],
          projectNarratives: {},
          generatedAt: new Date().toISOString(),
          modelUsed: 'test',
        },
        customEmail: '',
        availableForHire: true,
      }),
    });
    assert.equal(createRes.status, 201);
    const created = (await createRes.json()) as { id: string; userId: string };
    assert.equal(created.userId, authA.user.id);

   
    const bGet = await fetch(`${baseUrl}/portfolios/${created.id}`, {
      headers: { Authorization: `Bearer ${authB.token}` },
    });
    assert.equal(bGet.status, 403);


    const aPut = await fetch(`${baseUrl}/portfolios/${created.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({ templateId: 'bento' }),
    });
    assert.equal(aPut.status, 200);
    const updated = (await aPut.json()) as { templateId: string };
    assert.equal(updated.templateId, 'bento');

    const aDel = await fetch(`${baseUrl}/portfolios/${created.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert.equal(aDel.status, 200);
  });
});
