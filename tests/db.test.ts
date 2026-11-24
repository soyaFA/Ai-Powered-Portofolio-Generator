import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  portfolioRepository,
  setDataDirForTesting,
  toPublicUser,
  userRepository,
} from '../server/db.ts';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folioforge-db-test-'));

function buildSamplePayload(userId: string, username: string) {
  return {
    userId,
    username,
    templateId: 'editorial' as const,
    careerTrack: 'Full-Stack Web Engineering',
    accentColor: '#2563EB',
    profile: {
      login: username,
      name: username,
      avatarUrl: `https://github.com/${username}.png`,
      bio: 'Developer',
      company: null,
      location: null,
      blog: null,
      htmlUrl: `https://github.com/${username}`,
      publicRepos: 5,
      followers: 10,
      following: 5,
      createdAt: '2023-01-01T00:00:00Z',
    },
    topRepos: [],
    languages: [],
    activity: {
      recentEventsCount: 3,
      pushEventsCount: 3,
      prEventsCount: 0,
      activeDaysLast30: 2,
      totalStars: 12,
      totalForks: 2,
      primaryLanguage: 'TypeScript',
      topLanguages: ['TypeScript'],
      inferredFocus: 'Full-Stack Web Engineering',
      accountYears: 2,
    },
    aiContent: {
      headline: 'TypeScript Engineer',
      bio: 'Builds clean APIs',
      pitchSummary: 'Focused on web apps',
      highlightedSkills: ['TypeScript'],
      projectNarratives: {},
      generatedAt: new Date().toISOString(),
      modelUsed: 'test',
    },
    customEmail: '',
    availableForHire: true,
  };
}

describe('db repositories & user ownership isolation', () => {
  before(() => {
    setDataDirForTesting(tmpDir);
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates users, finds by email case-insensitively, and strips passwordHash in toPublicUser', async () => {
    const user = await userRepository.create({
      name: 'Nour Ali',
      email: 'Nour@Example.com',
      passwordHash: 'salt:secret-hash',
      githubUsername: 'nourdev',
    });

    assert.equal(user.email, 'nour@example.com');
    assert.equal(user.githubUsername, 'nourdev');

    const foundByEmail = await userRepository.findByEmail('NOUR@example.com');
    assert.ok(foundByEmail);
    assert.equal(foundByEmail.id, user.id);

    const foundById = await userRepository.findById(user.id);
    assert.ok(foundById);
    assert.equal(foundById.name, 'Nour Ali');

    const pub = toPublicUser(user);
    assert.equal('passwordHash' in pub, false);
    assert.equal(pub.email, 'nour@example.com');
  });

  it('isolates portfolios per userId and enforces ownership across find/update/remove', async () => {
    const userA = await userRepository.create({
      name: 'User A',
      email: 'a@test.com',
      passwordHash: 's:h',
    });
    const userB = await userRepository.create({
      name: 'User B',
      email: 'b@test.com',
      passwordHash: 's:h',
    });

    const pA = await portfolioRepository.create(buildSamplePayload(userA.id, 'gaearon'));
    const pB = await portfolioRepository.create(buildSamplePayload(userB.id, 'tj'));

    const listA = await portfolioRepository.findAllByUser(userA.id);
    const listB = await portfolioRepository.findAllByUser(userB.id);
    assert.equal(listA.length, 1);
    assert.equal(listA[0].id, pA.id);
    assert.equal(listB.length, 1);
    assert.equal(listB[0].id, pB.id);

   
    const crossGet = await portfolioRepository.findByIdForUser(pA.id, userB.id);
    assert.equal(crossGet.status, 'forbidden');

    const crossUpdate = await portfolioRepository.updateForUser(pA.id, userB.id, {
      templateId: 'terminal',
    });
    assert.equal(crossUpdate.status, 'forbidden');

    const crossDelete = await portfolioRepository.removeForUser(pA.id, userB.id);
    assert.equal(crossDelete, 'forbidden');

   
    const missingGet = await portfolioRepository.findByIdForUser('non-existent', userA.id);
    assert.equal(missingGet.status, 'not_found');


    const ownUpdate = await portfolioRepository.updateForUser(pA.id, userA.id, {
      templateId: 'terminal',
    });
    assert.equal(ownUpdate.status, 'ok');
    if (ownUpdate.status === 'ok') {
      assert.equal(ownUpdate.doc.templateId, 'terminal');
    }

    const ownDelete = await portfolioRepository.removeForUser(pA.id, userA.id);
    assert.equal(ownDelete, 'ok');
    assert.equal((await portfolioRepository.findAllByUser(userA.id)).length, 0);
  });
});
